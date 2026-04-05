const jwt = require("jsonwebtoken");

const { env } = require("../config/env");

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [, token] = authHeader.split(" ");

  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.auth = {
      userId: payload.sub,
      username: payload.username
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = {
  requireAuth
};
