import { ObjectId } from "mongoose";
import { model, Schema, Document, Types } from "mongoose";
import { v4 as uuid } from "uuid";
export interface IPost extends Document {
  user: ObjectId;
  title: string;
  description: string;
  documents: { file: string; fileName: string; publicId: string }[];
}
const schema = new Schema<IPost>({
  user: {
    type: Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  documents: [
    {
      file: {
        type: String,
        required: true,
      },
      fileName: {
        type: String,
        required: true,
      },
      publicId: {
        type: String,
        default: uuid(),
      },
    },
  ],
});
export const Post = model<IPost>("Post", schema);
