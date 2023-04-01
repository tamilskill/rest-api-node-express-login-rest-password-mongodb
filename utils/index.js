const jwt = require("jsonwebtoken");

// Generate JWT
function generateToken(user) {
  return jwt.sign({ id: user.id }, process.env.SECRET_KEY, { expiresIn: "1m" });
}

module.exports = generateToken
