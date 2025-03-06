import { Router } from "express";
import upload from "../utils/multerS3.js";
import { v4 as uuid } from "uuid";
import { ErrorHandle } from "../utils/errorHandling.js";
import { PostService } from "../service/post.js";
import { UserAuth } from "../utils/userAuth.js";
const app = Router();
const postService = new PostService();
const auth = new UserAuth();
app.post("/createPost", auth.isAuthorised, upload.array("files"), async (req, res, next) => {
    try {
        let data;
        const { title, description } = req.body;
        if (!req.user) {
            return next(new ErrorHandle("please login first", 401));
        }
        const files = req.files;
        let documents;
        if (files) {
            files.forEach((file) => {
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
    }
    catch (error) {
        console.error(error);
        return next(new ErrorHandle("failed to create users post", 500));
    }
});
app.get("/getPost", async (req, res, next) => {
    try {
        const { id } = req.query;
        if (!id) {
            return next(new ErrorHandle("please provide id to get post", 400));
        }
    }
    catch (error) {
        console.error(error);
        return next(new ErrorHandle("failed to get users post", 500));
    }
});
app.get("/getAllPost", async (req, res, next) => {
    try {
        const result = await postService.getAllPost(next);
        if (result) {
            res.json({
                success: true,
                message: "all posts",
            });
        }
    }
    catch (error) {
        console.error(error);
        return next(new ErrorHandle("failed to create users post", 500));
    }
});
app.put("/updatePost", async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, removedImages } = req.body;
        const files = req.files;
        if (!id) {
            return next(new ErrorHandle("Post ID is required", 400));
        }
        const updatedPost = await postService.updatePostService(id, title, description, removedImages, files, next);
        return res.status(200).json({ success: true, post: updatedPost });
    }
    catch (error) {
        console.error("Update Post Error:", error);
        return next(new ErrorHandle("Failed to update post", 500));
    }
});
app.get("/deletePost/:id", async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            return next(new ErrorHandle("please provide post id to delete", 400));
        }
    }
    catch (error) {
        console.error(error);
        return next(new ErrorHandle("failed to create users post", 500));
    }
});
export default app;
