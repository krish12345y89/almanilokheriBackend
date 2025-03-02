import { model, Schema } from "mongoose";
const schema = new Schema({
    email: {
        type: String,
        required: [true, "email is required"],
    },
    uuid: {
        type: String,
        required: [true, "uuid is required"],
    },
    permanentUser: {
        type: Boolean,
        default: false
    }
});
export const TempUser = model("TempUser", schema);
