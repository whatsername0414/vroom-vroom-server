import jwt from "jsonwebtoken";

const checkAuth = (authorization) => {
  try {
    const token = authorization.split("Bearer ")[1];
    const user = jwt.decode(token);
    return user;
  } catch (err) {
    throw new AuthenticationError("Invalid/Expire token");
  }
};

export default checkAuth;
