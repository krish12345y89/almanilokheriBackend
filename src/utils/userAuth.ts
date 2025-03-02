import { compare, hash } from "bcrypt";
import { config } from "dotenv";
import { Request, NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { ErrorHandle } from "./errorHandling.js";
import { ITempUser } from "../dataBase/models/tempUser.js";
config();
const adminSecret = process.env.ADMIN_SECRET;
const jwtSecret = process.env.JWT_SECRET;
let req: Request;
let next: NextFunction;
if (!jwtSecret) {
  throw new Error("JWT secret is not defined in environment variables");
}

if (!adminSecret) {
  throw new Error("Admin secret is not defined in environment variables");
}

export class UserAuth {
  async hashPassword(password: string, next: NextFunction) {
    try {
      if (!password) {
        throw new Error("Please provide a password to create a cipher");
      }
      return await hash(password, 10);
    } catch (error) {
      console.error("Error in hashing password:", error);
      next(error);
    }
  }

  async comparePassword(
    hashPassword: string,
    password: string,
    next: NextFunction
  ) {
    try {
      if (!hashPassword || !password) {
        throw new Error(
          "Please provide both password and hashedPassword to compare"
        );
      }
      return await compare(password, hashPassword);
    } catch (error) {
      console.error("Error in comparing passwords:", error);
      next(error);
    }
  }

  async isAuthorised() {
    try {
      const token = req.cookies["token"];
      if (!token) {
        return next(new ErrorHandle("please login first", 401));
      }
      const verification: ITempUser = JSON.parse(
        JSON.stringify(jwt.verify(token, jwtSecret))
      );
      if (!verification) {
        return next(new ErrorHandle("please provide a valid token", 401));
      }
      (req as any).user = verification._id;
      next();
    } catch (error) {
      console.error("Error in authorisation:", error);
      next(error);
    }
  }

  async isAdmin(req: Request, next: NextFunction) {
    try {
      const token = req.cookies["token"];
      if (!token) {
        throw new Error("Login first");
      }
      const verification = JSON.parse(
        JSON.stringify(jwt.verify(token, jwtSecret))
      );
      if (!verification) {
        throw new Error("JWT verification failed");
      }
      const secret = verification.secret;
      if (!secret) {
        throw new Error("Invalid token structure");
      }

      const validSec = await this.comparePassword(secret, adminSecret, next);
      if (!validSec || !verification.isAdmin) {
        throw new Error("Unauthorized");
      }

      (req as any).user = verification._id;
      next();
    } catch (error) {
      console.error("Error in admin authorisation:", error);
      next(error);
    }
  }

  async sendCookie(
    data: object,
    res: Response,
    response: any,
    statuscode: number,
    next: NextFunction
  ) {
    try {
      const payload = jwt.sign(data, jwtSecret);
      const cookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60,
      };
      res.status(statuscode).cookie("token", payload, cookieOptions).json({
        message: "Authorised",
        response,
        success: true,
      });
    } catch (error) {
      console.error("Error in sending cookie:", error);
      next(error);
    }
  }
}
