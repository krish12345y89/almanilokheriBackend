import { model, Schema, Document } from "mongoose";
export interface ITempUser extends Document {
  email: string;
  uuid: string;
  permanentUser:boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
const schema = new Schema<ITempUser>({
  email: {
    type: String,
    required: [true, "email is required"],
  },
  uuid: {
    type: String,
    required: [true, "uuid is required"],
  },
  permanentUser:{
    type:Boolean,
    default:false
  }
});
export const TempUser = model("TempUser", schema);
