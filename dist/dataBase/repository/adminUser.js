import { UserAuth } from "../../utils/userAuth.js";
import { AdminUser } from "../models/adminUser.js";
export class Admin {
    constructor() {
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
