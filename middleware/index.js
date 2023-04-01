const jwt = require("jsonwebtoken");
const User = require('../model')

// Verify token middleware
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Missing token" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.SECRET_KEY, async (err, decode) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // Find user by decode id
    const user = await User.findOne({ _id: decode.id });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();
  });
}
module.exports = {
    verifyToken
}
