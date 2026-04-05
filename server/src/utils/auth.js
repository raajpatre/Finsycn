const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const { env } = require("../config/env");

async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

async function verifyPassword(password, passwordHash) {
  return bcrypt.compare(password, passwordHash);
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      username: user.username
    },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
}

module.exports = {
  hashPassword,
  verifyPassword,
  signToken
};
