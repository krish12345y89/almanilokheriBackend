import { model, Document, Schema } from "mongoose";
export interface IAdminUser extends Document {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
  updatedAt?: Date;
}
const schema = new Schema<IAdminUser>({
  name: {
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
export const AdminUser = model<IAdminUser>("AdminUser", schema);
