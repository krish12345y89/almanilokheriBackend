import { Router } from "express";
import { TempUserService } from "../service/tempUser.js";
import { ErrorHandle } from "../utils/errorHandling.js";
import { UserAuth } from "../utils/userAuth.js";
const app = Router();
const tempServices = new TempUserService();
const auth = new UserAuth();
app.post("/tempSignUp", async (req, res, next) => {
    try {
        const data = req.body;
        console.log(data);
        if (!data.email || !data.uuid) {
            return next(new ErrorHandle("Please provide both uuid and email", 400));
        }
        const user = await tempServices.tempUserSignUp(data, next);
        if (user) {
            res.status(201).json({
                success: true,
                message: "user signUp successfully",
                user,
            });
        }
    }
    catch (error) {
        console.error(error);
        return next(new ErrorHandle("failed to signUp", 500));
    }
});
app.post("/tempUserSignIn", async (req, res, next) => {
    try {
        const data = req.body;
        console.log(data);
        const user = await tempServices.tempUserSignIn(data, next);
        if (!user) {
            return next(new ErrorHandle("user not found", 400));
        }
        let response = "";
        if (user) {
            if (user?.permanentUser !== true) {
                response = "tempUser";
            }
            else {
                response = "User";
            }
            return await auth.sendCookie(user._id, res, response, 200, next);
        }
    }
    catch (error) {
        console.error(error);
        return next(new ErrorHandle("failed to signIn", 500));
    }
});
export default app;
