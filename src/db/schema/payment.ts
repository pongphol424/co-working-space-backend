import * as t from "drizzle-orm/mysql-core";
import bookings from "./booking";
import paymentStatus from "./payment_status";

const payments = t.mysqlTable("payments", {
    id: t.serial("id").primaryKey(),
    bookingId: t.bigint("booking_id", { mode: "number", unsigned: true })
        .references(() => bookings.id, { onDelete: "restrict" })
        .notNull(),
    amount: t.int("amount").notNull(),
    method: t.varchar("method", { length: 30 }).notNull(),
    paymentStatusId: t.bigint("payment_status_id", {mode:"number",unsigned:true})
        .references(()=>paymentStatus.id,{onDelete:"restrict"})
        .notNull(),
    createdAt: t.timestamp("created_at", { mode: "date" }).defaultNow(),
    updatedAt: t.timestamp("updated_at", { mode: "date" }).defaultNow().onUpdateNow()
});

export default payments