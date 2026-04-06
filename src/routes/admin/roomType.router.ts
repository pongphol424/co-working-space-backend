import { Router } from 'express';
import { isAdmin } from '../../middlewares/isAdmin.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { roomTypeCreate, roomTypeUpdate } from '../../schema/roomType.schema';
import { createRoomType, getRoomTypes, getRoomTypeById, updateRoomType } from '../../controller/admin/roomType.controller';


const router = Router()

router.get('/',isAdmin,getRoomTypes);
router.get('/:id',isAdmin,getRoomTypeById);
router.post('/',isAdmin,validate(roomTypeCreate),createRoomType,getRoomTypeById);
router.patch('/:id',isAdmin,validate(roomTypeUpdate),updateRoomType,getRoomTypeById);


export default router

