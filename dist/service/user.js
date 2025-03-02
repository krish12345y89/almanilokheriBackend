import { User } from "../dataBase/models/user.js";
import { UserRepository } from "../dataBase/repository/user.js";
import { ErrorHandle, errorHandler2 } from "../utils/errorHandling.js";
import { v4 as uuidv4 } from "uuid";
import mongoose from "mongoose";
import Mail from "../mail/main.js";
import { DirectExchange } from "../messageBrokers/directExchange.js";
const uri = process.env.RABBIT_MQ_URI;
const exchangeName = process.env.USER_EXCHANGE;
export const registerdEvent = process.env.EVENT_REGISTERED;
export const ActiveEvent = process.env.EVENT_APPROVED;
export class userService {
    constructor() {
        this.mailingQueue = process.env.Registered_Queue;
        this.regesteresRouteKey = process.env.REGISTERED_ROUTING_KEY;
        this.config = {
            uri: uri,
            exchangeName: exchangeName
        };
        this.repository = new UserRepository();
        this.mail = new Mail();
        this.directExchange = new DirectExchange(this.config, this.next);
    }
    async signUp(data, next) {
        try {
            if (data) {
                console.log("service received the unOrgnised Data", data);
            }
            let newData = {
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
                    ? { refferal: data.proof }
                    : { publicId: uuidv4(), url: data.proof },
                linkedIn: data.linkedIn,
                faceBook: data.faceBook,
                twitter: data.twitter,
                alternativePhoneNumber: data.alternativePhoneNumber,
                ipAddress: data.ip
            };
            console.log("service layer Orgnised th data and sended to repo layer", newData);
            const user = await this.repository.userSignUp(newData, next);
            if (user) {
                const data = {
                    event: registerdEvent,
                    data: {
                        name: user.name,
                        email: user.email,
                        _id: user._id
                    }
                };
                this.directExchange.sendMessage(data, this.mailingQueue, this.regesteresRouteKey, 1000 * 60 * 10);
                return user;
            }
        }
        catch (error) {
            errorHandler2(error, next);
        }
    }
    async findUser(data, next) {
        try {
            const result = await this.repository.searchUser(data, next);
            return result;
        }
        catch (error) {
            await errorHandler2(error, next);
        }
    }
    async updatePending(_id, data, next) {
        try {
            console.log(_id);
            const us = await User.findById(_id);
            if (!us) {
                return next(new ErrorHandle("Please signUp first to update yourself", 401));
            }
            if (us.status !== "Pending" && us.status !== "Rejected") {
                return next(new ErrorHandle("Only Pending and Rejected user can update the whole data.", 401));
            }
            let rollNo = null;
            let phoneNumber = null;
            if (data.rollNo) {
                const existingUser = await User.findOne({
                    rollNo: data.rollNo,
                    _id: { $ne: us._id },
                });
                if (existingUser) {
                    return next(new ErrorHandle("Roll number already taken by another user", 400));
                }
                else {
                    rollNo = data.rollNo;
                }
            }
            if (data.phoneNumber) {
                const existingUser = await User.findOne({
                    phoneNumber: data.phoneNumber,
                    _id: { $ne: us._id },
                });
                if (existingUser) {
                    return next(new ErrorHandle("Phone number already taken by another user", 400));
                }
                else {
                    phoneNumber = data.phoneNumber;
                }
            }
            let proof;
            let avatar;
            if (data.proof) {
                if (mongoose.Types.ObjectId.isValid(data.proof)) {
                    proof = { refferal: new mongoose.Types.ObjectId(data.proof) };
                }
                else {
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
            let newData = {
                phoneNumber: phoneNumber,
                startYear: data.startYear || null,
                endYear: data.endYear || null,
                name: data.name || null,
                district: data.district || null,
                state: data.state || null,
                rollNo: rollNo,
                batch: data.startYear && data.endYear
                    ? `${data.startYear}-${data.endYear}`
                    : null,
                about: data.about || null,
                profession: data.profession || null,
                avatar: avatar || null,
                proof: proof || null,
            };
            console.log(newData);
            newData = (Object.fromEntries(Object.entries(newData).filter(([_, value]) => value !== null)));
            const user = await this.repository.userUpdateForPending(_id, newData, next);
            if (!user) {
                return next(new ErrorHandle("Failed to update user details", 500));
            }
            console.log(user);
            return user;
        }
        catch (error) {
            console.log(error);
            next(new ErrorHandle("Failed to update user details", 500));
        }
    }
    async update(_id, data, next) {
        try {
            if (!_id) {
                next(new ErrorHandle("Please login first", 401));
            }
            if (!data) {
                next(new ErrorHandle("Please provide any field to update yourself", 401));
            }
            const us = await User.findById(_id);
            if (!us) {
                next(new ErrorHandle("Please signUp first to update yourself", 401));
            }
            if (us.status !== "Approved") {
                next(new ErrorHandle("only Approved user can update this , we are redirecting you to differnent update profile section", 401));
            }
            let newData = {
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
            newData = Object.fromEntries(Object.entries(newData).filter(([_, value]) => {
                return value !== null;
            }));
            const user = await this.repository.userUpdate(_id, newData, next);
            if (user) {
                return user;
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async delete(uuid, next) {
        try {
            await this.repository.userDelete(uuid, next);
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
    async updateStatus(_id, status, next) {
        try {
            console.log(status);
            const user = await this.repository.updateStatus(_id, status, next);
            if (status == "Approved") {
                console.log(status);
                const data = {
                    event: ActiveEvent,
                    data: {
                        name: user.name,
                        email: user.email
                    }
                };
                this.directExchange.sendMessage(data, this.mailingQueue, this.regesteresRouteKey, 10000);
            }
            if (user) {
                return user;
            }
        }
        catch (error) {
            console.log(error);
            next(error);
        }
    }
}
