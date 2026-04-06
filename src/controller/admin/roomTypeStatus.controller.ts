import { Request, Response, NextFunction } from 'express';
import db, { acquireLock, releaseLock } from '../../config/db';
import roomTypeStatusHistory from '../../db/schema/room_type_status_history';
import { and, asc, desc, eq, gt, gte, inArray, isNotNull, isNull, lt, lte, or, sql } from 'drizzle-orm';
import { StatusBaseSchema, StatusCreateInputSchema, StatusCreateSchema, StatusUpdateSchema } from '../../schema/status.schema';
import roomStatusTypes from '../../db/schema/room_status_types';
import roomTypes from '../../db/schema/room_types';
import { AppError } from '../../error/AppError';



export const getRoomTypeStatus = async (req: Request, res: Response) => {
    const date = new Date()
    const subQueryMaxPriority = await db
        .select({
            roomTypeId: roomTypeStatusHistory.roomTypeId,
            maxPriority: sql<Date>`MAX(${roomStatusTypes.priority})`.as("maxPriority")
        })
        .from(roomTypeStatusHistory)
        .where(
            and(
                lte(roomTypeStatusHistory.startDate, date),
                or(
                    isNull(roomTypeStatusHistory.endDate),
                    gt(roomTypeStatusHistory.endDate, date)
                )
            )
        ).innerJoin(roomStatusTypes,
            eq(roomTypeStatusHistory.statusTypeId, roomStatusTypes.id)
        )
        .groupBy(roomTypeStatusHistory.roomTypeId)
        .as("al")
    const currentStatus = await db
        .select({
            roomTypeId: roomTypes.id,
            roomTypeName: roomTypes.name,
            status: roomStatusTypes.name,
            startDate: roomTypeStatusHistory.startDate,
            endDate: roomTypeStatusHistory.endDate
        })
        .from(roomTypeStatusHistory)
        .where(
            and(
                lte(roomTypeStatusHistory.startDate, date),
                or(
                    isNull(roomTypeStatusHistory.endDate),
                    gt(roomTypeStatusHistory.endDate, date)
                )
            )
        )
        .innerJoin(roomStatusTypes,
            eq(roomStatusTypes.id, roomTypeStatusHistory.statusTypeId)
        )
        .innerJoin(subQueryMaxPriority,
            and(
                eq(roomTypeStatusHistory.roomTypeId, subQueryMaxPriority.roomTypeId),
                eq(roomStatusTypes.priority, subQueryMaxPriority.maxPriority)
            )
        )
        .rightJoin(roomTypes,
            eq(roomTypes.id, roomTypeStatusHistory.roomTypeId)
        ).orderBy(roomTypes.id);
    if (!currentStatus.length) {
        throw new AppError("Current room status not found", 404)
    }
    res.json(currentStatus)
}


export const getRoomTypeStatusById = async (req: Request, res: Response) => {
    const roomTypeId: number = Number(req.params.roomTypeId)
    const statusQuery = await db.select({
        roomTypeId: roomTypeStatusHistory.roomTypeId,
        statusHistoryId: roomTypeStatusHistory.id,
        statusName: roomStatusTypes.name,
        startDate: roomTypeStatusHistory.startDate,
        endDate: roomTypeStatusHistory.endDate
    }).from(roomTypeStatusHistory)
        .where(eq(roomTypeStatusHistory.roomTypeId, roomTypeId))
        .innerJoin(roomStatusTypes, eq(roomStatusTypes.id, roomTypeStatusHistory.statusTypeId))
        .orderBy(desc(roomTypeStatusHistory.startDate))
    const statusFormat = statusQuery.map((n) =>
    ({
        ...n,
        startDate: n.startDate.toISOString(),
        endDate: n.endDate ? n.endDate.toISOString() : null
    })
    )
    if (!statusQuery.length) {
        throw new AppError("No status found for this RoomType", 404)
    }
    if (res.locals.message) {
        return res.json({
            message: res.locals.message,
            status: statusFormat
        })
    }
    res.json(statusFormat)
}


