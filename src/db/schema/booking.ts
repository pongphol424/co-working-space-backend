import * as t from 'drizzle-orm/mysql-core';
import rooms from './rooms';
import users from './users';
import bookingStatus from './booking_status';

const bookings = t.mysqlTable('bookings', {
    id: t.serial('id').primaryKey(),
    roomId: t.bigint('room_id', { mode: "number", unsigned: true })
        .references(() => rooms.id, { onDelete: 'restrict' })
        .notNull(),
    userId: t.varchar('user_uuid', { length: 36 })
        .references(() => users.uuid, { onDelete: 'restrict' })
        .notNull(),
    totalPrice: t.int('total_price').notNull(),
    startDateTime: t.datetime("start_date_time", { mode: "date" }).notNull(),
    endDateTime: t.datetime("end_date_time", { mode: "date" }).notNull(),
    statusId: t.bigint('status_id', { mode: 'number', unsigned: true })
        .references(() => bookingStatus.id, { onDelete: 'restrict' })
        .notNull(),
    createdAt: t.timestamp('created_at', { mode: "date" }).defaultNow(),
    updateAt: t.timestamp("update_at", { mode: "date" }).defaultNow().onUpdateNow()
}, (table) => [
    t.index("room_time_idx").on(table.roomId, table.startDateTime, table.endDateTime),
]);

export default bookings;

