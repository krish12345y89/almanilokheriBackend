import { Request, Response, NextFunction, Router } from "express";
import upload from "../utils/multerS3.js";
import { v4 as uuid } from "uuid";
import { IPost } from "../dataBase/models/post.js";
import { ErrorHandle } from "../utils/errorHandling.js";
import { PostService } from "../service/post.js";
import { UserAuth } from "../utils/userAuth.js";
const app = Router();
const postService: PostService = new PostService();
const auth: UserAuth = new UserAuth();
app.post(
  "/createPost",
  auth.isAuthorised,
  upload.array("files"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let data: IPost;
      const { title, description } = req.body;
      if (!(req as any).user) {
        return next(new ErrorHandle("please login first", 401));
      }
      const files: Express.MulterS3.File[] | any = req.files;
      let documents: { file: string; fileName: string; publicId: string }[];
      if (files) {
        files.forEach((file: Express.MulterS3.File) => {
          documents.push({
            file: file.location,
            fileName: file.originalname,
            publicId: uuid(),
          });
        });
        data.documents = documents;
        (data.title = title),
          description ? (data.description = description) : null;
      }
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("failed to create users post", 500));
    }
  }
);
app.get("/getPost", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.query;
    if (!id) {
      return next(new ErrorHandle("please provide id to get post", 400));
    }
  } catch (error) {
    console.error(error);
    return next(new ErrorHandle("failed to get users post", 500));
  }
});

app.get(
  "/getAllPost",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await postService.getAllPost(next);
      if (result) {
        res.json({
          success: true,
          message: "all posts",
        });
      }
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("failed to create users post", 500));
    }
  }
);
app.put(
  "/updatePost",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { title, description, removedImages } = req.body;
      const files: Express.MulterS3.File[] | any = req.files;

      if (!id) {
        return next(new ErrorHandle("Post ID is required", 400));
      }

      const updatedPost = await postService.updatePostService(
        id,
        title,
        description,
        removedImages,
        files,
        next
      );
      return res.status(200).json({ success: true, post: updatedPost });
    } catch (error) {
      console.error("Update Post Error:", error);
      return next(new ErrorHandle("Failed to update post", 500));
    }
  }
);
app.get(
  "/deletePost/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        return next(new ErrorHandle("please provide post id to delete", 400));
      }
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("failed to create users post", 500));
    }
  }
);
export default app;
