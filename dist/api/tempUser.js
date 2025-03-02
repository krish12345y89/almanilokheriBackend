import { Router } from "express";
import { TempUserService } from "../service/tempUser.js";
import { ErrorHandle } from "../utils/errorHandling.js";
const app = Router();
const tempServices = new TempUserService();
app.post("/tempSignUp", async (req, res, next) => {
    try {
        const data = req.body;
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
        if (!data.email || !data.uuid) {
            return next(new ErrorHandle("please provide both uuid and email to signIn", 400));
        }
        const user = await tempServices.tempUserSignIn(data, next);
        if (user) {
            res.status(200).json({
                success: true,
                message: "user signIn successfully",
                user,
            });
        }
    }
    catch (error) {
        console.error(error);
        return next(new ErrorHandle("failed to signIn", 500));
    }
});
export default app;
