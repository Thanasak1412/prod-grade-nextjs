import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import { NextApiRequest, NextApiResponse } from 'next';
import { doc, folder, connectToDB } from '../../../db';

export default (req: NextApiRequest, res: NextApiResponse) =>
  NextAuth(req, res, {
    session: {
      jwt: true,
    },
    jwt: {
      secret: process.env.JWT_SECRET,
    },
    providers: [
      Providers.GitHub({
        clientId: process.env.GITHUB_ID,
        clientSecret: process.env.GITHUB_SECRET,
      }),
    ],
    database: process.env.DATABASE_URL,
    pages: {
      signIn: '/signin',
    },
    callbacks: {
      async session(session, user) {
        if (user?.id) {
          session.user.id = user.id;
        }

        return session;
      },
      async jwt(token, user, _account, _profile, isNewUser) {
        const { db } = await connectToDB();

        if (isNewUser) {
          const personalFolder = await folder.createFolder(db, { createdBy: `${user?.id}`, name: 'Getting started' });
          await doc.createDoc(db, {
            name: 'Start Here',
            folder: personalFolder._id,
            createdBy: `${user?.id}`,
            content: {
              time: 1556098174501,
              blocks: [
                {
                  type: 'header',
                  data: {
                    text: 'Some default content',
                    level: 2,
                  },
                },
              ],
              version: '2.12.4',
            },
          });
        }

        if (token && user) {
          return { ...token, id: `${user?.id}` };
        }

        return token;
      },
    },
  });
