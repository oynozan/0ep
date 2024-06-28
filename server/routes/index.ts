import { type Request, Router } from 'express';
import { type IUser } from '../db/userSchema';

/* ROUTES */
import auth from './auth';
import channel from './channel';

const router = Router();
router.use('/auth', auth);
router.use('/channel', channel);

export type UserRequest = Request & { user?: IUser };
export default router;