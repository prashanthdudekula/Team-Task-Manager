import { Response, NextFunction } from "express";
import { AuthRequest } from "../types/index.js";
import { Role } from "@prisma/client";

export const roleMiddleware = (...roles: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: "User not authenticated" 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: "Forbidden: Insufficient permissions" 
      });
    }

    next();
  };
};

export const errorHandlingMiddleware = (
  err: any,
  req: any,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err.status) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
