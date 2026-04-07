import { Router } from 'express';
import { createRoom, getRoomByRoomType, getRoomId, updateRoom } from '../../controller/admin/room';
import { isAdmin } from '../../middlewares/isAdmin.middleware';
import { validate } from '../../middlewares/validate.middleware';
import { roomBaseSchema } from '../../schema/room.schema';


const router = Router()


router.get('/',isAdmin,getRoomByRoomType)
router.get('/:id',isAdmin,getRoomId)
router.post('/',isAdmin,validate(roomBaseSchema),createRoom,getRoomId)
router.patch('/:id',isAdmin,validate(roomBaseSchema),updateRoom,getRoomId)


export default router;
