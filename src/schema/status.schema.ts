import { isNull } from 'drizzle-orm';
import path from 'node:path';
import * as z from 'zod';

const requireStartDateEndDate = (data: any, ctx: any) => {
    if (!data.startDate) {
        ctx.addIssue({
            path: ["startDate"],
            input: undefined,
            code: 'custom',
            expected: 'date',
            message: "startDate is required"
        })
    }
    // if ([1,4].includes(data.statusTypeId) && data.endDate) {
    //     ctx.addIssue({
    //         path: ["EndDate"],
    //         input: 'date',
    //         code: 'custom',
    //         expected: 'date',
    //         message: "End date cannot be set manually for Available status."
    //     })
    // }
}

const validateStartDateEndDate = (data: any, ctx: any) => {
    const date = new Date()
    if (data.endDate) {
        if (data.startDate > data.endDate) {
            ctx.addIssue({
                path: ["endDate"],
                code: 'custom',
                message: "endDate must be after startDate"
            })
        }
    }
}


export const statusBaseSchema = z.object({
    startDate: z.coerce.date().min(new Date()),
    endDate: z.coerce.date().min(new Date()).nullable().optional(),
    description: z.string().nullable().optional()
}).superRefine(requireStartDateEndDate).superRefine(validateStartDateEndDate)


// roomType
export const statusCreateInputSchema = statusBaseSchema.extend({
    statusTypeId: z.number().min(1),
})

export const statusCreateSchema = statusCreateInputSchema.extend({
    createdBy: z.string().trim().length(36),
    updatedBy: z.string().trim().length(36),
})

export const statusUpdateSchema = statusBaseSchema.extend({
    statusHistoryId: z.number().min(1)
})


// room
export const roomStatusBase = statusBaseSchema.extend({
    roomId: z.number().min(1),
    roomStatusTypeId: z.number().min(1)
})


// overlapingStatus
export interface overLappingStatus{
    startDate: Date;
    endDate: Date | null;
    statusId: number;
    status: "Available" | "Unavailable" | "Maintenance" | "in_use";
}

export interface overLappingStatusArray extends Array<overLappingStatus>{}

export type StatusBaseSchema = z.infer<typeof statusBaseSchema>
export type StatusCreateInputSchema = z.infer<typeof statusCreateInputSchema>
export type StatusCreateSchema = z.infer<typeof statusCreateSchema>
export type StatusUpdateSchema = z.infer<typeof statusUpdateSchema>
export type RoomStatusBaseSchema = z.infer<typeof roomStatusBase>














