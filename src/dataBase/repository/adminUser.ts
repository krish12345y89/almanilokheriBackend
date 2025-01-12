import { NextFunction } from "express";
import { UserAuth } from "../../utils/userAuth.js";
import { AdminUser } from "../models/adminUser.js";

export class Admin {
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
}