export const createRoomTypeStatus = async (req: Request, res: Response, next: NextFunction) => {
    const body: StatusCreateInputSchema = req.body
    const admin = req.admin
    if (!admin) {
        throw new AppError("not found admin data in req.admin", 404)
    }
    const statusHistory: StatusCreateSchema = {
        createdBy: admin.uuid,
        updatedBy: admin.uuid,
        ...body
    }
    const roomTypeId: number = Number(req.params.roomTypeId)
    const lockName: string = `roomType${roomTypeId}`
    let lockConn = null
    lockConn = await acquireLock(lockName)
    let overLappingStatus: any = []
    const priority = (await db
        .select({
            prioritynumber: roomStatusTypes.priority
        })
        .from(roomStatusTypes)
        .where(
            eq(roomStatusTypes.id, body.statusTypeId)
        ))[0]
    try {
        if (body.endDate) {
            overLappingStatus = await db
                .select({
                    startDate: roomTypeStatusHistory.startDate,
                    endDate: roomTypeStatusHistory.endDate,
                    statusId: roomTypeStatusHistory.statusTypeId,
                    status: roomStatusTypes.name
                })
                .from(roomTypeStatusHistory)
                .where(
                    and(
                        eq(roomTypeStatusHistory.roomTypeId, roomTypeId),
                        lt(roomTypeStatusHistory.startDate, body.endDate),
                        gte(roomTypeStatusHistory.endDate, body.endDate)
                    )
                )
                .innerJoin(roomStatusTypes,
                    and(
                        eq(roomStatusTypes.id, roomTypeStatusHistory.statusTypeId),
                        gte(roomStatusTypes.priority, priority.prioritynumber)
                    )
                ).orderBy(asc(roomTypeStatusHistory.startDate));
        };
        if (!body.endDate) {
            overLappingStatus = await db
                .select({
                    startDate: roomTypeStatusHistory.startDate,
                    endDate: roomTypeStatusHistory.endDate,
                    statusId: roomTypeStatusHistory.statusTypeId,
                    status: roomStatusTypes.name
                })
                .from(roomTypeStatusHistory)
                .where(
                    and(
                        eq(roomTypeStatusHistory.roomTypeId, roomTypeId),
                        or(
                            and(
                                lte(roomTypeStatusHistory.startDate, body.startDate),
                                gt(roomTypeStatusHistory.endDate, body.startDate)
                            ),
                            and(
                                eq(roomTypeStatusHistory.startDate, body.startDate),
                                isNull(roomTypeStatusHistory.endDate)
                            )
                        )
                    )
                )
                .innerJoin(roomStatusTypes,
                    and(
                        eq(roomStatusTypes.id, roomTypeStatusHistory.statusTypeId),
                        gte(roomStatusTypes.priority, priority.prioritynumber)
                    )
                ).orderBy(asc(roomTypeStatusHistory.startDate));
        };
        if (overLappingStatus.length > 0) {
            for (let i: number = 0; i < overLappingStatus.length; i++) {
                const endDateStr = overLappingStatus[i].endDate
                    ? overLappingStatus[i].endDate?.toISOString().split("T")[0]
                    : "ongoing"
                if (overLappingStatus[i].statusId === body.statusTypeId) {
                    const message = `Can't set this status.Because this status overlaps with the existing ${overLappingStatus[i].status} status, which starting on ${overLappingStatus[i].startDate.toISOString().split("T")[0]} ${endDateStr === "ongoing" ? "and is still ongoing" : `to ${endDateStr}`}. Please resolve the overlapping status before setting this status.`
                    throw new AppError(message, 404)
                }
                res.locals.message = `This status has lower priority than the existing ${overLappingStatus[i].status} status, which starting on ${overLappingStatus[i].startDate.toISOString().split("T")[0]} ${endDateStr === "ongoing" ? "and is still ongoing" : `to ${endDateStr}`}. Please ensure it works correctly.`
            }
        }
        const insertStatusHistory = await db
            .insert(roomTypeStatusHistory)
            .values({ roomTypeId, ...statusHistory })
        next()
    } finally {
        if (lockConn) {
            await releaseLock(lockConn, lockName)
        }
    }
}


export const updateRoomTypeStatus = async (req: Request, res: Response, next: NextFunction) => {
    const body: StatusBaseSchema = req.body
    const statusHistoryId: number = Number(req.params.statusHistoryId)
    const roomTypeId: number = Number(req.params.roomTypeId)
    const lockName: string = `roomType${roomTypeId}`
    let lockConn = null
    lockConn = await acquireLock(lockName)
    const result = await db.update(roomTypeStatusHistory)
        .set(body)
        .where(eq(roomTypeStatusHistory.id, statusHistoryId))
    if (lockConn) {
        await releaseLock(lockConn, lockName)
    }
    next()
}


export const deleteRoomTypeStatus = async (req: Request, res: Response, next: NextFunction) => {
    const statusHistoryId: number = Number(req.params.statusHistoryId)
    const roomTypeId: number = Number(req.params.roomTypeId)
    const lockName: string = `roomType${roomTypeId}`
    let lockConn = null
    lockConn = await acquireLock(lockName)
    const result = await db.delete(roomTypeStatusHistory)
        .where(eq(roomTypeStatusHistory.id, statusHistoryId))
    if (lockConn) {
        await releaseLock(lockConn, lockName)
    }
    res.locals.message = "Delete complete"
    next()
}
