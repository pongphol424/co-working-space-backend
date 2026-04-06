// import db from "../../config/db";
import roomTypesFacilities from "../schema/room_types_facilities";




export async function seederRoomTypeFacilities(db:any) {
    const result = await db.insert(roomTypesFacilities).values([{
        roomTypeId: 1,
        facilityId: 4
    }, {
        roomTypeId: 2,
        facilityId: 1
    }, {
        roomTypeId: 2,
        facilityId: 4
    }, {
        roomTypeId: 3,
        facilityId: 1,
    }, {
        roomTypeId: 3,
        facilityId: 2
    }, {
        roomTypeId: 4,
        facilityId: 1
    }, {
        roomTypeId: 4,
        facilityId: 2
    }, {
        roomTypeId: 4,
        facilityId: 3
    }, {
        roomTypeId: 4,
        facilityId: 4
    }, {
        roomTypeId: 5,
        facilityId: 1
    }, {
        roomTypeId: 5,
        facilityId: 2
    }, {
        roomTypeId: 5,
        facilityId: 3
    }, {
        roomTypeId: 5,
        facilityId: 4
    }])
}



