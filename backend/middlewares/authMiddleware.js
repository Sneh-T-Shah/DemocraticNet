const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "This_is_the_secret@auth_key";
const User = require("../models/User");

async function authMiddleware(req, res, next) {
  const token = req.header("authToken");
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  try {
    const data = await jwt.verify(token, JWT_SECRET);

    const userId = data.user.id;
    const dbUser = await User.findById(userId);

    if (!dbUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    req.user = dbUser;
    next();
  } catch (error) {
    return res.status(401).send("Please authenticate using a valid token");
  }
}

module.exports = authMiddleware;
