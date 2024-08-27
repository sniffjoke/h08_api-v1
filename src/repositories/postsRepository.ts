import {postCollection} from "../db/mongo-db";
import {DeleteResult, ObjectId, UpdateResult, WithId} from "mongodb";
import {PostDBType} from "../dtos/posts.dto";
import {Post} from "../types/posts.interface";


export const postsRepository = {

    async findPostById(id: ObjectId) {
        return await postCollection.findOne({_id: id})
    },

    async createPost(postData: Post): Promise<ObjectId> {
        const post = {
            title: postData.title,
            shortDescription: postData.shortDescription,
            content: postData.content,
            blogName: postData.blogName,
            blogId: postData.blogId,
            createdAt: new Date(Date.now()).toISOString()
        }
        const newPost = await postCollection.insertOne(post as WithId<Post>)
        return newPost.insertedId
    },

    async updatePostById(id: string, post: PostDBType): Promise<UpdateResult> {
        const findedPost = await postCollection.findOne({_id: new ObjectId(id)})
        const updates = {
            $set: {
                title: post.title,
                shortDescription: post.shortDescription,
                content: post.content,
            }
        }
        const updatedPost = await postCollection.updateOne({_id: findedPost?._id}, updates)
        return updatedPost
    },

    async postDelete(postId: ObjectId): Promise<DeleteResult> {
        return await postCollection.deleteOne({_id: postId})
    }

}
