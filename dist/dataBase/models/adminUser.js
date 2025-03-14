import { model, Schema } from "mongoose";
const schema = new Schema({
    userName: {
        type: String,
        required: [true, "please enter your name"],
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
    },
    password: {
        type: String,
        required: [true, "please enter your password"],
    },
});
export const AdminUser = model("AdminUser", schema);
