import { Router, Request, Response, NextFunction } from "express";
import upload from "../utils/multerS3.js";
import GalleryRepository from "../dataBase/repository/gallery.js";
import { ErrorHandle } from "../utils/errorHandling.js";
import { IGallery } from "../dataBase/models/gallery.js";
import { GalleryService } from "../service/galleryService.js";
const galleryService: GalleryService = new GalleryService();
const router = Router();

router.get(
  "/gallery/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id: string = req.params.id;
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
    } catch (error) {
      next(new ErrorHandle("Error fetching gallery.", 500));
    }
  }
);

router.post(
  "/addGallery",
  upload.array("files"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let data: IGallery = req.body;
      if (!data.title) {
        return next(new ErrorHandle("Title is required.", 400));
      }
      let files: Express.Multer.File[] | any = req.files;
      if (data.gallery && !files) {
        return next(
          new ErrorHandle("Please provide images to add in fallery.", 400)
        );
      }
      if ((data.event || data.news) && !data.description) {
        return next(new ErrorHandle("Please provide description.", 400));
      }
      if (files) {
        files.map((file: Express.Multer.File) => {
          data.document.push({ file: file.path, fileName: file.originalname });
        });
      }

      const result = await GalleryRepository.addGallery(data, next);
      if (result) {
        return res.status(201).json({
          success: true,
          message: "Gallery added successfully.",
          data: result,
        });
      }
    } catch (error) {
      next(new ErrorHandle("Error adding gallery.", 500));
    }
  }
);

router.delete(
  "/deleteGallery",
  async (
    req: Request<{}, {}, { ids: string[] }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { ids } = req.body;
      const result = await galleryService.deleteGallery(ids, next);
      res.status(200).json(result);
    } catch (error) {
      next(new ErrorHandle("Error deleting gallery.", 500));
    }
  }
);

router.put(
  "/updateGallery/:id",
  upload.array("files"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data: IGallery = req.body;
      const result = await GalleryRepository.updateGallery(id, data, next);
      res.status(200).json({
        success: true,
        message: "Gallery updated successfully.",
        data: result,
      });
    } catch (error) {
      next(new ErrorHandle("Error updating gallery.", 500));
    }
  }
);

router.get(
  "/allGallery",
  async (
    req: Request<{}, {}, {}, { page: number;skip:number, date: Date,query:"galley"| "event" | "news" }>,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { page,skip, date ,query} = req.query;
      const results = await galleryService.getAllGallery(page,skip,query, date, next);
      if (results) {
        res.status(200).json({
          success: true,
          message: "Gallery updated successfully.",
          data: results,
        });
      }
    } catch (error) {
      console.log(error);
      return next(new ErrorHandle("failed to get the gallery", 500));
    }
  }
);
export default router;
