import { ErrorHandle } from "../utils/errorHandling.js";
import { GalleryRepository } from "../dataBase/repository/gallery.js";
const galleryRepository = new GalleryRepository();
export class GalleryService {
    async addGallery(data, next) {
        try {
            if (!data) {
                return next(new ErrorHandle("Please provide gallery data.", 400));
            }
            return await galleryRepository.addGallery(data, next);
        }
        catch (error) {
            return next(new ErrorHandle("Service error in adding gallery.", 500));
        }
    }
    async deleteGallery(ids, next) {
        try {
            if (!ids || ids.length === 0) {
                return next(new ErrorHandle("Please provide gallery IDs to delete.", 400));
            }
            return await galleryRepository.deleteGallery(ids, next);
        }
        catch (error) {
            return next(new ErrorHandle("Service error in deleting gallery.", 500));
        }
    }
    async updateGallery(id, data, next) {
        try {
            if (!id || !data) {
                return next(new ErrorHandle("Please provide gallery ID and data.", 400));
            }
            return await galleryRepository.updateGallery(id, data, next);
        }
        catch (error) {
            return next(new ErrorHandle("Service error in updating gallery.", 500));
        }
    }
    async getGallery(id, next) {
        try {
            if (!id) {
                return next(new ErrorHandle("Please provide a gallery ID.", 400));
            }
            return await galleryRepository.getGallery(id, next);
        }
        catch (error) {
            return next(new ErrorHandle("Service error in fetching gallery.", 500));
        }
    }
    async getAllGallery(page, skip, query, date, next) {
        try {
            return await galleryRepository.getAllGallery(page, skip, query, date, next);
        }
        catch (error) {
            return next(new ErrorHandle("Service error in fetching galleries.", 500));
        }
    }
    async addAllGallery(data, next) {
        try {
            if (!data || data.length === 0) {
                return next(new ErrorHandle("Please provide gallery data.", 400));
            }
            return await galleryRepository.addAllGallery(data, next);
        }
        catch (error) {
            return next(new ErrorHandle("Service error in adding multiple galleries.", 500));
        }
    }
}
