import { Post } from "../models/post.js";
import { ErrorHandle } from "../../utils/errorHandling.js";
export class PostRepository {
    constructor() { }
    async findPostById(id) {
        try {
            const result = await Post.findById(id);
            if (result) {
                return result;
            }
        }
        catch (error) {
        }
    }
    async createPost(data, next) {
        try {
            if (!data) {
                return next(new ErrorHandle("please provide data to create post", 400));
            }
            const result = await Post.create(data);
            if (result) {
                return result;
            }
        }
        catch (error) {
            console.error(error);
            return next(new ErrorHandle("failed to create users post", 500));
        }
    }
    async updatePost(next, id, updateData) {
        try {
            return await Post.findByIdAndUpdate(id, updateData, { new: true });
        }
        catch (error) {
            console.error("Update Post Error:", error);
            return next(new ErrorHandle("Failed to update post", 500));
        }
    }
    async getAllPost(next) {
        try {
            const result = await Post.find({});
            if (result) {
                return result;
            }
        }
        catch (error) {
        }
    }
    async deletePost(id, next) {
        try {
            const result = await Post.findById(id);
            if (result) {
                await result.deleteOne();
            }
        }
        catch (error) {
        }
    }
}
