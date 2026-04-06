// import db from "../../config/db";
import roomStatusTypes from "../schema/room_status_types";



export async function seederStatus(db: any) {
    const result = await db.insert(roomStatusTypes)
        .values([
            {
                name: 'Available'
            }, {
                name: 'in_use'
            }, {
                name: 'Maintenance'
            }, {
                name: 'Unavailable'
            }
        ])
}
