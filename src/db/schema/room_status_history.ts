import * as t from 'drizzle-orm/mysql-core'
import rooms from './rooms';
import roomStatusType from './room_status_types';
import users from './users';



const roomStatusHistory = t.mysqlTable('room_status_history',{
    id: t.serial('id').primaryKey(),
    roomId: t.bigint('room_id',{mode:"number",unsigned:true})
        .references(()=>rooms.id,{onDelete:"restrict"})
        .notNull(),
    roomStatusTypeId: t.bigint('room_status_type_id',{mode:"number",unsigned:true})
        .references(()=>roomStatusType.id,{onDelete:'restrict'})
        .notNull(),
    startDate: t.datetime('start_date',{mode:"date"}).notNull(),
    endDate: t.datetime('end_date',{mode:"date"}),
        createdBy: t.varchar('create_by', { length: 36 })
        .references(() => users.uuid, { onDelete: "restrict" })
        .notNull(),
    createAt: t.timestamp('create_at').notNull().defaultNow(),
    updatedBy: t.varchar('update_by', { length: 36 })
        .references(() => users.uuid, { onDelete: "restrict" })
        .notNull(),
    updateAt: t.timestamp('update_at').notNull().defaultNow()
});

export default roomStatusHistory;