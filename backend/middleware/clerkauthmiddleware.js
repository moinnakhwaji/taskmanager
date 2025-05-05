// middleware/clerkAuth.js
import { clerkClient } from '@clerk/clerk-sdk-node';

export const clerkAuthMiddleware = async (req, res, next) => {
  try {
    const sessionToken = req.headers.authorization?.replace("Bearer ", "");

    if (!sessionToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    const session = await clerkClient.sessions.verifySession(sessionToken);
    const user = await clerkClient.users.getUser(session.userId);

    req.user = user;
    next();
  } catch (error) {
    console.error("Clerk Auth Error:", error);
    return res.status(401).json({ message: "Unauthorized" });
  }
};
