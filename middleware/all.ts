import nc from 'next-connect';
import cors from 'cors';

import db from './db';
import auth from './auth';

const middleware = nc();

middleware.use(cors()).use(db).use(auth);

export default middleware;
