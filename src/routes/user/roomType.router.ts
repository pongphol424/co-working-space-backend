import { Router } from 'express';
import { getRoomType, getRoomTypeId } from '../../controller/user/roomType.controller';

const router = Router()


router.get('/',getRoomType);
router.get('/:id',getRoomTypeId);


export default router;