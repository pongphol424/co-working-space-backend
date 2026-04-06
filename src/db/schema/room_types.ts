import * as t from 'drizzle-orm/mysql-core'
import roomStatusHistory from './room_status_history';



const roomTypes = t.mysqlTable('room_types',{
    id: t.serial('id').primaryKey(),
    name: t.varchar("name",{length:50}).unique().notNull(),
    description: t.text("description"),
    capacity: t.int("capacity").notNull(),
    price: t.int("price").notNull(),
});

export default roomTypes;