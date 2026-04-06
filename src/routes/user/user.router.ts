import { Router } from 'express';
import { getProfile, updateProfile } from '../../controller/user/user.controller';
import { isAuthenticated} from '../../middlewares/auth.middleware';
import { userUpdateSchema } from '../../schema/user.schema';
import { validate } from '../../middlewares/validate.middleware';

const router = Router();



router.get('/profile',isAuthenticated,getProfile)
router.patch('/updateProfile',isAuthenticated,validate(userUpdateSchema),updateProfile)


export default router;