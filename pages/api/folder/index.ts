import nc from 'next-connect';
import { NextApiResponse } from 'next';

import { folder } from '../../../db';
import onError from '../../../middleware/error';
import middleware from '../../../middleware/all';
import { Request } from '../../../types';

const handler = nc<Request, NextApiResponse>({
  onError,
});

handler.use(middleware);

handler.post(async (req: Request, res: NextApiResponse) => {
  const newFolder = await folder.createFolder(req.db, {
    createdBy: req.user.id,
    name: req.body.name as string,
  });

  res.status(201).json({
    status: true,
    message: 'Successful',
    data: newFolder,
  });
});

export default handler;
