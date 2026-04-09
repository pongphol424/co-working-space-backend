import { AnyMySqlColumn, AnyMySqlTable } from "drizzle-orm/mysql-core";

export interface OverlappingStatus {
    startDate: Date;
    endDate: Date | null;
    statusTypeId: number;
    statusTypeName: "Available" | "Unavailable" | "Maintenance" | "in_use";
}

export interface OverlappingStatusArray extends Array<OverlappingStatus> { }


export interface OverlapConfig<
    Table extends AnyMySqlTable,
    RoomId extends AnyMySqlColumn,
    StatusTypeId extends AnyMySqlColumn,
    StatusTypeName extends AnyMySqlColumn,
    StartDate extends AnyMySqlColumn,
    EndDate extends AnyMySqlColumn
> {
    table: Table
    roomIdField: RoomId
    statusTypeIdField: StatusTypeId
    statusTypeNameField: StatusTypeName
    startDateField: StartDate
    endDateField: EndDate
}
