import * as t from 'drizzle-orm/mysql-core';


const subscription = t.mysqlTable('subscription',{
    id: t.serial('id').primaryKey(),
    type: t.mysqlEnum(['ชาวบ้าน','ชาวบ้านพลัส']).default('ชาวบ้าน').notNull(),
    discount: t.int().notNull()
})

export default subscription