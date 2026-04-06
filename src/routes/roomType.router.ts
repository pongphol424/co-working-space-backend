import { Router } from 'express';
import { createRoomType, getRoomType, getRoomTypeId, updateRoomType } from '../controller/roomType';
import { validate } from '../middlewares/validate.middleware';
import { roomTypeCreate, roomTypeUpdate } from '../schema/roomType.schema';
import { isAdmin } from '../middlewares/isAdmin.middleware';

const router = Router()


router.get('/types',getRoomType);
router.get('/types/:id',getRoomTypeId);
router.post('/create',isAdmin,validate(roomTypeCreate),createRoomType,getRoomTypeId);
router.patch('/update/:id',isAdmin,validate(roomTypeUpdate),updateRoomType,getRoomTypeId);


export default router;