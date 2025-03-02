import { ErrorHandle } from "../utils/errorHandling.js";
import { AdminRepository } from "../dataBase/repository/admin.js";
export class AdminService {
    constructor() {
        this.getAllUsersService = async (data, next) => {
            try {
                if (!data) {
                    return next(new ErrorHandle("data is required", 400));
                }
                const newData = Object.fromEntries(Object.entries(data).filter(([_, value]) => {
                    return value !== null;
                }));
                const result = await this.adminRepository.getAllUsers(newData, next);
                return result;
            }
            catch (error) {
                next(new ErrorHandle("failed to get all users", 500));
            }
        };
        this.adminRepository = new AdminRepository();
    }
}
