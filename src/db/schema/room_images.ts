import * as t from 'drizzle-orm/mysql-core';
import roomTypes from './room_types';


const roomImages = t.mysqlTable("room_images",{
    id: t.serial("id").primaryKey(),
    roomTypeId: t.bigint("room_type_id",{mode:"number",unsigned:true})
        .references(()=>roomTypes.id,{onDelete:"cascade"})
        .notNull(),
    filePath: t.varchar("file_path",{length:255}).notNull(),
    createAt: t.timestamp("create_at",{mode: "date"}).defaultNow(),
    updateAt: t.timestamp("update_at",{mode: "date"}).defaultNow().onUpdateNow()
});

export default roomImages;