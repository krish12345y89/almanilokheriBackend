import mongoose, { model, Document, Schema } from "mongoose";
import validator from "validator";
import sanitizeHtml from "sanitize-html"; // To sanitize string inputs
import { ErrorHandle } from "../../utils/errorHandling.js";

export type Proof = {
  publicId: string;
  url: string;
};

export type Refferal = {
  refferal: mongoose.Types.ObjectId;
};

export interface IUser extends Document {
  uuid: string;
  permanentUser?: boolean;
  ipAddress?: string;
  name: string;
  branch: string;
  email: string;
  phoneNumber: string;
  proof: Proof | Refferal;
  selfAdded?: boolean;
  rollNo: string;
  startYear: number;
  endYear: number;
  batch: string;
  profession: string;
  about: string;
  alternativePhoneNumber?: string;
  linkedIn?: string;
  faceBook?: string;
  twitter?: string;
  avatar: Proof;
  district: string;
  state: string;
  createdAt?: Date;
  updatedAt?: Date;
  status: "Pending" | "Approved" | "Rejected" | "Blocked";
}

const ProofSchema = new Schema<Proof>({
  publicId: {
    type: String,
    required: [true, "Proof publicId is required"],
    validate: {
      validator: (value: string) => validator.isUUID(value),
      message: "Invalid UUID format",
    },
  },
  url: {
    type: String,
    required: [true, "Proof URL is required"],
    validate: {
      validator: (value: string) => validator.isURL(value),
      message: "Invalid URL format for proof",
    },
  },
});

