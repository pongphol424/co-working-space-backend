import * as z from 'zod';


export const userBaseSchema = z.object({
    firstName: z.string().trim().min(1).max(100),
    lastName: z.string().trim().min(1).max(100),
    email: z.email().trim().min(1).max(255),
    phoneNumber: z.string().trim().min(10).max(25)
});

export const userUpdateSchema = userBaseSchema.partial();

export const userFullSchema = userBaseSchema.extend({
    uuid: z.string().trim().length(36),
    subscriptionId: z.number().min(1).max(2),
    password: z.string().trim().min(8).max(255),
    isAdmin: z.boolean()
});

export const userWithSubscription = userBaseSchema.extend({
    subscriptionId: z.number().min(1).max(2)
});

export const adminCreateAt = z.object({
    uuid: z.string().trim().length(36),
    isAdmin: z.boolean()
});

export type UserFullSchema = z.infer<typeof userFullSchema>;
export type AdminCreateAt = z.infer<typeof adminCreateAt>;
