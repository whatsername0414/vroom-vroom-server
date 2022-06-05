function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      emailAddress: user.email_address,
    },
    SECRET_KEY,
    { expiresIn: "1h" }
  );
}