const schema = new Schema<IUser>(
  {
    uuid: {
      type: String,
      required: [true, "UUID is required"],
      unique: [true, "UUID already exists"],
      trim: true,
      validate: {
        validator: (value: string) => validator.isUUID(value),
        message: "Invalid UUID format",
      },
    },
    selfAdded: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "The length of the name should not exceed 50 characters"],
      match: [/^[a-zA-Z\s]+$/, "Name can only contain alphabets and spaces"],
      set: (value: string) => sanitizeHtml(value),
    },
    district: {
      type: String,
      trim: true,
      required: [true, "District is required"],
      match: [/^[a-zA-Z]+$/, "District can only contain alphabets"],
      set: (value: string) => sanitizeHtml(value),
    },
    state: {
      type: String,
      match: [/^[a-zA-Z\s]+$/, "State can only contain alphabets and spaces"],
      required: [true, "State is required"],
      set: (value: string) => sanitizeHtml(value),
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      lowercase: true,
      maxlength: [320, "Email must not exceed 320 characters"],
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "Invalid email format",
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      maxlength: [15, "Phone number must not exceed 15 characters"],
      validate: {
        validator: (value: string) => validator.isMobilePhone(value, "en-IN"),
        message: "Invalid phone number format",
      },
    },
    alternativePhoneNumber: {
      type: String,
      validate: {
        validator: (value: string) =>
          value ? validator.isMobilePhone(value) : false,
        message: "Invalid alternative phone number format",
      },
    },
    rollNo: {
      type: String,
      required: [true, "Roll number is required"],
      validate: {
        validator: (value: string) => {
          const post2000Regex = /^\d{11,13}$/;
          const pre2000Regex = /^\d+\/\d{2}$/;
          return post2000Regex.test(value) || pre2000Regex.test(value);
        },
        message:
          "Invalid roll number format. Use a 12-digit roll number or the format '400/63'.",
      },
    },
    startYear: {
      type: Number,
      required: [true, "Start year is required"],
      min: [1900, "Start year must be a valid year"],
      max: [new Date().getFullYear(), "Start year cannot be in the future"],
      maxlength: [4, "year can not extemd the length of 4 "],
    },
    endYear: {
      type: Number,
      required: [true, "End year is required"],
      min: [1900, "End year must be a valid year"],
      maxlength: [4, "year can not extemd the length of 4 "],
      max: [
        new Date().getFullYear() + 10,
        "End year cannot exceed 10 years from the current year",
      ],
    },
    batch: {
      type: String,
      required: [true, "Batch is required"],
      maxlength: [20, "Batch must not exceed 20 characters"],
      trim: true,
      set: (value: string) => sanitizeHtml(value),
    },
    branch: {
      type: String,
      required: [true, "please provide your branch"],
    },
    profession: {
      type: String,
      required: [true, "Profession is required"],
      set: (value: string) => sanitizeHtml(value),
      match: [
        /^[a-zA-Z\s]+$/,
        "profession can only contain alphabets and spaces",
      ],
    },
    about: {
      type: String,
      required: [true, "About information is required"],
      trim: true,
      match: [
        /^[a-zA-Z0-9\s]+$/,
        "State can only contain alphabets and numbers spaces",
      ],
      minlength: [10, "About section must be at least 10 characters"],
      set: (value: string) => sanitizeHtml(value),
    },
    proof: {
      type: Schema.Types.Mixed,
      required: [true, "Proof or referral is required"],
      validate: {
        validator: function (value: Proof | Refferal) {
          if (!value) return false;
          if ("url" in value && "publicId" in value) {
            return validator.isURL(value.url) && !!value.publicId;
          }
          if ("refferal" in value) {
            return mongoose.Types.ObjectId.isValid(value.refferal);
          }
          return false;
        },
        message: "Proof must be valid or include a valid referral ObjectId",
      },
    },
    avatar: {
      type: ProofSchema,
      required: [true, "Avatar is required"],
    },
    linkedIn: {
      type: String,
      validate: {
        validator: (value: string) =>
          value
            ? validator.isURL(value, { protocols: ["http", "https"] })
            : true,
        message: "Invalid LinkedIn URL",
      },
    },
    twitter: {
      type: String,
      validate: {
        validator: (value: string) =>
          value
            ? validator.isURL(value, { protocols: ["http", "https"] })
            : true,
        message: "Invalid Twitter URL",
      },
    },
    faceBook: {
      type: String,
      validate: {
        validator: (value: string) =>
          value
            ? validator.isURL(value, { protocols: ["http", "https"] })
            : true,
        message: "Invalid Facebook URL",
      },
    },
    ipAddress: {
      type: String,
      required: [true, "Ip is required"],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Blocked"],
      default: "Pending",
      required: [true, "Status is required"],
    },
    permanentUser: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

function validateKeysAndValues(obj: any, path: string[] = []) {
  if (typeof obj !== "object" || obj === null) return;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullPath = [...path, key].join(".");

      if (key.startsWith("$")) {
        continue;
      }

      // Prevent prototype pollution
      if (["__proto__", "constructor", "prototype"].includes(key)) {
        throw new Error(`Invalid key detected: '${fullPath}'`);
      }

      // Prevent MongoDB operators
      if (key.includes(".")) {
        throw new Error(`Invalid key detected: '${fullPath}'`);
      }

      // If value is an object or array, recurse
      if (typeof obj[key] === "object" && obj[key] !== null) {
        validateKeysAndValues(obj[key], [...path, key]);
      }
    }
  }
}

const IMMUTABLE_FIELDS = [];

schema.pre("save", async function (next) {
  const doc = this as IUser;

  // Validate keys recursively for NoSQL injection and prototype pollution
  await validateKeysAndValues(doc);

  // Prevent changes to immutable fields
  IMMUTABLE_FIELDS.forEach((field) => {
    if (doc.isModified(field)) {
      next(new ErrorHandle(`Modification of '${field}' is not allowed`, 500));
    }
  });

  // Sanitize all string fields
  Object.keys(doc.toObject()).forEach((key) => {
    if (typeof doc[key] === "string") {
      doc[key] = sanitizeHtml(doc[key]);
    }
  });

  next();
});

export const User = model<IUser>("User", schema);
