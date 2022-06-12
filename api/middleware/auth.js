import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    const decodedData = jwt.decode(token);
    if (token && decodedData?.sub) {
      req.userId = decodedData?.sub;
      next();
    } else {
      res
        .status(401)
        .json({ data: { message: "Authorization header must be provided" } });
    }
  } catch (error) {
    throw new Error(error);
  }
};

export default auth;
