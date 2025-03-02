import { ErrorHandle } from "../utils/errorHandling.js";
import { TempUserRepository } from "../dataBase/repository/tempUser.js";
export class TempUserService {
    constructor() {
        this.tempUserSignUp = async (data, next) => {
            try {
                if (!data || !data.email || !data.uuid) {
                    return next(new ErrorHandle("Please provide email and uuid", 400));
                }
                const result = await this.repository.tempUserSignUp(data, next);
                return result;
            }
            catch (error) {
                console.error("Error in tempUserSignUp:", error);
                return next(new ErrorHandle("Failed to sign up user", 500));
            }
        };
        this.tempUserSignIn = async (data, next) => {
            try {
                if (!data.email || !data.uuid) {
                    return next(new ErrorHandle("Please provide both uuid and email to sign in", 400));
                }
                const result = await this.repository.tempUserSignIn(data, next);
                return result;
            }
            catch (error) {
                console.error("Error in tempUserSignIn:", error);
                return next(new ErrorHandle("Failed to sign in user", 500));
            }
        };
        this.repository = new TempUserRepository();
    }
}
