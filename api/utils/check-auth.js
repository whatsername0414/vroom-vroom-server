import jwt from "jsonwebtoken";

const checkAuth = (authorization) => {
  try {
    const token = authorization.split("Bearer ")[1];
    const user = jwt.decode(token);
    return user;
  } catch (error) {
    throw new Error(error);
  }
};

export default checkAuth;
