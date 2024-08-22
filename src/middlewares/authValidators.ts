import {body, param} from "express-validator";
import {ObjectId} from "mongodb";
import {userCollection} from "../db/mongo-db";

export const idUserValidator = param('id')
    .custom(async id => {
        const user: any = await userCollection.findOne({_id: new ObjectId(id)})
        if (!user) {
            throw new Error('Not found')
        } else {
            return !!user
        }
    }).withMessage('Пользователь с заданным id не найден!')

export const loginAndEmailAuthLoginValidator = body('loginOrEmail')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isLength({min: 3, max: 10}).withMessage('Количество знаков 3-10')

export const passwordAuthLoginValidator = body('password')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isLength({min: 6, max: 20}).withMessage('Количество знаков: 6-20')

export const loginAuthRegisterValidator = body('login')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isLength({min: 3, max: 10}).withMessage('Количество знаков 3-10')

export const emailAuthRegisterValidator = body('email')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isEmail().withMessage('Введите валидный емайл')

export const passwordAuthRegisterValidator = body('password')
    .isString().withMessage('Должно быть строковым значением')
    .trim()
    .isLength({min: 6, max: 20}).withMessage('Количество знаков: 6-20')
