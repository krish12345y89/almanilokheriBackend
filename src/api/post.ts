import { Request, Response, NextFunction, Router } from "express";
import { upload } from "../utils/multerS3.js";
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
  await auth.isAuthorised(),
  upload.array("files"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      let id = (req as any).user;
      console.log(id);
      let data: any = {};
      const { title, description } = req.body;
      if (!title || !description) {
        return next(
          new ErrorHandle("please provide both title and description", 401)
        );
      }
      if (!(req as any).user) {
        return next(new ErrorHandle("please login first", 401));
      }
      data.user = id;
      const files: Express.MulterS3.File[] | any = req.files;
      let documents: { file: string; fileName: string; publicId: string }[] =
        [];
      if (files) {
        files.forEach((file: Express.MulterS3.File) => {
          documents.push({
            file: file.location,
            fileName: file.originalname,
            publicId: uuid(),
          });
        });
        data.documents = documents;
      }
      console.log(documents);
      data.title = title;
      description ? (data.description = description) : null;
      console.log(data);
      const result = await postService.createPost(data, next);
      if (result) {
        res.status(201).json({
          success: true,
          result,
          message: "post created successfully",
        });
      }
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("failed to create users post", 500));
    }
  }
);
app.get("/getPost:/id", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new ErrorHandle("please provide id to get post", 400));
    }
    const result = await postService.getPost(id,next);
    if(!result){
      return next(new ErrorHandle("post not found",400))
    }
    res.json({success:true,
      message:"post fetch successfully",
      result
    })
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
          result,
        });
      }
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("failed to create users post", 500));
    }
  }
);
app.put(
  "/updatePost/:id",
  upload.array("files"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { title, description, removedImages } = req.body;
      console.log({ title, description, removedImages })
      const files: Express.MulterS3.File[] | any = req.files;
      if (!title && !description && !removedImages) {
        return next(
          new ErrorHandle(
            "Please provide atleast a single field to update",
            400
          )
        );
      }
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
      if (updatedPost) {
        res.status(200).json({ success: true, post: updatedPost });
      }
    } catch (error) {
      console.error("Update Post Error:", error);
      return next(new ErrorHandle("Failed to update post", 500));
    }
  }
);
app.delete(
  "/deletePost/:id",
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      if (!id) {
        return next(new ErrorHandle("please provide post id to delete", 400));
      }
      const result = await postService.deletePost(id, next);
      if (result) {
        res.status(200).json({
          message: result,
          success: true,
        });
      }
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("failed to create users post", 500));
    }
  }
);
export default app;
