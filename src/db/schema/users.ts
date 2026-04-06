import * as t from 'drizzle-orm/mysql-core';
import { sql } from "drizzle-orm";
import sub from "./subscription"




const users = t.mysqlTable('users', {
  uuid: t.varchar("uuid", { length: 36 }).primaryKey(),
  firstName: t.varchar('first_name',{ length: 100 }).notNull(),
  lastName: t.varchar('last_name',{length:100}).notNull(),
  email: t.varchar('email',{ length: 255 }).notNull().unique(),
  password: t.varchar('password',{length:255}).notNull(),
  phoneNumber: t.varchar('phone_number',{length:20}).notNull().unique(),
  isAdmin: t.boolean('is_admin').notNull().default(false),
  isActive: t.boolean('is_active').notNull().default(true),
  subscriptionId: t.bigint('subscription_id',{mode:"number",unsigned:true})
    .references(()=>sub.id,{onDelete: 'cascade'})
    .default(1).notNull(),
  createAt: t.timestamp("create_at",{ mode: "date"}).defaultNow(),
  updateAt: t.timestamp("update_at",{ mode: "date"}).defaultNow().onUpdateNow()
});

export default users;
