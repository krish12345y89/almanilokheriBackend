import { Types } from "mongoose";
import { Proof, Refferal } from "../dataBase/models/user.js";

export type userType = {
  uuid?: string;
  name?: string;
  ip? : string;
  email?: string;
  phoneNumber?: string;
  proof?: Types.ObjectId | string;
  rollNo?: string;
  startYear?: number;
  endYear?: number;
  batch?: string;
  profession?: string;
  about?: string;
  alternativePhoneNumber?: string;
  linkedIn?: string;
  faceBook?: string;
  twitter?: string;
  avatar?: string;
  district?: string;
  state?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: "Pending" | "Approved" | "Rejected" | "Blocked";
};

export type updateUser = {
  linkedIn?: string;
  avatar?:Proof;
  faceBook?: string;
  twitter?: string;
  about?: string;
  profession?: string;
  alternativePhoneNumber?: string;
  state?: string;
  district?: string;
};

export type tempUser = {
  email: string;
  uuid: string;
};

export type searchUserType = {
  name?: string;
  email?: string;
  phoneNumber?: string;
  rollNo?: string;
};


export type updatePendingUser = {
  name?: string;
  phoneNumber?: string;
  proof?: Refferal | Proof;
  rollNo?: string;
  startYear?: number;
  endYear?: number;
  batch?: string;
  profession?: string;
  about?: string;
  linkedIn?: string;
  faceBook?: string;
  twitter?: string;
  avatar?: Proof;
  district?: string;
  state?: string;
  alternativePhoneNumber?: string;
};

export type userFilter = {
  page?:number;
  branch?:string;
  status?:string;
  limit?:number;
  batch?:string;
  sortType?:any;
  sort?:number;
  createdAtStart?:Date;
  createdAtEnd?:Date;
  updatedAt?:Date;
}