import * as t from 'drizzle-orm/mysql-core'
import bookingStatus from './booking_status';
import booking from './booking';



const bookingStatusHistory = t.mysqlTable('booking_status_history',{
    id: t.serial('id').primaryKey(),
    bookingId: t.bigint('booking_id',{mode:"number",unsigned:true})
        .references(()=>booking.id,{onDelete:'restrict'})
        .notNull(),
    bookingStatusId: t.bigint('booking_status_id',{mode:"number",unsigned:true})
        .references(()=>bookingStatus.id,{onDelete:'restrict'})
        .notNull(),
    changedAt: t.timestamp('changed_at',{mode:"date"}).defaultNow()
});

export default bookingStatusHistory;