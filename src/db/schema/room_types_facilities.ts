import * as t from 'drizzle-orm/mysql-core';
import roomTypes from './room_types';
import facility from './facilities';




const roomTypesFacilities = t.mysqlTable('room_types_facilities',{
    roomTypeId: t.bigint('room_type_id',{mode:"number",unsigned:true})
      .references(()=>roomTypes.id,{onDelete: 'cascade'})
      .notNull(),
    facilityId: t.bigint('facility_id',{mode:"number",unsigned:true})
      .references(()=>facility.id,{onDelete: 'cascade'})
      .notNull()
},(table) => [
    t.primaryKey({ columns: [table.roomTypeId, table.facilityId] })
  ]
);
export default roomTypesFacilities;