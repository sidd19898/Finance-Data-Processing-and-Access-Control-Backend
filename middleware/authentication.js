require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../model/user");

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select("_id role");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // 👈 contains _id + role

    next(); // ✅ JUST PASS — no role check here

  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authenticate;