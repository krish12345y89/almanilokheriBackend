import { NextFunction } from "express";
import { Gallery, IGallery } from "../models/gallery.js";
import { ErrorHandle } from "../../utils/errorHandling.js";
import { deleteS3Files } from "../../utils/multerS3.js";

export class GalleryRepository {
  async addGallery(data: IGallery, next: NextFunction) {
    try {
      if (!data) {
        return next(new ErrorHandle("Please provide gallery data.", 400));
      }
      const result = await Gallery.create(data);
      if (!result) {
        return next(new ErrorHandle("failed to create the gallery", 500));
      }
      return result;
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("Failed to create gallery.", 500));
    }
  }

  async deleteGallery(ids: string[], next: NextFunction) {
    try {
      if (!ids || ids.length === 0) {
        return next(new ErrorHandle("Please provide gallery IDs.", 400));
      }
      ids.forEach(async (id) => {
        const gallery = await Gallery.findById(id);
        if (!gallery) {
          return next(new ErrorHandle("The id you provided is invalid", 400));
        }
        deleteS3Files(
          gallery.document.map((doc) => doc.file),
          next
        );
      });
      const result = await Gallery.deleteMany({ _id: { $in: ids } });
      if (result) {
        return { success: true, message: "Gallery deleted successfully." };
      }
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("Failed to delete gallery.", 500));
    }
  }

  async updateGallery(id: string, data: IGallery, next: NextFunction) {
    try {
      if (!id || !data) {
        return next(
          new ErrorHandle("Please provide gallery ID and data.", 400)
        );
      }
      const gallery = await Gallery.findById(id);
      if (!gallery) {
        return next(new ErrorHandle("please provide a valid id.", 404));
      }
      if (data.document) {
        await deleteS3Files(
          data.document.map((doc) => doc.file),
          next
        );
      }
      const result = await Gallery.findByIdAndUpdate(id, data, { new: true });
      if (!result) {
        return next(new ErrorHandle("Gallery not found.", 404));
      }
      return result;
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("Failed to update gallery.", 500));
    }
  }

  async getGallery(id: string, next: NextFunction) {
    try {
      if (!id) {
        return next(new ErrorHandle("Please provide a gallery ID.", 400));
      }
      const result = await Gallery.findById(id);
      if (!result) {
        return next(new ErrorHandle("Gallery not found.", 404));
      }
      return result;
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("Failed to fetch gallery.", 500));
    }
  }

  async getAllGallery(
    page?: number,
    skip?: number,
    query?: string,
    date?: Date,
    next?: NextFunction
  ) {
    try {
      let pages = page | 1;
      let skips = skip ? skip : query == "event" || "news" ? 5 : 10;
      const result = await Gallery.find({
        ...(date && { createdAt: { $lte: date } }),
      }).skip((pages - 1) * skips);
      if (!result) {
        return next(new ErrorHandle("Gallery not found.", 404));
      }
      return result;
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("Failed to fetch gallery.", 500));
    }
  }

  async addAllGallery(data: IGallery[], next: NextFunction) {
    try {
      if (!data || data.length === 0) {
        return next(new ErrorHandle("Please provide gallery data.", 400));
      }
      const result = await Gallery.insertMany(data);
      return result;
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("Failed to create galleries.", 500));
    }
  }
}

export default new GalleryRepository();
