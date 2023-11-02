import { Db } from 'mongodb';

export const getUserById = async (db: Db, id: string) => {
  const query = { _id: id };

  return await db.collection('users').findOne(query);
};
