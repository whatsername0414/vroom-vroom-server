import jwt from 'jsonwebtoken';

export const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decodedData = jwt.decode(token);
    if ((token && decodedData?.sub) || decodedData?.username) {
      req.userId = decodedData?.sub;
      req.name = decodedData?.name;
      req.email = decodedData?.email;
      next();
    } else {
      res
        .status(401)
        .json({ data: { message: 'Authorization header must be provided' } });
    }
  } catch (error) {
    throw new Error(error);
  }
};
