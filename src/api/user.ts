import { NextFunction, Request, Router, Response } from "express";
import { userService } from "../service/user.js";
import { IUser, User } from "../dataBase/models/user.js";
import mongoose, { ObjectId } from "mongoose";
import { searchUserType, userType } from "../types/user.js";
import upload from "../utils/multerS3.js";
import { ErrorHandle, errorHandler2 } from "../utils/errorHandling.js";
import {
  userSignUpValidation,
  validateErrors,
  validateSearchUser,
} from "../validation/userValidation.js";
const app = Router();
const userControllers = new userService();

app.post(
  "/signUp",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "proof", maxCount: 1 },
  ]),
  userSignUpValidation,
  validateErrors,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data: userType = req.body;
      const avatar: Express.MulterS3.File = req.files?.["avatar"]?.[0];
      const proofFile: Express.MulterS3.File = req.files?.["proof"]?.[0];

      if (!data) {
        return next(new ErrorHandle("Data is required", 400, true, true));
      }

      if (!proofFile && !data.proof) {
        return next(
          new ErrorHandle(
            "Please provide either proof or a referral user to validate yourself",
            400,
            false,
            true
          )
        );
      }

      let proofData: userType["proof"];
      if (proofFile) {
        proofData = proofFile.location;
      } else if (data.proof && mongoose.Types.ObjectId.isValid(data.proof)) {
        proofData = data.proof;
      } else {
        return next(
          new ErrorHandle(
            "Proof must be either a valid file or a referral ObjectId",
            400,
            false,
            true
          )
        );
      }

      if (!avatar) {
        return res
          .status(400)
          .json({ success: false, message: "Avatar file is required" });
      }

      const avatarUrl = avatar.location;
      data.proof = proofData;
      data.avatar = avatarUrl;
      console.log(data);
      const result = await userControllers.signUp(data, next);

      if (!result) {
        return next(new ErrorHandle("User sign-up failed", 500));
      }

      return res.status(201).json({
        success: true,
        message: "User signed up successfully",
        data: result,
      });
    } catch (error: any) {
      errorHandler2(error, next);
    }
  }
);

app.get(
  "/searchUser",
  validateSearchUser,
  validateErrors,
  async (
    req: Request<{}, {}, {}, searchUserType>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { name, email, phoneNumber, rollNo } = req.query;
      if (!name && !email && !phoneNumber && !rollNo) {
        next(new ErrorHandle("search can not be empty", 400));
      }
      const data: searchUserType = {};
      if (name) {
        data.name = name;
      }
      if (email) {
        data.email = email;
      }
      if (phoneNumber) {
        data.phoneNumber = phoneNumber;
      }
      if (rollNo) {
        data.rollNo = rollNo;
      }
      const result = await userControllers.findUser(data, next);

      res.status(200).json({
        success: true,
        result,
      });
    } catch (error) {
      next(new ErrorHandle("user search failed", 500));
    }
  }
);

app.put(
  "/updatePending/:_id",
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "proof", maxCount: 1 },
  ]),
  async (req: Request<{ _id: string }>, res: Response, next: NextFunction) => {
    try {
      const _id = req.params._id;
      console.log(_id);
      const data: userType = req.body;
      const avatar = req.files?.["avatar"]?.[0];
      const proofFile = req.files?.["proof"]?.[0];
      if (!_id) {
        return next(
          new ErrorHandle(
            "Please signIn first to update yourself",
            400,
            false,
            true
          )
        );
      }
      if (!data) {
        return next(
          new ErrorHandle(
            "Please provide any field to update",
            400,
            false,
            true
          )
        );
      }
      if (proofFile) {
        data.proof = proofFile.location;
      }
      if (data.proof) {
        if (!mongoose.Types.ObjectId.isValid(data.proof) && !proofFile) {
          return next(
            new ErrorHandle("Please provide a valid proof", 400, false, true)
          );
        }
      }
      if (avatar) {
        data.avatar = avatar.location;
      }
      console.log(data);
      const result = await userControllers.updatePending(_id, data, next);
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        result,
      });
    } catch (error) {
      console.log(error);
      return next(new ErrorHandle("failed to update user", 500));
    }
  }
);

app.put(
  "/updateUser/:_id",
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    { name: "proof", maxCount: 1 },
  ]),
  async (req: Request<{ _id: string }>, res: Response, next: NextFunction) => {
    try {
      const _id = req.params._id;
      const data: userType = req.body;
      const avatar = req.files?.["avatar"]?.[0];
      console.log(data);
      console.log(_id);
      if (!_id) {
        next(new ErrorHandle("please login first", 401));
      }
      if (!data) {
        next(
          new ErrorHandle("please provide any field to update yourself", 401)
        );
      }
      if (avatar) {
        data.avatar = avatar?.location;
      }
      console.log(data);
      const result = await userControllers.update(_id, data, next);
      res.status(200).json({
        success: true,
        message: "User updated successfully",
        result,
      });
    } catch (error) {
      console.error(error);
      return next(
        new ErrorHandle("failed approved user update at api level", 500)
      );
    }
  }
);

app.put(
  "/updateStatus/:_id",
  upload.none(),
  async (
    req: Request<{}, {}, { status: IUser["status"]; id: string }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { status, id } = req.body;
      if (!id) {
        next(new ErrorHandle("please pprovide id", 400));
      }
      if (!status) {
        next(new ErrorHandle("please provide status", 400));
      }
      if (status!=="Approved" && status!=="Blocked" && status!=="Pending" && status!=="Rejected") {
        next(new ErrorHandle("please provide a valid status", 400));
      }
      const result = await userControllers.updateStatus(id, status, next);
      if (result) {
        res.status(200).json({
          success: true,
          message: "Users status updated successfully",
        });
      }
    } catch (error) {
      console.error(error);
      next(
        new ErrorHandle("failed update user update status at api level", 500)
      );
    }
  }
);
export default app;
