import { NextFunction, Request, Response, Router } from "express";
import { ErrorHandle } from "../utils/errorHandling.js";
import { User } from "../dataBase/models/user.js";
import { userFilter } from "../types/user.js";
import { AdminService } from "../service/admin.js";
import { AdminUser } from "../dataBase/models/adminUser.js";
import { UserAuth } from "../utils/userAuth.js";
const app = Router();
const adminService: AdminService = new AdminService();
const userAuth = new UserAuth();
app.get(
  "/allUsers",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: userFilter = req.query;
      if (!data) {
        data.page = 1;
      }
      console.log(data)
      const result = await adminService.getAllUsersService(data, next);
      res.status(200).json({
        success: true,
        message: "user get successfull",
        result,
      });
    } catch (error) {
      next(new ErrorHandle("fialed to get all all Users", 500));
    }
  }
);
app.get(
  "/userCounts",
  await userAuth.isAuthorised(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminVerify = await AdminUser.findById((req as any).user);
      if (!adminVerify) {
        return next(
          new ErrorHandle("only admin users can process this routes", 401)
        );
      }
      const results = await User.aggregate([
        {
          $group: {
            _id: "$status",
            total: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            counts: {
              $push: { k: "$_id", v: "$total" },
            },
            allUsers: { $sum: "$total" },
          },
        },
        {
          $set: {
            counts: {
              $setUnion: [
                [
                  { k: "Approved", v: 0 },
                  { k: "Rejected", v: 0 },
                  { k: "Blocked", v: 0 },
                  { k: "Pending", v: 0 },
                ],
                "$counts",
              ],
            },
          },
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                { allUsers: "$allUsers" },
                { $arrayToObject: "$counts" },
              ],
            },
          },
        },
      ]);

      if (results) {
        res.status(200).json({
          success: true,
          message: "all users count",
          results,
        });
      }
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("failed to fetch users count", 500));
    }
  }
);
app.post(
  "/login",
  async (
    req: Request<{}, {}, { userName: string; password: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userName, password } = req.body;
      if (!userName || !password) {
        return next(
          new ErrorHandle("please provide both username and password", 400)
        );
      }
      const admin = await AdminUser.findOne({
        $and: [
          { $or: [{ userName: userName }, { email: userName }] },
          { password: password },
        ],
      });
      if (!admin) {
        return next(new ErrorHandle("invalid username or password", 401));
      }
      await userAuth.sendCookie(admin, res, "admin User", 200, next);
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("admin signUp failed", 500));
    }
  }
);
app.post(
  "/signUp",
  async (
    req: Request<{}, {}, { userName: string; password: string; email:string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { userName, password, email } = req.body;
      if (!userName || !password || !email) {
        return next(
          new ErrorHandle("please provide both username and password", 400)
        );
      }
      const adminExist = await AdminUser.findOne({
        $or: [{ userName: userName }, { email: email }],
      });
      if (adminExist) {
        return next(
          new ErrorHandle("user already exists with this details", 400)
        );
      }
      const admin = await AdminUser.create({
        userName: userName,
        email: email,
        password: password,
      });
      if (!admin) {
        return next(new ErrorHandle("invalid username or password", 401));
      }
      res.status(201).json({
        message: "User signUP successfully",
        success: true,
        admin,
      });
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("admin signUp failed", 500));
    }
  }
);
export default app;
