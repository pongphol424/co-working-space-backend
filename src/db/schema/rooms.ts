import * as t from 'drizzle-orm/mysql-core';
import roomType from './room_types';
import roomStatusHistory from './room_status_history';


const rooms = t.mysqlTable('rooms',{
    id: t.serial('id').primaryKey(),
    roomNumber: t.int('room_number').notNull().unique(),
    roomTypeId: t.bigint('room_type_id',{mode:"number",unsigned:true})
        .references(()=>roomType.id,{onDelete: 'restrict'})
        .notNull()
})

export default rooms