import {Schema, Document, model} from "mongoose";
import {Post} from "../types/posts.interface";


const postSchema: Schema = new Schema({
        title: {
            type: String,
            required: true,
        },
        shortDescription: {
            type: String,
            required: true
            // default: ''
        },
        content: {
            type: String,
            required: true,
        },
        blogId: {
            type: Schema.Types.ObjectId,
            required: true,
            // default: '',
            ref: "Blog"
        },
        blogName: {
            type: String,
            required: true
        },
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
    }
)

export const postModel = model<Post & Document>('Post', postSchema);
