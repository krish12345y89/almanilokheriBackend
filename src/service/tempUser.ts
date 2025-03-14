import { NextFunction } from "express";
import { ErrorHandle } from "../utils/errorHandling.js";
import { TempUserRepository } from "../dataBase/repository/tempUser.js";
import { tempUser } from "../types/user.js";
import { ITempUser } from "../dataBase/models/tempUser.js";
import { IUser } from "../dataBase/models/user.js";

export class TempUserService {
  private repository: TempUserRepository;

  constructor() {
    this.repository = new TempUserRepository();
  }

  tempUserSignUp = async (data: tempUser, next: NextFunction) => {
    try {
      if (!data || !data.email || !data.uuid) {
        return next(new ErrorHandle("Please provide email and uuid", 400));
      }
      const result = await this.repository.tempUserSignUp(data, next);
      return result;
    } catch (error) {
      console.error("Error in tempUserSignUp:", error);
      return next(new ErrorHandle("Failed to sign up user", 500));
    }
  };

  tempUserSignIn = async (data: tempUser, next: NextFunction):Promise<ITempUser | IUser | void> => {
    try {
      console.log("data in servie layer",data)
      if (!data.email || !data.uuid) {
        return next(
          new ErrorHandle("Please provide both uuid and email to sign in", 400)
        );
      }
      const result = await this.repository.tempUserSignIn(data, next);
      return result;
    } catch (error) {
      console.error("Error in tempUserSignIn:", error);
      return next(new ErrorHandle("Failed to sign in user", 500));
    }
  };
}
