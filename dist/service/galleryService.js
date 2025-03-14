import { ErrorHandle } from "../utils/errorHandling.js";
import { GalleryRepository } from "../dataBase/repository/gallery.js";
import { deleteS3Files } from "../utils/multerS3.js";
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
    async updateGallery(id, imagesToDeleteIndex, data, next) {
        try {
            if (!id || !data) {
                return next(new ErrorHandle("Please provide gallery ID and data.", 400));
            }
            console.log(typeof (imagesToDeleteIndex));
            const gallery = await galleryRepository.getGallery(id, next);
            if (!gallery) {
                return next(new ErrorHandle("Gallery not found", 404));
            }
            let imagesToDelete = [];
            let existingImages = [...(gallery.document || [])];
            let newImages = data.document ? data.document : [];
            let validIndices = imagesToDeleteIndex || [];
            validIndices.forEach((index) => {
                if (existingImages[index]) {
                    imagesToDelete.push(existingImages[index].file);
                    existingImages[index] = null;
                }
            });
            if (imagesToDelete.length > 0) {
                await deleteS3Files(imagesToDelete, next);
            }
            let newImageIndex = 0;
            for (let i = 0; i < existingImages.length; i++) {
                if (existingImages[i] === null && newImages[newImageIndex]) {
                    existingImages[i] = newImages[newImageIndex];
                    newImageIndex++;
                }
            }
            while (newImageIndex < newImages.length) {
                existingImages.push(newImages[newImageIndex]);
                newImageIndex++;
            }
            existingImages = existingImages.filter((img) => img !== null);
            data.document = existingImages;
            return await galleryRepository.updateGallery(id, data, next);
        }
        catch (error) {
            console.error(error);
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
