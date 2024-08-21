import {ObjectId} from "mongodb";

export interface IComment {
    content: string;
    commentatorInfo: {
      userId: string,
      userLogin: string
    };
    postId: string;
    createdAt: string;
}
