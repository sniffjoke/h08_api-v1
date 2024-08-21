import {ObjectId, WithId} from "mongodb";
import {commentCollection} from "../db/mongo-db";
import {IComment} from "../types/comments.interface";


export const commentsQueryRepository = {

    async getAllComments() {
        const comments = await commentCollection.find().toArray()
        return comments
    },

    async getAllCommentsByPostId(query: any) {
        const postId = query.postId
        const filter = {
            postId
        }
        const comments = await commentCollection
            .find(filter)
            .sort(query.sortBy, query.sortDirection)
            .limit(query.pageSize)
            .skip((query.page - 1) * query.pageSize)
            .toArray()
        return comments.map(comment => this.commentMapOutput(comment))
    },

    async commentOutput(id: string) {
        const comment = await commentCollection.findOne({_id: new ObjectId(id)})
        return this.commentMapOutput(comment as WithId<IComment>)
    },

    commentMapOutput(comment: WithId<IComment>) {
        const {_id, createdAt, commentatorInfo, content} = comment
        return {
            id: _id.toString(),
            content,
            commentatorInfo,
            createdAt
        }
    },

    async commentsSortWithQuery (query: any) {
        const comments = await commentCollection
            .find()
            .sort(query.sortBy, query.sortDirection)
            .limit(query.pageSize)
            .skip((query.page - 1) * query.pageSize)
            .toArray()
        return comments.map(comment => this.commentMapOutput(comment))
    }

}
