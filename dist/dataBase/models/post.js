import { model, Schema, Types } from "mongoose";
import { v4 as uuid } from "uuid";
const schema = new Schema({
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
export const Post = model("Post", schema);
