import * as z from 'zod';




export const roomBaseSchema = z.object({
    roomTypeId: z.number().min(1),
    roomNumber: z.number().min(1),
})


export type RoomBaseSchema = z.infer<typeof roomBaseSchema>

