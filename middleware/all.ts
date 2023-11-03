import nc from 'next-connect';
import cors from 'cors';

import db from './db';
import auth from './auth';

const middleware = nc();

const corsOptions = {
  origin: process.env.NEXT_PUBLIC_API_HOST,
  method: 'PUT, POST, OPTIONS',
};

middleware.use(cors(corsOptions)).use(db).use(auth);

export default middleware;
