import { Router } from 'express';
import { validate } from '../middlewares/validate.middleware';
import { login, logout, register } from '../controller/auth';
import { loginSchema, registerSchema } from '../schema/auth.schema';


const router = Router();

router.post('/register',validate(registerSchema),register);
router.post('/login',validate(loginSchema),login);
router.post('/logout',logout);


export default router;