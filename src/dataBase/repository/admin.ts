import { NextFunction } from "express";
import { UserAuth } from "../../utils/userAuth.js";
import { AdminUser } from "../models/adminUser.js";
import { ErrorHandle } from "../../utils/errorHandling.js";
import { userFilter } from "../../types/user.js";
import { User } from "../models/user.js";
import xlsx from "xlsx"

export class AdminRepository {
  private auth;
  constructor() {
    this.auth = new UserAuth();
  }
  async signIn(email: string, password: string, next: NextFunction) {
    try {
      const user = await AdminUser.findOne({ email: email });
      const match = await this.auth.comparePassword(password, user.password);
      if (!user || match) {
        throw new Error("unauthorised");
      }
    } catch (error) {
      console.error("error in admin login", error);
      next(error);
    }
  }
  getAllUsers = async (data: userFilter, next: NextFunction) => {
    try {
      if (
        data.createdAtStart &&
        isNaN(new Date(data.createdAtStart).getTime())
      ) {
        return next(
          new ErrorHandle("Invalid createdAtStart date format", 400)
        );
      }
      if (data.createdAtEnd && isNaN(new Date(data.createdAtEnd).getTime())) {
        return next(new ErrorHandle("Invalid createdAtEnd date format", 400));
      }

      const query: any = {
        ...(data.status && { status: data.status }),
        ...(data.batch && { batch: data.batch }),
        ...(data.branch && { branch: data.branch }),
        ...(data.createdAtStart && {
          createdAt: {
            $gte: new Date(data.createdAtStart),
            $lte: new Date(data.createdAtEnd || Date.now()),
          },
        }),
      };

      const pipeline = [
        { $match: query },
        { $sort: { [data.sortType || "createdAt"]: data.sort ?? -1 } as any },
        { $skip: data.page ? (data.page - 1) * (data.limit ?? 20) : 0 },
        { $limit: data.limit ?? 20 },
        {
          $project: {
            name: 1,
            email: 1,
            rollNo: 1,
            phoneNumber: 1,
            branch: 1,
            batch: 1,
          },
        },
      ];

      const users = await User.aggregate(pipeline);
      return users;

    } catch (error) {
      console.error("Error fetching users:", error);
      next(new ErrorHandle("Failed to get all users", 500));
    }
  };

  makeUsersFromXlsx = async(next:NextFunction,files:any)=>{
    try {
      const file = xlsx.readFile(files);
      const firstSheet = file.SheetNames[0];
      const raw = file.Workbook[firstSheet];
      


    } catch (error) {
      next(new ErrorHandle("failed to create users",500))
    }
  }
}


