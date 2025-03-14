import { NextFunction } from "express";
import { ErrorHandle } from "../utils/errorHandling.js";
import { v4 as uuid } from "uuid";
import { deleteS3Files } from "../utils/multerS3.js";
import { PostRepository } from "../dataBase/repository/post.js";
import { IPost } from "../dataBase/models/post.js";
export class PostService {
  private postRepository: PostRepository;
  constructor() {
    this.postRepository = new PostRepository();
  }
  async updatePostService(
    id: string,
    title: string,
    description: string,
    removedImages: any,
    files: Express.MulterS3.File[] | any,
    next: NextFunction
  ) {
    try {
      const post = await this.postRepository.findPostById(id);
      if (!post) {
        return next(new ErrorHandle("Post not found", 404));
      }

      if (title) post.title = title;
      if (description) post.description = description;

      let imagesToDelete: string[] = [];
      let newImageFiles: any[] = files || [];
      let updatedDocuments = [...post.documents];

      if (removedImages) {
        try {
          const removedImageIndices: number[] = JSON.parse(removedImages);
          removedImageIndices.forEach((index: number) => {
            if (updatedDocuments[index]) {
              imagesToDelete.push(updatedDocuments[index].file);
              updatedDocuments[index] = null;
            }
          });
        } catch (error) {
          return next(new ErrorHandle("Invalid removedImages format", 400));
        }
      }
      let newImageIndex = 0;
      for (let i = 0; i < updatedDocuments.length; i++) {
        if (updatedDocuments[i] === null && newImageFiles[newImageIndex]) {
          updatedDocuments[i] = {
            file: newImageFiles[newImageIndex].location,
            fileName: newImageFiles[newImageIndex].originalname,
            publicId: uuid(),
          };
          newImageIndex++;
        }
      }

      while (newImageIndex < newImageFiles.length) {
        updatedDocuments.push({
          file: newImageFiles[newImageIndex].location,
          fileName: newImageFiles[newImageIndex].originalname,
          publicId: uuid(),
        });
        newImageIndex++;
      }

      updatedDocuments = updatedDocuments.filter((img) => img !== null);

      if (imagesToDelete.length > 0) {
        await deleteS3Files(imagesToDelete, next);
      }

      return await this.postRepository.updatePost(next, id, {
        title: post.title,
        description: post.description,
        documents: updatedDocuments,
      });
    } catch (error) {}
  }
  async getAllPost(next: NextFunction) {
    try {
      const result = await this.postRepository.getAllPost(next);
      if (result) {
        return result;
      }
    } catch (error) {}
  }
  async getPost(id: string, next: NextFunction) {
    try {
      const result = await this.postRepository.findPostById(id);
      if (result) {
        return result;
      }
    } catch (error) {}
  }
  async createPost(data: IPost, next: NextFunction) {
    try {
      if (!data) {
        return next(new ErrorHandle("plese provide data to update", 400));
      }
      const result = await this.postRepository.createPost(data, next);
      if (result) {
        return result;
      }
    } catch (error) {}
  }
  async deletePost(id: string, next: NextFunction) {
    try {
      if (!id) {
        return next(new ErrorHandle("please provide id to delete post", 400));
      }
      const post = await this.postRepository.findPostById(id);
      if (!post) {
        return next(new ErrorHandle("post not found", 400));
      }
      if (post.documents) {
        await deleteS3Files(
          post.documents.map(({ file }) => file),
          next
        );
      }
      const result = await this.postRepository.deletePost(id, next);

      return result;
    } catch (error) {}
  }
}
