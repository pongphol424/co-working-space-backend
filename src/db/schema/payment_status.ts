import * as t from 'drizzle-orm/mysql-core';



const paymentStatus = t.mysqlTable('payment_status',{
    id: t.serial('id').primaryKey(),
    name: t.mysqlEnum("name",['pending', 'paid', 'failed', 'cancelled', 'refunded']).notNull()
})


export default paymentStatus