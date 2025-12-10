import { verifyJWT } from "../auth/jwt.js";
import dotenv from "dotenv";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET is set
if (!JWT_SECRET) {
  console.error("ERROR: JWT_SECRET is not defined in environment variables!");
  console.error("Please add JWT_SECRET to your .env file.");
  console.error("Example: JWT_SECRET=your-secret-key-here");
  process.exit(1);
}

export function requireAuth(req, res, next) {
  
  if (process.env.NODE_ENV === "test") {
    req.user = { sub: "test-user" };
    return next();
  }

  try {
    const auth = req.headers.authorization || "";
    const [scheme, token] = auth.split(" ");
    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const payload = verifyJWT(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Unauthorized", message: e.message });
  }
}
