import { NextFunction, Request, Response, Router } from "express";
import { ErrorHandle } from "../utils/errorHandling.js";
import { User } from "../dataBase/models/user.js";
import { userFilter } from "../types/user.js";
import { AdminService } from "../service/admin.js";
const app = Router();
const adminService: AdminService = new AdminService();
app.get(
  "/allUsers",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: userFilter = req.query;
      if (!data) {
        data.page=1
      }
      const result = await adminService.getAllUsersService(data,next);
      res.status(200).json({
        success:true,
        message:"user get successfull",
        result
      })
    } catch (error) {
      next(new ErrorHandle("fialed to get all all Users", 500));
    }
  }
);
export default app;