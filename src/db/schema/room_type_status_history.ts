import * as t from 'drizzle-orm/mysql-core'
import roomStatusType from './room_status_types';
import roomTypes from './room_types';
import users from './users';



const roomTypeStatusHistory = t.mysqlTable('room_type_status_history', {
    id: t.serial('id').primaryKey(),
    roomTypeId: t.bigint('room_type_id', { mode: "number", unsigned: true })
        .references(() => roomTypes.id, { onDelete: "restrict" })
        .notNull(),
    statusTypeId: t.bigint('status_type_id', { mode: "number", unsigned: true })
        .references(() => roomStatusType.id, { onDelete: 'restrict' })
        .notNull(),
    startDate: t.datetime('start_date', { mode: 'date' }).notNull(),
    endDate: t.datetime('end_date', { mode: 'date' }),
    description: t.text("description"),
    createdBy: t.varchar('create_by', { length: 36 })
        .references(() => users.uuid, { onDelete: "restrict" })
        .notNull(),
    createAt: t.timestamp('create_at').notNull().defaultNow(),
    updatedBy: t.varchar('update_by', { length: 36 })
        .references(() => users.uuid, { onDelete: "restrict" })
        .notNull(),
    updateAt: t.timestamp('update_at').notNull().defaultNow()
});


export default roomTypeStatusHistory;