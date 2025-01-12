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
  ipAddress?:string;
  name: string;
  email: string;
  phoneNumber: string;
  proof: Proof | Refferal;
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
 
// Embedded Proof Schema
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

// Main User Schema
const schema = new Schema<IUser>(
  {
    uuid: {
      type: String,
      required: [true, "UUID is required"],
      unique: [true, "UUID already exists"],
      validate: {
        validator: (value: string) => validator.isUUID(value),
        message: "Invalid UUID format",
      },
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [20, "The length of the name should not be greater than 20"],
      match: [/^[a-zA-Z\s]+$/, "Name can only contain alphabets and spaces"], // Restrict to alphabets and spaces
      set: (value: string) => sanitizeHtml(value),
    },
    district: {
      type: String,
      required: [true, "District is required"],
      match: [/^[a-zA-Z\s]+$/, "District can only contain alphabets and spaces"],
      set: (value: string) => sanitizeHtml(value),
    },
    
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: [true, "Email already exists"],
      lowercase: true,
      maxlength: [320, "Email must not exceed 320 characters"], // Standard max email length
      validate: {
        validator: (value: string) => validator.isEmail(value),
        message: "Invalid email format",
      },
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      maxlength: [15, "Phone number must not exceed 15 characters"], // Standard max phone length
      validate: {
        validator: (value: string) => validator.isMobilePhone(value, "en-IN"),
        message: "Invalid phone number format",
      },
    },
    
    alternativePhoneNumber: {
      type: String,
      validate: {
        validator: (value: string) =>
          value ? validator.isMobilePhone(value) : true,
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

          console.log("Validating roll number:", value);
          return post2000Regex.test(value) || pre2000Regex.test(value);
        },
        message:
          "Invalid roll number format. Use a 12-digit roll number or the format '400/63'.",
      },
    },
    ipAddress: {
      type: String,
      validate: {
        validator: (value: string) => validator.isIP(value),
        message: "Invalid IP address format",
      },
    },
    
    profession: {
      type: String,
      required: [true, "Profession is required"],
      trim: true,
      set: (value: string) => sanitizeHtml(value),
    },
    about: {
      type: String,
      required: [true, "About information is required"],
      trim: true,
      minlength: [10, "About section must be at least 10 characters"],
      set: (value: string) => sanitizeHtml(value),
    },
    state: {
      type: String,
      required: [true, "State is required"],
      set: (value: string) => sanitizeHtml(value),
    },
    proof: {
      type: Schema.Types.Mixed, // Allows flexibility for Proof or Refferal
      required: [true, "Proof or referral is required"],
      validate: {
        validator: function (value: Proof | Refferal) {
          if (!value) return false;

          // Check for Proof structure
          if ("url" in value && "publicId" in value) {
            return validator.isURL(value.url) && !!value.publicId;
          }

          // Check for Referral structure
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
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Blocked"],
      default: "Pending",
      required: [true, "Status is required"],
    },
  },
  {
    timestamps: true, 
  }
);

// Recursive function to validate keys and values \
function validateKeysAndValues(obj: any, path: string[] = []) {
  if (typeof obj !== "object" || obj === null) return;

  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const fullPath = [...path, key].join(".");

      // Skip Mongoose internal keys
      if (key.startsWith("$")) {
        continue; // Ignore keys like "$__" that Mongoose uses internally
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


// Whitelist of fields thats must not be changed
const IMMUTABLE_FIELDS = []; // currently null
// Middleware for security checks
schema.pre("save", async function (next) {
  const doc = this as IUser;

  // Validate keys recursively for NoSQL injection and prototype pollution
  await validateKeysAndValues(doc);

  // Prevent changes to immutable fields
  IMMUTABLE_FIELDS.forEach((field) => {
    if (doc.isModified(field)) {
      next(new ErrorHandle(`Modification of '${field}' is not allowed`,500));
    }
  });

  // Sanitize all string fields
  Object.keys(doc.toObject()).forEach((key) => {
    if (typeof doc[key] === "string") {
      doc[key] = sanitizeHtml(doc[key]); // Sanitize all string fields
    }
  });

  next();
});

export const User = model<IUser>("User", schema);

