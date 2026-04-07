import { and, asc, eq, gt, gte, isNull, lt, lte, or } from "drizzle-orm";
import db from "../config/db";
import roomStatusTypes from "../db/schema/room_status_types";
import roomTypeStatusHistory from "../db/schema/room_type_status_history";
import { overLappingStatusArray, StatusCreateInputSchema } from "../schema/status.schema";
import { AppError } from "../error/AppError";
import { Request, Response, NextFunction } from 'express';





export const getOverlappingStatus = (
    body: StatusCreateInputSchema,
    priority: number,
    roomTypeId: number
) => {
    if (body.endDate) {
        return db
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
                    or(
                        gte(roomTypeStatusHistory.endDate, body.endDate),
                        lte(roomTypeStatusHistory.endDate,body.endDate)
                    )
                )
            )
            .innerJoin(roomStatusTypes,
                and(
                    eq(roomStatusTypes.id, roomTypeStatusHistory.statusTypeId),
                    gte(roomStatusTypes.priority, priority)
                )
            ).orderBy(asc(roomTypeStatusHistory.startDate));
    };
    if (!body.endDate) {
        return db
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
                    gte(roomStatusTypes.priority, priority)
                )
            ).orderBy(asc(roomTypeStatusHistory.startDate));
    }
}

export const checkOverlapConflict = (
    overLappingStatus: overLappingStatusArray,
    statusTypeId: number,
    res: Response
) => {
    let statusOverlap: string[] = []
    let statusLowerPrior: string[] = []
    for (let i: number = 0; i < overLappingStatus.length; i++) {
        const endDateStr = overLappingStatus[i].endDate
            ? overLappingStatus[i].endDate?.toISOString().split("T")[0]
            : "ongoing"
        if (overLappingStatus[i].statusId === statusTypeId) {
            statusOverlap.push(`${overLappingStatus[i].status} status, which starting on ${overLappingStatus[i].startDate.toISOString().split("T")[0]} ${endDateStr === "ongoing" ? "and is still ongoing" : `to ${endDateStr}`}`)
            continue
        }
        statusLowerPrior.push(`${overLappingStatus[i].status} status, which starting on ${overLappingStatus[i].startDate.toISOString().split("T")[0]} ${endDateStr === "ongoing" ? "and is still ongoing" : `to ${endDateStr}`}`)
    }
    if (statusOverlap.length > 0) {
        let message: string = ''
        if (statusLowerPrior.length > 0) {
            message = `Can't set this status. Because this status overlaps with the existing ${statusOverlap} . Please resolve the overlapping status before setting this status. and this status lower priority than the existing ${statusLowerPrior}. Please ensure it works correctly.`
            throw new AppError(message, 404)
        }
        message = `Can't set this status. Because this status overlaps with the existing ${statusOverlap} . Please resolve the overlapping status before setting this status.`
        throw new AppError(message, 404)
    }
    res.locals.message = `This status has lower priority than the existing ${statusLowerPrior} . Please ensure it works correctly.`
}