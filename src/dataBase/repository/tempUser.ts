import { NextFunction } from "express";
import { TempUser } from "../models/tempUser.js";
import { tempUser } from "../../types/user.js";
import { ErrorHandle } from "../../utils/errorHandling.js";

export class TempUserRepository {
  async tempUserSignUp(data: tempUser, next: NextFunction) {
    try {
      const ifUser = await TempUser.findOne({$or:[{ email: data.email},{uuid:data.uuid}]});
      if (ifUser) {
        return next(new ErrorHandle("User already exists with this email or uuid , please go to the signIn page", 400));
      }
      const user = new TempUser(data);
      await user.save();
      return user;
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }

  async tempUserSignIn(data: tempUser, next: NextFunction) {
    try {
      if (!data.email || !data.uuid) {
        throw new Error("Please provide both UUID and Email to signIn");
      }
      const user = await TempUser.findOne({ email: data.email, uuid: data.uuid });
      if (!user) {
        return next(new ErrorHandle("Please sign up first to sign in here!", 400));
      }
      return user;
    } catch (error) {
      console.error(error);
      return next(error);
    }
  }
}
 