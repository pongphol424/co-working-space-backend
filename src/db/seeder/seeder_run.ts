import db from "../../config/db";
import { seederSubscription } from "./01_subscription_seeder";
import { seederUser } from "./02_user_seeder";
import { seederRoomType } from "./03_room_types_seeder";
import { seederFacilities } from "./04_facilities_seeder";
import { seederRoomTypeFacilities } from "./05_room_types_facilities";
import { seederStatus } from "./06_room_status_types";




async function runSeed() {
    try {
        await db.transaction(async (tx) => {
            await seederSubscription(tx);
            await seederUser(tx);
            await seederRoomType(tx);
            await seederFacilities(tx);
            await seederRoomTypeFacilities(tx);
            await seederStatus(tx);
        })
        console.log("Seeding completed");
        process.exit(0);
    } catch (err) {
        console.error("Seeding failed:", err);
        process.exit(1);
    }
}
runSeed()