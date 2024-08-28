import {Schema, Document, model} from "mongoose";
import {Token} from "nodemailer/lib/xoauth2";


const tokenSchema: Schema = new Schema({
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        refreshToken: {
            type: String,
            required: true
        },
        blackList: {
            type: Boolean,
            required: true,
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
    },
)

export const tokenModel = model<Token & Document>('Token', tokenSchema);


