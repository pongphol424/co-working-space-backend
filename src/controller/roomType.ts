import { Request, Response, NextFunction } from 'express';
import db from '../config/db';
import roomTypes from '../db/schema/room_types';
import facilities from '../db/schema/facilities';
import roomTypesFacilities from '../db/schema/room_types_facilities';
import { and, eq } from 'drizzle-orm';
import { RoomTypeBaseSchema, RoomTypeCreateSchema, RoomTypeUpdateSchema } from '../schema/roomType.schema';
import roomTypeStatusHistory from '../db/schema/room_type_status_history';
import roomStatusHistory from '../db/schema/room_status_history';
import roomStatusTypes from '../db/schema/room_status_types';



export const getRoomType = async (req: Request, res: Response) => {
    try {
        const result = await db.select({ roomTypes, facilityName: facilities.name })
            .from(roomTypes)
            .leftJoin(roomTypesFacilities, eq(roomTypes.id, roomTypesFacilities.roomTypeId))
            .leftJoin(facilities, eq(roomTypesFacilities.facilityId, facilities.id))
        if (!result.length) {
            return res.status(404).json({
                message: "RoomType not found"
            })
        }
        const roomTypeMap: { [key: number]: any } = {}
        for (let i = 0; i < result.length; i++) {
            const id = result[i].roomTypes.id
            if (!roomTypeMap[id]) {
                roomTypeMap[id] = {
                    ...result[i].roomTypes,
                    facilities: []
                }
            }
            if (result[i].facilityName) {
                roomTypeMap[id].facilities.push(result[i].facilityName)
            }
        }
        const roomTypeList = Object.values(roomTypeMap)
        res.json({
            message: res.locals.message,
            roomTypeList
        })
    } catch (error) {
        res.status(400).json(error)
    }
}


export const getRoomTypeId = async (req: Request, res: Response) => {
    const id = Number(req.params.id)
    try {
        const result = await db.select(
            {
                roomTypes,
                facilityName: facilities.name,
            })
            .from(roomTypes)
            .where(eq(roomTypes.id, id))
            .leftJoin(roomTypesFacilities, eq(roomTypes.id, roomTypesFacilities.roomTypeId))
            .leftJoin(facilities, eq(roomTypesFacilities.facilityId, facilities.id))  
        const status = await db.select(
            {
                statusName: roomStatusTypes.name,
                start: roomTypeStatusHistory.startDate,
                end: roomTypeStatusHistory.endDate
            })
            .from(roomTypeStatusHistory)
            .where(eq(roomTypeStatusHistory.roomTypeId, id))
            .innerJoin(roomStatusTypes,eq(roomStatusTypes.id,roomTypeStatusHistory.roomStatusId))
        if (!result.length) {
            return res.status(404).json({
                message: "Room ID not found"
            })
        }
        const roomTypeMap: { [key: number]: any } = {}
        for (let i = 0; i < result.length; i++) {
            const id = result[i].roomTypes.id
            if (!roomTypeMap[id]) {
                roomTypeMap[id] = {
                    ...result[i].roomTypes,
                    facilities: [],
                    status: status
                }
            }
            if (result[i].facilityName) {
                roomTypeMap[id].facilities.push(result[i].facilityName)
            }
        }
        const roomType = Object.values(roomTypeMap)
        res.json({
            message: res.locals.message,
            result: roomType[0]
        })
    } catch (error) {
        res.status(400).json(error)
    }
}


export const createRoomType = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const body: RoomTypeCreateSchema = req.body;
        const room: RoomTypeBaseSchema = body
        const facilityIds = body.facilityIds
        const resultInsertroomtype = await db.insert(roomTypes).values(room)
        const id = resultInsertroomtype[0].insertId
        const date = new Date()
        const resultInsertStatusHistory = await db.insert(roomTypeStatusHistory)
            .values({
                roomTypeId: id,
                roomStatusId: 1,
                startDate: date
            })
        if (facilityIds.length > 0) {
            const roomTypesFacilityList = facilityIds.map((n) => (
                {
                    roomTypeId: id,
                    facilityId: n
                }
            ))
            const resultInsertFacilitie = await db.insert(roomTypesFacilities)
                .values(roomTypesFacilityList)
        }
        req.params.id = String(id)
        res.locals.message = "Create complete"
        next()
    } catch (error: any) {
        if (error?.cause?.code === "ER_DUP_ENTRY") {
            if (error?.cause?.message.includes("room_types.room_types_type_unique")) {
                return res.status(409).json({
                    message: "RoomType already exists",
                });
            }
        }
        res.status(400).json({
            message: error
        })
    }
}


export const updateRoomType = async (req: Request, res: Response, next: NextFunction) => {
    const body: RoomTypeUpdateSchema = req.body
    const id = Number(req.params.id)
    const { facilityIds, ...roomType } = body
    try {
        if (facilityIds) {
            const resultDelete = await db.delete(roomTypesFacilities)
                .where(eq(roomTypesFacilities.roomTypeId, id))
            if (facilityIds.length > 0) {
                const roomTypesFacilityList = facilityIds.map((n) => (
                    {
                        roomTypeId: id,
                        facilityId: n
                    }
                ))
                const resultInsert = await db.insert(roomTypesFacilities)
                    .values(roomTypesFacilityList)
            }
        }
        if (Object.keys(roomType).length === 0) {
            res.locals.message = "Update complete"
            return next()
        }
        const resultUpdate = await db.update(roomTypes)
            .set(roomType)
            .where(eq(roomTypes.id, id))
        res.locals.message = "Update complete"
        next()
    } catch (error: any) {
        if (error?.cause?.code === "ER_DUP_ENTRY") {
            if (error?.cause?.message.includes("room_types.room_types_type_unique")) {
                return res.status(409).json({
                    message: "roomType name already exists",
                });
            }
        }
        if (error?.cause.code === "ER_NO_REFERENCED_ROW_2") {
            if (error?.cause?.message.includes("room_type_id")) {
                return res.status(404).json({
                    message: "roomTypeID not found",
                });
            }
            if (error?.cause?.message.includes("facility_id")) {
                return res.status(404).json({
                    message: "facilityID not found",
                });
            }
        }
        res.status(400).json({
            message: "Update error",
            error
        })
    }
}















export const filter = async (req: Request, res: Response) => {
    const types = req.body.types
    const capacity = req.body.capacity
    const facility = req.body.facility
    const dateStart = req.body.dateStart
    const dateEnd = req.body.dateEnd
    const timeStart = req.body.timeStart
    const timeEnd = req.body.timeEnd
    const duration = req.body.duration

}
