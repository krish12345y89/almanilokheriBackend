import { UserAuth } from "../../utils/userAuth.js";
import { AdminUser } from "../models/adminUser.js";
import { ErrorHandle } from "../../utils/errorHandling.js";
import { User } from "../models/user.js";
export class AdminRepository {
    constructor() {
        this.getAllUsers = async (data, next) => {
            try {
                if (data.createdAtStart &&
                    isNaN(new Date(data.createdAtStart).getTime())) {
                    return next(new ErrorHandle("Invalid createdAtStart date format", 400));
                }
                if (data.createdAtEnd && isNaN(new Date(data.createdAtEnd).getTime())) {
                    return next(new ErrorHandle("Invalid createdAtEnd date format", 400));
                }
                const query = {
                    ...(data.status && { status: data.status }),
                    ...(data.branch && { batch: data.branch }),
                    ...(data.batch && { batch: data.batch }),
                    ...(data.createdAtStart && {
                        createdAt: {
                            $gte: new Date(data.createdAtStart),
                            $lte: new Date(data.createdAtEnd || Date.now()),
                        },
                    }),
                };
                console.log(new Date(data.createdAtStart));
                console.log(query);
                const pipeline = [
                    { $match: query },
                    { $sort: { [data.sortType || "createdAt"]: data.sort ?? -1 } },
                    { $skip: data.page ? (data.page - 1) * (data.limit ?? 20) : 0 },
                    { $limit: data.limit ?? 20 },
                ];
                const users = await User.aggregate(pipeline);
                return users;
            }
            catch (error) {
                console.error("Error fetching users:", error);
                next(new ErrorHandle("Failed to get all users", 500));
            }
        };
        this.auth = new UserAuth();
    }
    async signIn(email, password, next) {
        try {
            const user = await AdminUser.findOne({ email: email });
            const match = await this.auth.comparePassword(password, user.password);
            if (!user || match) {
                throw new Error("unauthorised");
            }
        }
        catch (error) {
            console.error("error in admin login", error);
            next(error);
        }
    }
}
