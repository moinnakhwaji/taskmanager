import { ClerkExpressWithAuth } from "@clerk/clerk-sdk-node";

// Middleware to authenticate the user
export const authenticateUser = async (req, res, next) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Optionally: You can use req.auth.userId to find the user in your DB if necessary
  req.user = { _id: req.auth.userId }; // Attach userId to request object
  next();
};
