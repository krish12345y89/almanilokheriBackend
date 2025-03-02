import { NextFunction } from "express";
import { Schema, model, Document } from "mongoose";
import { ErrorHandle } from "../../utils/errorHandling.js";

export type gallery = { file: string; fileName: string }[];

export interface IGallery extends Document {
  document?: gallery;
  title: string;
  news?: boolean;
  event?: boolean;
  gallery?: boolean;
  description?: string;
}

const schema = new Schema<IGallery>(
  {
    document: [
      {
        file: {
          type: String,
          required: true,
        },
        fileName: {
          type: String,
          required: true,
        },
      },
    ],
    title: {
      type: String,
      required: true,
    },
    news: {
      type: Boolean,
      default: false,
    },
    event: {
      type: Boolean,
      default: false,
    },
    gallery: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

schema.pre<IGallery>("save", function (next: NextFunction) {
  if (this.gallery && (!this.document || this.document.length === 0)) {
    return next(
      new ErrorHandle(
        "Gallery must contain at least one document if gallery is true",
        400
      )
    );
  }
  if ((this.event || this.news) && !this.description) {
    return next(new ErrorHandle("please add description", 400));
  }

  next();
});

export const Gallery = model<IGallery>("Gallery", schema);
