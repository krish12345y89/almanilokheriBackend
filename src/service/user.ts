import { NextFunction } from "express";
import { IUser, Proof, Refferal, User } from "../dataBase/models/user.js";
import { UserRepository } from "../dataBase/repository/user.js";
import {
  searchUserType,
  updatePendingUser,
  updateUser,
  userType,
} from "../types/user.js";
import { ErrorHandle, errorHandler2 } from "../utils/errorHandling.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import Mail from "../mail/main.js";
import { DirectConfig, DirectExchange } from "../messageBrokers/directExchange.js";
const uri=process.env.RABBIT_MQ_URI as string;
const exchangeName=process.env.USER_EXCHANGE as string;
export const registerdEvent = process.env.EVENT_REGISTERED as string;
export const ActiveEvent = process.env.EVENT_APPROVED as string;
export class userService {
  private next: NextFunction;
  private repository: UserRepository;
  private mail: Mail;
  private mailingQueue = process.env.Registered_Queue as string;
  private regesteresRouteKey = process.env.REGISTERED_ROUTING_KEY as string;
  private config:DirectConfig={
    uri:uri,
    exchangeName:exchangeName
  }
  private directExchange:DirectExchange;
  constructor() {
    this.repository = new UserRepository();
    this.mail = new Mail();
    this.directExchange = new DirectExchange(this.config,this.next)
  }

  async signUp(data: userType, next: NextFunction) {
    try {
      if (data) {
        console.log("service received the unOrgnised Data", data);
      }
      let newData: any = {
        uuid: data.uuid,
        phoneNumber: data.phoneNumber,
        startYear: data.startYear,
        endYear: data.endYear,
        name: data.name,
        district: data.district,
        state: data.state,
        email: data.email,
        rollNo: data.rollNo,
        batch: `${data.startYear}-${data.endYear}`,
        status: "Pending",
        about: data.about,
        profession: data.profession,
        avatar: {
          publicId: uuidv4(),
          url: data.avatar,
        },
        proof: mongoose.Types.ObjectId.isValid(data.proof)
          ? { refferal: data.proof as mongoose.Types.ObjectId } 
          : { publicId: uuidv4(), url: data.proof as string }, 
        linkedIn : data.linkedIn,
        faceBook : data.faceBook,
        twitter: data.twitter,
        alternativePhoneNumber : data.alternativePhoneNumber,
        ipAddress : data.ip
      };

      console.log(
        "service layer Orgnised th data and sended to repo layer",
        newData
      );
      const user = await this.repository.userSignUp(newData, next);
      if (user) {
        const data={
          event:registerdEvent,
          data:{
            name:user.name,
            email:user.email,
            _id:user._id
          }
        }
        this.directExchange.sendMessage(data,this.mailingQueue,this.regesteresRouteKey,1000*60*10)
        return user;
      }
    } catch (error: any) {
      errorHandler2(error, next);
    }
  }

  async findUser(data: searchUserType, next: NextFunction) {
    try {
      const result = await this.repository.searchUser(data, next);
      return result;
    } catch (error) {
      await errorHandler2(error, next);
    }
  }

  async updatePending(_id: string, data: userType, next: NextFunction) {
    try {
      console.log(_id);
      const us = await User.findById(_id);
      if (!us) {
        return next(
          new ErrorHandle("Please signUp first to update yourself", 401)
        );
      }

      if (us.status !== "Pending" && us.status !== "Rejected") {
        return next(
          new ErrorHandle(
            "Only Pending and Rejected user can update the whole data.",
            401
          )
        );
      }

      let rollNo: null | string = null;
      let phoneNumber: null | string = null;
      if (data.rollNo) {
        const existingUser = await User.findOne({
          rollNo: data.rollNo,
          _id: { $ne: us._id },
        });

        if (existingUser) {
          return next(
            new ErrorHandle("Roll number already taken by another user", 400)
          );
        } else {
          rollNo = data.rollNo;
        }
      }

      if (data.phoneNumber) {
        const existingUser = await User.findOne({
          phoneNumber: data.phoneNumber,
          _id: { $ne: us._id },
        });

        if (existingUser) {
          return next(
            new ErrorHandle("Phone number already taken by another user", 400)
          );
        } else {
          phoneNumber = data.phoneNumber;
        }
      }

      let proof: IUser["proof"];
      let avatar: IUser["avatar"];
      if (data.proof) {
        if (mongoose.Types.ObjectId.isValid(data.proof)) {
          proof = { refferal: new mongoose.Types.ObjectId(data.proof) };
        } else {
          proof = {
            url: String(data.proof),
            publicId: uuidv4(),
          };
        }
      }
      if (data.avatar) {
        avatar = {
          url: data.avatar,
          publicId: uuidv4(),
        };
      }
      let newData: updatePendingUser = {
        phoneNumber: phoneNumber,
        startYear: data.startYear || null,
        endYear: data.endYear || null,
        name: data.name || null,
        district: data.district || null,
        state: data.state || null,
        rollNo: rollNo,
        batch:
          data.startYear && data.endYear
            ? `${data.startYear}-${data.endYear}`
            : null,
        about: data.about || null,
        profession: data.profession || null,
        avatar: avatar || null,
        proof: proof || null,
      };
      console.log(newData);

      newData = <updatePendingUser>(
        Object.fromEntries(
          Object.entries(newData).filter(([_, value]) => value !== null)
        )
      );

      const user = await this.repository.userUpdateForPending(
        _id,
        newData,
        next
      );
      if (!user) {
        return next(new ErrorHandle("Failed to update user details", 500));
      }
      console.log(user);
      return user;
    } catch (error) {
      console.log(error);
      next(new ErrorHandle("Failed to update user details", 500));
    }
  }

  async update(_id: string, data: userType, next: NextFunction) {
    try {
      if (!_id) {
        next(new ErrorHandle("Please login first", 401));
      }
      if (!data) {
        next(
          new ErrorHandle("Please provide any field to update yourself", 401)
        );
      }
      const us = await User.findById(_id);
      if (!us) {
        next(new ErrorHandle("Please signUp first to update yourself", 401));
      }
      if (us.status !== "Approved") {
        next(
          new ErrorHandle(
            "only Approved user can update this , we are redirecting you to differnent update profile section",
            401
          )
        );
      }

      let newData: updateUser = {
        district: data.district || null,
        state: data.state || null,
        about: data.about || null,
        avatar: data.avatar ? { publicId: uuidv4(), url: data.avatar } : null,
        alternativePhoneNumber: data.alternativePhoneNumber || null,
        profession: data.profession || null,
        linkedIn: data.linkedIn || null,
        faceBook: data.faceBook || null,
        twitter: data.twitter || null,
      };

      newData = Object.fromEntries(
        Object.entries(newData).filter(([_, value]) => {
          return value !== null;
        })
      );

      const user = await this.repository.userUpdate(_id, newData, next);
      if (user) {
        return user;
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async delete(uuid: string, next: NextFunction) {
    try {
      await this.repository.userDelete(uuid, next);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateStatus(_id: string, status: IUser["status"], next: NextFunction) {
    try {
      console.log(status)
      const user = await this.repository.updateStatus(_id, status, next);
      if(status=="Approved"){
        console.log(status)
        const data={
          event:ActiveEvent,
          data:{
            name:user.name,
            email:user.email
          }
        }
        this.directExchange.sendMessage(data,this.mailingQueue,this.regesteresRouteKey,10000)
      }
      if (user) {
        return user;
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
}
