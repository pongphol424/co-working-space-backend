// import db from "../../config/db";
import subscription  from "../schema/subscription";


export async function seederSubscription(db:any){
    await db.insert(subscription).values([{
        type: 'ชาวบ้าน',
        discount: 0
    },{
        type: 'ชาวบ้านพลัส',
        discount: 10
    }])
}