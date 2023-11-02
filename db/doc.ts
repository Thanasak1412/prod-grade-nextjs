import { Db } from 'mongodb';
import { nanoid } from 'nanoid';

export const getOneDoc = async (db: Db, id: string) => {
  const query = { _id: id };

  return await db.collection('docs').findOne(query);
};

export const getDocsByFolder = async (db: Db, folderId: string) => {
  const query = { folder: folderId };

  return await db.collection('docs').find(query).toArray();
};

export const createDoc = async (db: Db, doc: { createdBy: string; folder: string; name: string; content?: any }) => {
  const newDoc = await db
    .collection('docs')
    .insertOne({
      _id: nanoid(),
      ...doc,
      createdAt: new Date().toDateString(),
    })
    .then(({ ops }) => ops[0]);

  return newDoc;
};

export const updateOne = async (db: Db, id: string, updates: any) => {
  await db.collection('docs').updateOne(
    {
      _id: id,
    },
    {
      $set: updates,
    },
  );

  const query = { _id: id };
  const doc = await db.collection('docs').findOne(query);

  return doc;
};
