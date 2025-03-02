import { NextFunction } from "express";
import { ErrorHandle } from "../utils/errorHandling.js";
import { IGallery } from "../dataBase/models/gallery.js";
import { GalleryRepository } from "../dataBase/repository/gallery.js";
const galleryRepository = new GalleryRepository()
export class GalleryService {
  async addGallery(data: IGallery, next: NextFunction) {
    try {
      if (!data) {
        return next(new ErrorHandle("Please provide gallery data.", 400));
      }
      return await galleryRepository.addGallery(data, next);
    } catch (error) {
      return next(new ErrorHandle("Service error in adding gallery.", 500));
    }
  }

  async deleteGallery(ids: string[], next: NextFunction) {
    try {
      if (!ids || ids.length === 0) {
        return next(new ErrorHandle("Please provide gallery IDs to delete.", 400));
      }
      return await galleryRepository.deleteGallery(ids, next);
    } catch (error) {
      return next(new ErrorHandle("Service error in deleting gallery.", 500));
    }
  }

  async updateGallery(id: string, data: IGallery, next: NextFunction) {
    try {
      if (!id || !data) {
        return next(new ErrorHandle("Please provide gallery ID and data.", 400));
      }
      return await galleryRepository.updateGallery(id, data, next);
    } catch (error) {
      return next(new ErrorHandle("Service error in updating gallery.", 500));
    }
  }

  async getGallery(id: string, next: NextFunction) {
    try {
      if (!id) {
        return next(new ErrorHandle("Please provide a gallery ID.", 400));
      }
      return await galleryRepository.getGallery(id, next);
    } catch (error) {
      return next(new ErrorHandle("Service error in fetching gallery.", 500));
    }
  }

  async getAllGallery(page?:number,skip?:number,query?:string,date?:Date,next?: NextFunction) {
    try {
      return await galleryRepository.getAllGallery(page,skip,query,date,next);
    } catch (error) {
      return next(new ErrorHandle("Service error in fetching galleries.", 500));
    }
  }

  async addAllGallery(data: IGallery[], next: NextFunction) {
    try {
      if (!data || data.length === 0) {
        return next(new ErrorHandle("Please provide gallery data.", 400));
      }
      return await galleryRepository.addAllGallery(data, next);
    } catch (error) {
      return next(new ErrorHandle("Service error in adding multiple galleries.", 500));
    }
  }
}
