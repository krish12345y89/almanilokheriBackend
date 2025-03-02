import { body, validationResult, query, } from "express-validator";
import { User } from "../dataBase/models/user.js";
// Helper function to validate file extensions
const validateFileExtension = (file, allowedExtensions) => {
    if (!file) {
        throw new Error("File is required");
    }
    const fileExtension = file.originalname.split(".").pop()?.toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        throw new Error(`File must be one of the following types: ${allowedExtensions.join(", ")}`);
    }
};
// Check for duplicate field in the database
const checkDuplicate = (field) => {
    return async (value) => {
        const existingUser = await User.findOne({ [field]: value });
        console.log(field, value);
        if (existingUser) {
            console.log(field, value);
            throw new Error(`${field} "${value}" is already in use.`);
        }
        return true;
    };
};
export const userSignUpValidation = [
    body("uuid")
        .notEmpty()
        .withMessage("UUID is required")
        .isUUID()
        .withMessage("Invalid UUID format")
        .custom(checkDuplicate("uuid")),
    body("name")
        .notEmpty()
        .withMessage("Name is required")
        .isString()
        .withMessage("Name must be a string")
        .isLength({ min: 3, max: 20 })
        .withMessage("Name must be between 3 and 20 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Name must contain only alphabets and spaces")
        .trim()
        .escape(),
    body("state")
        .notEmpty()
        .withMessage("State is required")
        .isString()
        .withMessage("State must be a string")
        .isLength({ min: 3, max: 20 })
        .withMessage("State must be between 3 and 20 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("State must contain only alphabets and spaces")
        .trim()
        .escape(),
    body("district")
        .notEmpty()
        .withMessage("District is required")
        .isString()
        .withMessage("District must be a string")
        .isLength({ min: 3, max: 20 })
        .withMessage("District must be between 3 and 20 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("District must contain only alphabets and spaces")
        .trim()
        .escape(),
    body("about")
        .notEmpty()
        .withMessage("About is required")
        .isString()
        .withMessage("About must be a string")
        .isLength({ min: 3, max: 200 })
        .withMessage("About must be between 3 and 200 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("About must contain only alphabets and spaces")
        .trim()
        .escape(),
    body("profession")
        .notEmpty()
        .withMessage("Profession is required")
        .isString()
        .withMessage("Profession must be a string")
        .isLength({ min: 3, max: 100 })
        .withMessage("Profession must be between 3 and 100 characters")
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Profession must contain only alphabets and spaces")
        .trim()
        .escape(),
    body("avatar").custom((_, { req }) => {
        const avatar = req.files?.["avatar"]?.[0]; // Check for avatar file
        if (!avatar) {
            throw new Error("Avatar file is required");
        }
        const allowedExtensions = ["png", "jpeg", "jpg"];
        validateFileExtension(avatar, allowedExtensions); // Validate file extension
        return true;
    }),
    body("proof").custom((_, { req }) => {
        const proof = req.files?.["proof"]?.[0];
        if (proof) {
            const allowedExtensions = ["png", "jpeg", "jpg", "pdf"];
            validateFileExtension(proof, allowedExtensions);
        }
        return true;
    }),
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email format")
        .custom(checkDuplicate("email"))
        .normalizeEmail(),
    body("phoneNumber")
        .notEmpty()
        .withMessage("Phone number is required")
        .isMobilePhone("en-IN")
        .withMessage("Invalid phone number format")
        .isLength({ min: 10, max: 15 })
        .withMessage("Phone number must be between 10 and 15 characters")
        .custom(checkDuplicate("phoneNumber")),
    body("rollNo")
        .notEmpty()
        .withMessage("Roll number is required")
        .isLength({ min: 1, max: 13 })
        .withMessage("Roll number must be between 1 and 13 characters")
        .custom(checkDuplicate("rollNo"))
];
// Middleware to handle validation errors
export const validateErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Validation error occurred",
            errors: errors.array().map(({ msg }) => msg), // Ensure msg is returned here
        });
    }
    next();
};
// Validation rules for searching users
export const validateSearchUser = [
    query("name")
        .optional()
        .isString()
        .trim()
        .escape()
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage("Name must contain only alphabets and spaces"),
    query("email")
        .optional()
        .matches(/^[a-zA-Z0-9]+(?:[._+-][a-zA-Z0-9]+)*@?[a-zA-Z0-9.-]*$/)
        .withMessage("Invalid email format"),
    query("phoneNumber")
        .optional()
        .matches(/^\+?\d{1,15}$/)
        .withMessage("Invalid phone number format"),
    query("rollNo")
        .optional()
        .matches(/^\d{1,13}(\/\d{1,12})?$/)
        .withMessage("Invalid roll number format"),
    query().custom((_, { req }) => {
        const { name, email, phoneNumber, rollNo } = req.query;
        if (!name && !email && !phoneNumber && !rollNo) {
            throw new Error("At least one search parameter must be provided.");
        }
        return true;
    }),
];
