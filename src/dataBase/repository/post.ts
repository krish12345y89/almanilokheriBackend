import { NextFunction } from "express";
import { IPost, Post } from "../models/post.js";
import { ErrorHandle } from "../../utils/errorHandling.js";
import { deleteS3Files } from "../../utils/multerS3.js";

export class PostRepository {
  constructor() {}

  async findPostById(id: string) {
    try {
        const result = await Post.findById(id);
        if(result){
            return result
        }
    } catch (error) {
        
    }

  }
  async createPost(data: IPost, next: NextFunction) {
    try {
      if (!data) {
        return next(new ErrorHandle("please provide data to create post", 400));
      }
      const result = await Post.create(data);
      if (result) {
        return result;
      }
    } catch (error) {
      console.error(error);
      return next(new ErrorHandle("failed to create users post", 500));
    }
  }

  async updatePost(next: NextFunction, id: string, updateData: any) {
    try {
      return await Post.findByIdAndUpdate(id, updateData, { new: true });
    } catch (error) {
      console.error("Update Post Error:", error);
      return next(new ErrorHandle("Failed to update post", 500));
    }
  }

  async getAllPost(next:NextFunction){
    try {
        const result = await Post.find({});
        if(result){
            return result
        }
    } catch (error) {
        
    }
  }

  async deletePost(id:string,next:NextFunction){
    try {
        const result = await Post.findById(id);
        if(result){
            await result.deleteOne()
        }
    } catch (error) {
        
    }
  }
}
