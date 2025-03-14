import { compare, hash } from "bcrypt";
import { config } from "dotenv";
import jwt from "jsonwebtoken";
import { ErrorHandle } from "./errorHandling.js";
import { TempUser } from "../dataBase/models/tempUser.js";
import { AdminUser } from "../dataBase/models/adminUser.js";
import { User } from "../dataBase/models/user.js";
import mongoose, { Types } from "mongoose";
config();
const adminSecret = process.env.ADMIN_SECRET;
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
    throw new Error("JWT secret is not defined in environment variables");
}
if (!adminSecret) {
    throw new Error("Admin secret is not defined in environment variables");
}
export class UserAuth {
    async hashPassword(password, next) {
        try {
            if (!password) {
                throw new Error("Please provide a password to create a cipher");
            }
            return await hash(password, 10);
        }
        catch (error) {
            console.error("Error in hashing password:", error);
            next(error);
        }
    }
    async comparePassword(hashPassword, password, next) {
        try {
            if (!hashPassword || !password) {
                throw new Error("Please provide both password and hashedPassword to compare");
            }
            return await compare(password, hashPassword);
        }
        catch (error) {
            console.error("Error in comparing passwords:", error);
            next(error);
        }
    }
    async isAuthorised() {
        return async (req, res, next) => {
            try {
                let token = "";
                if (req.cookies?.token) {
                    token = req.cookies.token;
                }
                else if (req.headers.cookie) {
                    token = req.headers.cookie.replace("token=", "");
                }
                console.log("Token:", token);
                if (!token) {
                    console.log("No token found, unauthorized request");
                    return next(new ErrorHandle("Please login first", 401));
                }
                let verification;
                try {
                    verification = jwt.verify(token, jwtSecret);
                }
                catch (jwtError) {
                    console.error("JWT Verification Error:", jwtError);
                    return next(new ErrorHandle("Invalid token", 401));
                }
                console.log("Decoded JWT:", verification);
                if (!verification._id ||
                    !mongoose.Types.ObjectId.isValid(verification._id)) {
                    console.log("Invalid or missing _id in token");
                    return next(new ErrorHandle("Invalid token payload", 401));
                }
                const userId = new Types.ObjectId(verification._id);
                const tempUser = TempUser.findById(verification._id);
                const user = await User.findOne({ _id: verification._id, status: "Approved" });
                const admin = await AdminUser.findById(verification._id);
                if (!tempUser && !user && !admin) {
                    return next(new ErrorHandle("User not found", 400));
                }
                req.user = verification._id;
                console.log("Middleware Passed, Proceeding to Next Middleware");
                next();
            }
            catch (error) {
                console.error("Error in authorisation middleware:", error);
                return next(new ErrorHandle("Authorization error", 500));
            }
        };
    }
    async sendCookie(data, res, response, statuscode, next) {
        try {
            const payload = jwt.sign({ _id: String(data._id) }, jwtSecret);
            console.log(data);
            const cookieOptions = {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                maxAge: 1000 * 60 * 60,
            };
            res.status(statuscode).cookie("token", payload, cookieOptions).json({
                message: "Authorised",
                response,
                success: true,
                data,
            });
        }
        catch (error) {
            console.error("Error in sending cookie:", error);
            next(new ErrorHandle("Failed to send cookie", 500));
        }
    }
}
