import * as t from 'drizzle-orm/mysql-core'



const facilities = t.mysqlTable('facilities',{
        id: t.serial('id').primaryKey(),
        name: t.varchar('name',{length:50}).notNull()
    }
);

export default facilities