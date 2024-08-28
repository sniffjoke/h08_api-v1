import {Schema, Document, model} from "mongoose";
import {User} from "../types/users.interface";

const emailConfirmationSchema: Schema = new Schema({
    isConfirmed: {
        type: Boolean,
        required: true,
    },
    confirmationCode: {
        type: String,
    },
    expirationDate: {
        type: String,
    }

})


const userSchema: Schema = new Schema({
        login: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
        },
        emailConfirmation: {
            type: emailConfirmationSchema,
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
    }
)

export const postModel = model<User & Document>('User', userSchema);
