import { NextFunction, Request, Response, Router } from "express";
import { TempUserService } from "../service/tempUser.js";
import { tempUser } from "../types/user.js";
import { ErrorHandle } from "../utils/errorHandling.js";
import { UserAuth } from "../utils/userAuth.js";

const app = Router();
const tempServices: TempUserService = new TempUserService();
const auth:UserAuth=new UserAuth();
app.post("/tempSignUp", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: tempUser = req.body;
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
  } catch (error) {
    console.error(error);
    return next(new ErrorHandle("failed to signUp", 500));
  }
});

app.post("/tempUserSignIn", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data: tempUser = req.body;
    if (!data.email || !data.uuid) {
      return next(new ErrorHandle("please provide both uuid and email to signIn", 400));
    }
    const user = await tempServices.tempUserSignIn(data, next);
    let response=""
    if (user) {
      if(user.permanentUser){
        response="tempUser"
      }
      else{
        response="User"
      }
      return await auth.sendCookie(user,res,response,200,next)
    }
  } catch (error) {
    console.error(error);
    return next(new ErrorHandle("failed to signIn", 500));
  }
});

export default app;
