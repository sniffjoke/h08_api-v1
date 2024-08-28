import {Schema, Document, model} from "mongoose";
import {IComment} from "../types/comments.interface";

const commentatorInfoSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    userLogin: {
        type: String,
        required: true,
    }
})

const commentSchema: Schema = new Schema({
        content: {
            type: String,
            required: true,
        },
        commentatorInfo: {
            type: commentatorInfoSchema,
        },
        postId: {
            type: Schema.Types.ObjectId,
            ref: "Post"
        }

    },
    {
        versionKey: false,
        timestamps: {updatedAt: false},
        toJSON: {
            transform(doc, ret, options) {
                ret.id = ret._id;
                delete ret._id;
            }
        }
    },
)

export const commentModel = model<IComment & Document>('Comment', commentSchema);


