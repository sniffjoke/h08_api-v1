import {commentCollection} from "../db/mongo-db";
import {ObjectId, UpdateResult, WithId} from "mongodb";
import {commentsQueryRepository} from "../queryRepositories/commentsQueryRepository";
import {CommentDBType} from "../dtos/comments.dto";
import {IComment} from "../types/comments.interface";


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
    }

}
