import { model, Schema, Document } from "mongoose";
import validator from "validator";
export interface IContact extends Document {
    name: string,
    email: string,
    phoneNumber: string,
    query: string,
    document: {
        publicId: string,
        file: string,
        fileName: string
    },
    readedByAdmin: boolean
}
const schema = new Schema<IContact>({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        validate: {
            validator: function (value: string) {
                return validator.isEmail(value)
            }
        }
    },
    phoneNumber: {
        type: String,
        required: [true, "please enter your phone number"],
        validate: {
            validator: function (value: string) {
                return validator.isMobilePhone(value, "en-IN")
            }
        }
    },
    query: {
        type: String,
        required: [true, "please enter the query you need to resolve"]
    },
    readedByAdmin: {
        type: Boolean,
        default: false
    }
});
export const Contact = model<IContact>("Contact", schema);