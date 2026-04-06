import * as t from 'drizzle-orm/mysql-core';
import rooms from './rooms';


const roomStatusTypes = t.mysqlTable('room_status_types',{
    id: t.serial('id').primaryKey(),
    name: t.mysqlEnum('name',['Available','Unavailable', 'Maintenance', 'in_use']).notNull(),
    priority: t.tinyint('priority').notNull().default(0)
});

export default roomStatusTypes;