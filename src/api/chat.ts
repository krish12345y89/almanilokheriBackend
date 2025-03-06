import  {Router} from "express"
import {upload} from "../utils/multerS3.js";
import { changeStatus, getNotifications, newGroupChat } from "../service/chat.js";
import { changeStatusValidator, getValidator, requestValidator } from "../validation/chat.js";
const app=Router();
app.post("/createChat",upload.single("file"),newGroupChat);
app.post('/change-status', requestValidator, changeStatusValidator, changeStatus);
app.post('/get-notifications', requestValidator, getValidator, getNotifications);