import { Request, Response, NextFunction } from 'express';
import db, { acquireLock, releaseLock } from '../../config/db';
import roomTypeStatusHistory from '../../db/schema/room_type_status_history';
import { and, asc, desc, eq, gt, gte, inArray, isNotNull, isNull, lt, lte, or, sql } from 'drizzle-orm';
import { StatusBaseSchema, StatusCreateInputSchema, StatusCreateSchema, StatusUpdateSchema } from '../../schema/status.schema';
import roomStatusTypes from '../../db/schema/room_status_types';
import roomTypes from '../../db/schema/room_types';
import { AppError } from '../../error/AppError';
import { checkOverlapConflict, getOverlappingStatus } from '../../utils/statusOverlap';



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
    const priority = (await db
        .select({
            prioritynumber: roomStatusTypes.priority
        })
        .from(roomStatusTypes)
        .where(
            eq(roomStatusTypes.id, body.statusTypeId)
        ))[0]
    try {
        const overLappingStatus = await getOverlappingStatus(
            body,
            priority.prioritynumber,
            roomTypeId
        ) ?? []
        if (overLappingStatus.length > 0) {
            checkOverlapConflict(overLappingStatus, body.statusTypeId, res)
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
    const body: StatusCreateInputSchema = req.body
    const statusHistoryId: number = Number(req.params.statusHistoryId)
    const roomTypeId: number = Number(req.params.roomTypeId)
    const lockName: string = `roomType${roomTypeId}`
    let lockConn = null
    lockConn = await acquireLock(lockName)
    let overLappingStatus: any = []
    const existsRoomTypeStatus = await db.select({ id: roomTypeStatusHistory.id })
        .from(roomTypeStatusHistory)
        .where(eq(roomTypeStatusHistory.id, statusHistoryId))
        .limit(1)
    if (existsRoomTypeStatus.length === 0) {
        throw new AppError("Room Type ID not found", 404)
    }
    try {
        const priority = (await db
            .select({
                prioritynumber: roomStatusTypes.priority
            })
            .from(roomStatusTypes)
            .where(
                eq(roomStatusTypes.id, body.statusTypeId)
            ))[0]
        const overLappingStatus = await getOverlappingStatus(
            body,
            priority.prioritynumber,
            roomTypeId
        ) ?? []
        if (overLappingStatus.length > 0) {
            checkOverlapConflict(overLappingStatus, body.statusTypeId, res)
        }
        const result = await db.update(roomTypeStatusHistory)
            .set(body)
            .where(eq(roomTypeStatusHistory.id, statusHistoryId))
        next()
    } finally {
        if (lockConn) {
            await releaseLock(lockConn, lockName)
        }
    }
}


export const deleteRoomTypeStatus = async (req: Request, res: Response, next: NextFunction) => {
    const statusHistoryId: number = Number(req.params.statusHistoryId)
    const roomTypeId: number = Number(req.params.roomTypeId)
    const lockName: string = `roomType${roomTypeId}`
    let lockConn = null
    lockConn = await acquireLock(lockName)
    try {
        const existsRoomTypeStatus = await db.select({ id: roomTypeStatusHistory.id })
            .from(roomTypeStatusHistory)
            .where(eq(roomTypeStatusHistory.id, statusHistoryId))
            .limit(1)
        if (existsRoomTypeStatus.length === 0) {
            throw new AppError("Room Type ID not found", 404)
        }
        const result = await db.delete(roomTypeStatusHistory)
            .where(eq(roomTypeStatusHistory.id, statusHistoryId))

        res.locals.message = "Delete complete"
        next()
    } finally {
        if (lockConn) {
            await releaseLock(lockConn, lockName)
        }
    }
}
