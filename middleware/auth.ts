import jwt from 'next-auth/jwt';

export default async (req, res, next) => {
  const decodedToken = await jwt.getToken({ req, secret: process.env.JWT_SECRET });

  if (decodedToken) { // * decodedToken => users
    // Signed in
    req.user = decodedToken;
    next();
  } else {
    // Not Signed in
    res.status(401);
    res.end();
  }
};
