import { NextFunction } from "express";
import { userFilter } from "../types/user.js";
import { ErrorHandle } from "../utils/errorHandling.js";
import { AdminRepository } from "../dataBase/repository/admin.js";

export class AdminService {
  private adminRepository: AdminRepository;
  constructor() {
    this.adminRepository = new AdminRepository();
  }

  getAllUsersService = async (data: userFilter, next: NextFunction) => {
    try {
      if (!data) {
        return next(new ErrorHandle("data is required", 400));
      }
      const newData=Object.fromEntries(
        Object.entries(data).filter(([_,value])=>{
            return value!==null
        })
      )
      console.log(newData)
      const result = await this.adminRepository.getAllUsers(newData,next)
      return result
    } catch (error) {
        next(new ErrorHandle("failed to get all users",500))
    }
  };
}
