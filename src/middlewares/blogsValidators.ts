import {body, param} from "express-validator";
import {ObjectId} from "mongodb";
import {blogsQueryRepository} from "../queryRepositories/blogsQueryRepository";
import {blogCollection} from "../db/mongo-db";


export const nameBlogValidator = body('name')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isLength({min: 1, max: 15}).withMessage('Количество знаков 1-15')

export const descriptionBlogValidator = body('description')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isLength({min: 1, max: 500}).withMessage('Количество знаков: 1-500')

export const websiteUrlValidator = body('websiteUrl')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isURL().withMessage('Введите валидный URL')
    .isLength({min: 1, max: 100}).withMessage('Количество знаков 1-100')

export const idBlogValidator = param('id')
    .custom(async blogId => {
        const blog = await blogCollection.findOne(new ObjectId(blogId))
        if (!blog) {
            throw new Error('Not found')
        } else {
            return !!blog
        }
    }).withMessage('Блог с заданным id не найден!')
