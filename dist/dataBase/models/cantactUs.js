import { model, Schema } from "mongoose";
import validator from "validator";
const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, "please enter your email"],
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            }
        }
    },
    phoneNumber: {
        type: String,
        required: [true, "please enter your phone number"],
        validate: {
            validator: function (value) {
                return validator.isMobilePhone(value, "en-IN");
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
export const Contact = model("Contact", schema);
