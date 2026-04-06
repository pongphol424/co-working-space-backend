import * as t from 'drizzle-orm/mysql-core'
import payments from './payment';
import paymentStatus from './payment_status';




const paymentStatusHistory = t.mysqlTable('payment_status_history',{
    id: t.serial('id').primaryKey(),
    paymentId: t.bigint('payment_id',{mode:"number",unsigned:true})
        .references(()=>payments.id,{onDelete:'restrict'})
        .notNull(),
    paymentStatusId: t.bigint('payment_status_id',{mode:"number",unsigned:true})
        .references(()=>paymentStatus.id,{onDelete:'restrict'})
        .notNull(),
    changedAt: t.timestamp('changed_at',{mode:"date"}).defaultNow()
});

export default paymentStatusHistory;