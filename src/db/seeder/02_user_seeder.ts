// import db from "../../config/db";
import users from "../schema/users";
import * as bcrypt from 'bcrypt'
import { randomUUID } from 'node:crypto';


const password = "12345678"
const hashedPassword = await bcrypt.hash(password,10)
const uuid = randomUUID();


export async function seederUser(db:any){
  const a = await db.insert(users).values({
    uuid,
    firstName: 'admin2',
    lastName: 'admin2',
    email: 'admin2@mail.com',
    phoneNumber: 'admin222222',
    isAdmin: true,
    subscriptionId:2,
    password: hashedPassword
  })
}
