import {commentCollection} from "../db/mongo-db";
import {ObjectId, UpdateResult} from "mongodb";
import {CommentDBType} from "../dtos/comments.dto";
import {IComment} from "../types/comments.interface";
import {postsRepository} from "./postsRepository";
import {tokenService} from "../services/token.service";
import {usersRepository} from "./usersRepository";


export const commentsRepository = {

    async createComment(commentData: CommentDBType): Promise<ObjectId> {
        const comment: IComment = {
            content: commentData.content,
            commentatorInfo: commentData.commentatorInfo,
            postId: commentData.postId,
            createdAt: new Date(Date.now()).toISOString()
        }
        const newComment = await commentCollection.insertOne(comment)
        return newComment.insertedId
    },

    async updateCommentById(id: string, comment: CommentDBType): Promise<UpdateResult> {
        const findedComment = await commentCollection.findOne({_id: new ObjectId(id)})
        const updates = {
            $set: {
                content: comment.content,
            }
        }
        const updatedComment = await commentCollection.updateOne({_id: findedComment?._id}, updates)
        return updatedComment
    },

    async deleteComment(id: ObjectId) {
        return await commentCollection.deleteOne({_id: id})
    },

    async createCommentByPostIdWithParamsController(newContent: string, postId: string, token: string) {
        const post = await postsRepository.findPostById(new ObjectId(postId))
        const decodedToken: any = tokenService.decodeToken(token)
        const user = await usersRepository.findUserById(decodedToken._id)
        const newCommentId = await commentsRepository.createComment({
            content: newContent,
            postId: post!._id.toString(),
            commentatorInfo: {
                userId: user!._id.toString(),
                userLogin: user!.login
            }
        })
        return newCommentId
    }

}
