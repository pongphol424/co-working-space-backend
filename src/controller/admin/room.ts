import { Request, Response, NextFunction } from 'express';
import db from '../../config/db';
import rooms from '../../db/schema/rooms';
import roomStatus from '../../db/schema/room_status_types';
import { and, eq, gt, or, lte, isNull, sql } from 'drizzle-orm';
import { RoomStatusBaseSchema, StatusBaseSchema } from '../../schema/status.schema';
import roomTypes from '../../db/schema/room_types';
import { RoomBaseSchema } from '../../schema/room.schema';
import roomStatusHistory from '../../db/schema/room_status_history';
import roomStatusTypes from '../../db/schema/room_status_types';



export const getRoomByRoomType = async (req: Request, res: Response) => {
    const body: RoomBaseSchema = req.body
    const date = new Date()
    const subQueryMaxStartDate = db
        .select({
            roomNumber: rooms.roomNumber,
            maxStartDate: sql<Date>`MAX(${roomStatusHistory.startDate})`.as("maxStartDatee")
        })
        .from(rooms)
        .where(eq(rooms.roomTypeId, body.roomTypeId))
        .leftJoin(roomStatusHistory,
            and(
                eq(roomStatusHistory.roomId, rooms.roomNumber),
                lte(roomStatusHistory.startDate, date),
                or(
                    gt(roomStatusHistory.endDate, date),
                    isNull(roomStatusHistory.endDate)
                )
            )
        )
        .groupBy(rooms.roomNumber)
        .as("al")

    const result = await db
        .select({
            roomId: rooms.id,
            roomType: roomTypes.name,
            roomNumber: rooms.roomNumber,
            status: roomStatusTypes.name
        })
        .from(rooms)
        .innerJoin(subQueryMaxStartDate,
                eq(rooms.roomNumber, subQueryMaxStartDate.roomNumber)
        )
        .leftJoin(roomStatusHistory,
            eq(rooms.id, roomStatusHistory.roomId)
        )
        .leftJoin(roomStatusTypes,
            eq(roomStatusHistory.roomStatusTypeId, roomStatusTypes.id)
        ).innerJoin(roomTypes,
            eq(rooms.roomTypeId,roomTypes.id)
        )
    res.json(result)
}


export const getRoomId = async (req: Request, res: Response) => {
    const roomId:number = Number(req.params.id)
    const date = new Date()
    const subQueryMaxStartDate = db
        .select({
            roomNumber: rooms.roomNumber,
            maxStartDate: sql<Date>`MAX(${roomStatusHistory.startDate})`.as("maxStartDatee")
        })
        .from(rooms)
        .where(eq(rooms.id, roomId))
        .leftJoin(roomStatusHistory,
            and(
                eq(roomStatusHistory.roomId, rooms.roomNumber),
                lte(roomStatusHistory.startDate, date),
                or(
                    gt(roomStatusHistory.endDate, date),
                    isNull(roomStatusHistory.endDate)
                )
            )
        )
        .groupBy(rooms.roomNumber)
        .as("al")

    const result = await db
        .select({
            roomId: rooms.id,
            roomType: roomTypes.name,
            roomNumber: rooms.roomNumber,
            status: roomStatusTypes.name
        })
        .from(rooms)
        .innerJoin(subQueryMaxStartDate,
            eq(rooms.roomNumber, subQueryMaxStartDate.roomNumber),
        )
        .leftJoin(roomStatusHistory,
            eq(rooms.id, roomStatusHistory.roomId)
        )
        .leftJoin(roomStatusTypes,
            eq(roomStatusHistory.roomStatusTypeId, roomStatusTypes.id)
        ).innerJoin(roomTypes,
            eq(rooms.roomTypeId,roomTypes.id)
        )
    res.json(result)
}


export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
    const body: RoomBaseSchema = req.body
    const date = new Date()
    const room:RoomBaseSchema = {
        roomTypeId: body.roomTypeId,
        roomNumber: Number(`${body.roomTypeId}${body.roomNumber}`)
    }
    const insertRoom = await db.insert(rooms).values(room)
    const roomWithStatue: RoomStatusBaseSchema = {
        roomId: insertRoom[0].insertId,
        roomStatusTypeId: 1,
        startDate: date
    }
    const insertStatus = await db.insert(roomStatusHistory).values(roomWithStatue)
    req.params.id = String(insertRoom[0].insertId)
    res.locals.message = "Create complete"
    next()
}




