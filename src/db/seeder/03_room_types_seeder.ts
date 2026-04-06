// import db from "../../config/db";
import roomTypes from "../schema/room_types";

export async function seederRoomType(db:any) {
    const result = await db.insert(roomTypes)
        .values([
            {
                name: "a",
                description: "",
                capacity: 5,
                price: 300
            }, {
                name: "b",
                description: "",
                capacity: 8,
                price: 500
            }, {
                name: "c",
                description: "",
                capacity: 12,
                price: 700
            }, {
                name: "d",
                description: "",
                capacity: 15,
                price: 900
            }, {
                name: "e",
                description: "",
                capacity: 20,
                price: 1400
            }])
}
