import { Router } from "express";
import { upload } from "../utils/multerS3.js";
import GalleryRepository from "../dataBase/repository/gallery.js";
import { ErrorHandle } from "../utils/errorHandling.js";
import { GalleryService } from "../service/galleryService.js";
const galleryService = new GalleryService();
const router = Router();
router.get("/gallery/:id", async (req, res, next) => {
    try {
        const id = req.params.id;
        if (!id) {
            return next(new ErrorHandle("Please provide a gallery ID.", 400));
        }
        const data = await GalleryRepository.getGallery(id, next);
        if (!data) {
            return new ErrorHandle("failed to get gallery.", 500);
        }
        res.status(200).json({
            success: true,
            message: "Gallery fetched successfully.",
            data,
        });
    }
    catch (error) {
        next(new ErrorHandle("Error fetching gallery.", 500));
    }
});
router.post("/addGallery", upload.array("files"), async (req, res, next) => {
    try {
        let data = req.body;
        if (!data.gallery && !data.event && !data.news) {
            data.gallery = true;
        }
        let documents = [];
        console.log(data.gallery);
        if (!data.title) {
            return next(new ErrorHandle("Title is required.", 400));
        }
        let files = req.files;
        if (data.gallery && (!files || files.length === 0)) {
            console.log("No images provided.");
            return next(new ErrorHandle("Please provide images to add in gallery.", 400));
        }
        if ((data.event || data.news) && !data.description) {
            return next(new ErrorHandle("Please provide description.", 400));
        }
        if (files) {
            files.map((file) => {
                documents.push({ file: file.location, fileName: file.originalname });
            });
            data.document = documents;
        }
        console.log(data);
        const result = await GalleryRepository.addGallery(data, next);
        if (result) {
            return res.status(201).json({
                success: true,
                message: "Gallery added successfully.",
                data: result,
            });
        }
    }
    catch (error) {
        console.error(error);
        next(new ErrorHandle("Error adding gallery.", 500));
    }
});
router.delete("/deleteGallery", async (req, res, next) => {
    try {
        const { ids } = req.body;
        const result = await galleryService.deleteGallery(ids, next);
        res.status(200).json(result);
    }
    catch (error) {
        next(new ErrorHandle("Error deleting gallery.", 500));
    }
});
router.put("/updateGallery/:id", upload.array("files"), async (req, res, next) => {
    try {
        const { id } = req.params;
        let data = {};
        const files = req.files;
        let documents = [];
        const { title, description, imagesToDelete, gallery, event, news } = req.body;
        if (!title &&
            !description &&
            !imagesToDelete &&
            !gallery &&
            !event &&
            !news &&
            !files) {
            return next(new ErrorHandle("please provide any data to update", 400));
        }
        let imagesToDeleteIndex = JSON.parse(imagesToDelete) || [];
        console.log(imagesToDelete, imagesToDeleteIndex);
        if (title) {
            data.title = title;
        }
        if (description) {
            data.description = description;
        }
        if (gallery && !event && !news) {
            data.gallery = true;
            data.event = false;
            data.news = false;
        }
        else if (event && !gallery && !news) {
            data.event = true;
            data.gallery = false;
            data.news = false;
        }
        else if (news && !event && !gallery) {
            data.news = true;
            data.event = false;
            data.gallery = false;
        }
        if (files) {
            files.forEach((file) => {
                documents.push({
                    file: file.location,
                    fileName: file.originalname,
                });
            });
            data.document = documents;
        }
        console.log("Updating gallery with data:", data);
        const result = await galleryService.updateGallery(id, imagesToDeleteIndex, data, next);
        res.status(200).json({
            success: true,
            message: "Gallery updated successfully.",
            data: result,
        });
    }
    catch (error) {
        next(new ErrorHandle("Error updating gallery.", 500));
    }
});
router.get("/allGallery", async (req, res, next) => {
    try {
        let { page, skip, date, query } = req.query;
        if (!query) {
            query = "gallery";
        }
        const results = await galleryService.getAllGallery(page, skip, query, date, next);
        if (results) {
            res.status(200).json({
                success: true,
                message: "Gallery updated successfully.",
                data: results,
            });
        }
    }
    catch (error) {
        console.log(error);
        return next(new ErrorHandle("failed to get the gallery", 500));
    }
});
export default router;
