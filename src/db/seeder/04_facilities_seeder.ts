// import db from "../../config/db";
import facilities from "../schema/facilities";



export async function seederFacilities(db:any){
    const result = await db.insert(facilities).values([{
        name:"TV"
    },{
        name:"projector"
    },{
        name:"speaker"
    },{
        name:"white board"
    }])
}
