import { NextApiResponse } from 'next';
import nc from 'next-connect';

import middleware from '../../../middleware/all';
import { doc } from '../../../db';
import onError from '../../../middleware/error';
import { Request } from '../../../types';

const handler = nc({
  onError,
});

handler.use(middleware);

handler.post(async (req: Request, res: NextApiResponse) => {
  const newDoc = await doc.createDoc(req.db, {
    ...req.body,
    createdBy: req.user.id,
  });

  res.status(201).json({
    status: true,
    message: 'Successful',
    data: newDoc,
  });
});

export default handler;
