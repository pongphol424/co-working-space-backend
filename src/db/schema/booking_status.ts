import * as t from 'drizzle-orm/mysql-core';



const bookingStatus = t.mysqlTable('booking_status',{
    id: t.serial('id').primaryKey(),
    name: t.mysqlEnum("name",['pending', 'confirmed', 'complete', 'cancel']).notNull()
})


export default bookingStatus