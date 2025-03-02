import { User } from "../models/user.js";
import { TempUser } from "../models/tempUser.js";
import { ErrorHandle, errorHandler2 } from "../../utils/errorHandling.js";
export class UserRepository {
    async userSignUp(data, next) {
        try {
            if (data) {
                console.log("repo received the data to save in dataBase");
            }
            console.log("data in start reporsitory", data);
            if (!data) {
                return next(new ErrorHandle("fialed to get the user data", 400, true, true));
            }
            const tempUser = await TempUser.findOne({ uuid: data.uuid });
            if (!tempUser) {
                return next(new ErrorHandle("There is no user to signUp", 400, true, true));
            }
            const user = new User(data);
            console.log("user has been successfully signedUp", user);
            await user.save();
            return user;
        }
        catch (err) {
            await errorHandler2(err, next);
        }
    }
    async searchUser(data, next) {
        try {
            if (!data) {
                return next(new ErrorHandle("data is required", 400));
            }
            let search = [];
            if (data.name) {
                search.push({ name: { $regex: new RegExp(data.name, "i") } });
            }
            if (data.email) {
                search.push({ nemail: { $regex: new RegExp(data.email, "i") } });
            }
            if (data.phoneNumber) {
                search.push({ phoneNumber: { $regex: new RegExp(data.phoneNumber, "i") } });
            }
            if (data.rollNo) {
                search.push({ rollNo: { $regex: new RegExp(data.rollNo, "i") } });
            }
            const result = await User.aggregate([
                { $match: { status: "Pending", $or: search ? search : [{}] } },
                {
                    $project: { name: 1, email: 1, phoneNumber: 1, branch: 1, rollNo: 1 },
                },
            ]);
            return result;
        }
        catch (error) {
            console.error(error);
            return next(new ErrorHandle("User search Failed", 500, true, true));
        }
    }
    async userUpdateForPending(_id, data, next) {
        try {
            if (!data || !_id) {
                throw new Error("Failed to get the data or uuid");
            }
            if (data.proof) {
            }
            const user = await User.findOneAndUpdate({ _id: _id, status: { $in: ["Pending", "Rejected"] } }, data, { new: true });
            if (!user) {
                throw new Error("There is no user for Updation");
            }
            // mail to clg that use has updated his details
            return user;
        }
        catch (err) {
            console.error(err);
            next(err);
        }
    }
    async userUpdate(_id, data, next) {
        try {
            if (!data || !_id) {
                throw new Error("Failed to get the data or uuid");
            }
            const user = await User.findOneAndUpdate({ _id: _id, status: "Approved" }, data, { new: true });
            if (!user) {
                throw new Error("There is no user for Updation");
            }
            return user;
        }
        catch (err) {
            console.error(err);
            next(err);
        }
    }
    async userDelete(uuid, next) {
        try {
            const user = await User.findOneAndDelete({ uuid: uuid });
            if (!user) {
                throw new Error("There is no user to delete");
            }
            await TempUser.findOneAndDelete({ uuid: uuid });
        }
        catch (err) {
            console.error(err);
            next(err);
        }
    }
    async updateStatus(_id, status, next) {
        try {
            const user = await User.findByIdAndUpdate({ _id: _id }, { $set: { status: status } });
            if (!user) {
                throw new Error("There is no user to update the status");
            }
            return user;
        }
        catch (err) {
            console.error(err);
            next(err);
        }
    }
}
