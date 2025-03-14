import { Request, Response, NextFunction } from "express";
export class ErrorHandle extends Error {
  public statusCode: number;
  public isFunctional: boolean;
  public isMendatory: boolean;

  constructor(
    message: string,
    statusCode: number,
    isFunctional: boolean = false,
    isMendatory: boolean = true
  ) {
    super(message);
    this.message=message;
    this.statusCode = statusCode;
    this.isFunctional = isFunctional;
    this.isMendatory = isMendatory;
  }
}

// Main error handler function
export const errorHandler = async (
  error: ErrorHandle | any | Error,
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Log the error for debugging
  console.error("Error:", error);

  // Handle MongoDB Duplicate Key Error (11000)
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0]; // Get the field causing the duplicate key error
    const value = error.keyValue[field]; // Get the conflicting value
      res.status(400).json({
      success: false,
      message: `Duplicate value detected: The ${field} "${value}" is already in use.`,
      isMendatory: true,
      isFunctional: false,
    });
  }

  // Handle MongoDB Document Validation Error (121)
  if (error.code === 121) {
    res.status(400).json({
      success: false,
      message: `Document validation failed. Please check the document's structure.`,
      isMendatory: true,
      isFunctional: false,
    });
  }

  // Handle Mongoose Validation Error (invalid schema fields)
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors)
      .map((err: any) => `${err.path}: ${err.message}`)
      .join(", ");
     res.status(400).json({
      success: false,
      message: `Validation error: ${errors}`,
      isMendatory: true,
      isFunctional: false,
    });
  }

  // Handle Mongoose CastError (invalid type for field)
  if (error.name === "CastError") {
    res.status(400).json({
      success: false,
      message: `Invalid value for field "${error.path}": ${error.value}`,
      isMendatory: true,
      isFunctional: false,
    });
  }

  // Handle Missing Schema Error
  if (error.name === "MissingSchemaError") {
     res.status(500).json({
      success: false,
      message: `Schema for "${error.name}" is missing. Ensure the model is properly defined.`,
      isMendatory: true,
      isFunctional: false,
    });
  }

  // Handle DocumentNotFoundError (when a document is not found in the database)
  if (error.name === "DocumentNotFoundError") {
    res.status(404).json({
      success: false,
      message: `The requested document was not found.`,
      isMendatory: true,
      isFunctional: false,
    });
  }

  // Generic error handler for all other cases
  if (!res.headersSent) {
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
      isMendatory: error.isMendatory,
      isFunctional: error.isFunctional,
    });
  }
};

// MongoDB/Mongoose error handler function
export const errorHandler2 = async (err: any, next: NextFunction) => {
  try {
    // Mongoose Duplicate Key Error (11000)
    if (err.name === "MongoServerError" || err.name === "MongooseError") {
      if (err.code === 11000 || err.cause?.code===11000) {
        const fields = Object.keys(err.cause.keyPattern || {});
        const keyValues = fields
          .map((field) => `${field}: "${err.cause.keyValue?.[field]}"`)
          .join(", ");
        console.error("MongoDB Error:", err);
        next(
          new ErrorHandle(
            `Duplicate key error: ${keyValues} already exists`,
            400,
            false,
            true
          )
        );
        return;
      }

      // MongoDB Document validation error (121)
      if (err.code === 121 || err.cause?.code===121) {
        console.error("MongoDB Validation Error:", err);
        next(
          new ErrorHandle(`Document validation failed`, 400, false, true)
        );
        return;
      }

      console.error("Database error:", err);
      next(
        new ErrorHandle(
          `Database error: An unknown error occurred`,
          500,
          false,
          true
        )
      );
      return;
    }

    // Handle Mongoose Validation Errors
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors)
        .map((error: any) => `${error.path}: ${error.message}`)
        .join(", ");
      console.error("Validation Error:", err);
      next(
        new ErrorHandle(
          `Validation error: ${errors}`,
          400,
          false,
          true
        )
      );
      return;
    }

    // Handle CastError (invalid type)
    if (err.name === "CastError") {
      console.error("Cast Error:", err);
      next(
        new ErrorHandle(
          `Invalid value for field "${err.path}"`,
          400,
          false,
          true
        )
      );
      return;
    }

    // Handle MissingSchemaError
    if (err.name === "MissingSchemaError") {
      console.error("Schema Error:", err);
      next(
        new ErrorHandle(`Schema for "${err.name}" is missing`, 500, false, true)
      );
      return;
    }

    // Handle DocumentNotFoundError
    if (err.name === "DocumentNotFoundError") {
      console.error("Document Not Found:", err);
      next(
        new ErrorHandle(
          `The requested document was not found.`,
          404,
          false,
          true
        )
      );
      return;
    }
    console.error("Unhandled Error:", err);
    const errorMessage = err.message || `Internal Server Error`;
    next(new ErrorHandle(errorMessage, 500, false, true));
  } catch (error) {
    console.error("Error handling failed:", error);
    next(new ErrorHandle("Error handling failed", 500, false, true));
  }
};
