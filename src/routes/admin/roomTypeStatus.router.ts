import { Router } from 'express';
import { isAdmin } from '../../middlewares/isAdmin.middleware';
import { createRoomTypeStatus, deleteRoomTypeStatus, getRoomTypeStatus, getRoomTypeStatusById, updateRoomTypeStatus } from '../../controller/admin/roomTypeStatus.controller';
import { validate } from '../../middlewares/validate.middleware';
import {statusBaseSchema, statusCreateInputSchema, statusUpdateSchema } from '../../schema/status.schema';






const router = Router()


router.get('/status',isAdmin,getRoomTypeStatus);
router.get('/:roomTypeId/status-history',isAdmin,getRoomTypeStatusById);
router.post('/:roomTypeId/status-history',isAdmin,validate(statusCreateInputSchema),createRoomTypeStatus,getRoomTypeStatusById)
router.patch('/:roomTypeId/status-history/:statusHistoryId',isAdmin,validate(statusBaseSchema),updateRoomTypeStatus,getRoomTypeStatusById)
router.delete('/:roomTypeId/status-history/:statusHistoryId',isAdmin,deleteRoomTypeStatus,getRoomTypeStatusById)


export default router