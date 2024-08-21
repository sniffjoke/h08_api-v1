import {body, param} from "express-validator";
import {ObjectId} from "mongodb";
import {commentsQueryRepository} from "../queryRepositories/commentsQueryRepository";
import {commentCollection} from "../db/mongo-db";


export const contentCommentValidator = body('content')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isLength({min: 20, max: 300}).withMessage('Количество знаков 20-300')

export const descriptionBlogValidator = body('description')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isLength({min: 1, max: 500}).withMessage('Количество знаков: 1-500')

export const websiteUrlValidator = body('websiteUrl')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isURL().withMessage('Введите валидный URL')
    .isLength({min: 1, max: 100}).withMessage('Количество знаков 1-100')

export const idCommentValidator = param('id')
    .custom(async commentId => {
        const comment = await commentCollection.findOne({_id: new ObjectId(commentId)})
        if (!comment) {
            throw new Error('Not found')
        } else {
            return !!comment
        }
    }).withMessage('Комментарий с заданным id не найден!')
