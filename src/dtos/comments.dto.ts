import {ObjectId} from "mongodb";


export interface CommentDBType {
    content: string
    commentatorInfo: {
        userId: string
        userLogin: string
    },
    postId: string
}
