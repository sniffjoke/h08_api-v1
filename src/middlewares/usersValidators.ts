import {body} from "express-validator";


export const loginUserValidator = body('login')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isLength({min: 3, max: 10}).withMessage('Количество знаков 3-10')

export const emailUserValidator = body('email')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isEmail().withMessage('Введите валидный емайл')

export const passwordUserValidator = body('password')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isLength({min: 6, max: 20}).withMessage('Количество знаков: 6-20')

// export const idBlogValidator = param('id')
//     .custom(async blogId => {
//         const blog = await blogsRepository.findBlogById(new ObjectId(blogId))
//         if (!blog) {
//             throw new Error('Not found')
//         } else {
//             return !!blog
//         }
//     }).withMessage('Блог с заданным id не найден!')
