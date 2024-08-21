import {NextFunction, Request, Response} from 'express';
import {usersQueryRepository} from "../queryRepositories/usersQueryRepository";
import {tokenService} from "../services/token.service";
import {ObjectId} from "mongodb";
import {userService} from "../services/user.service";
import * as bcrypt from 'bcrypt';
import {EmailConfirmationModel, usersRepository} from "../repositories/usersRepository";
import {v4 as uuid} from 'uuid'
import MailService from "../services/mail.service";
import {add} from 'date-fns'
import {userCollection} from "../db/mongo-db";


export const registerController = async (req: Request, res: Response) => {
    try {
        const {login, email, password} = req.body
        const candidateEmail = await usersRepository.getUserByEmail(email)
        if (candidateEmail) {
            res.status(400).json({
                errorsMessages: [
                    {
                        message: "Данный пользователь уже существует",
                        field: "email"
                    }
                ]
            })
            return
        }
        const candidateLogin = await usersRepository.getUserByLogin(login)
        if (candidateLogin) {
            res.status(400).json({
                errorsMessages: [
                    {
                        message: "Данный пользователь уже существует",
                        field: "login"
                    }
                ]
            })
            return
        }
        const hashPassword = await bcrypt.hash(password, 3)
        const activationLink = uuid()
        const emailConfirmation: EmailConfirmationModel = {
            isConfirmed: false,
            confirmationCode: activationLink,
            expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 30,
                }
            )
        }

        const userId = await usersRepository.createUser({email, password: hashPassword, login}, emailConfirmation)
        const mailService = new MailService()
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/auth/registration-confirmation/?code=${activationLink}`)
        const token = tokenService.createToken(userId.toString())
        res.status(204).send({accessToken: token})
    } catch (e) {
        res.status(500).send(e)
    }
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {loginOrEmail, password} = req.body;
        const user = await userService.validateUser(loginOrEmail)
        if (!user) {
            res.status(401).json({
                errorsMessages: [
                    {
                        message: "Данного пользователя не существует",
                        field: "loginOrEmail"
                    }
                ]
            })
            return
        }
        const findedUser = await usersRepository.findUserById(user.id.toString())
        const isPasswordCorrect = await bcrypt.compare(password, findedUser?.password as string)
        // password !== user.password // service
        if (isPasswordCorrect) {
            const token = tokenService.createToken(user.id.toString())
            res.status(200).json({accessToken: token})
            // return
        } else {
            res.status(401).json({
                errorsMessages: [
                    {
                        message: "Неправильный пароль",
                        field: "password"
                    }
                ]
            })
            return
        }
    } catch (e) {
        console.log('catch')
        // res.status(500).send(e)
        return next(e)
    }
}

export const getMeController = async (req: Request, res: Response) => {
    try {
        const token = tokenService.getToken(req.headers.authorization)
        if (token === undefined) {
            res.status(401).send('Нет авторизации')
            return
        }

        const decodedToken: any = tokenService.decodeToken(token)
        const user = await usersQueryRepository.getUserById(new ObjectId(decodedToken._id))
        res.status(200).json({
            id: decodedToken._id,
            email: user?.email,
            login: user?.login,
        })

    } catch (e) {
        res.status(500).send(e)
    }
}

export const activateEmailUserController = async (req: Request, res: Response) => {
    try {
        const confirmationCode: any = req.body.code
        const findedUser = await userCollection.findOne({'emailConfirmation.confirmationCode': confirmationCode})
        if (findedUser?.emailConfirmation?.isConfirmed) {
            res.status(400).json({
                    errorsMessages: [
                        {
                            message: "'Юзер уже активирован'",
                            field: "code"
                        }
                    ]
                }
            )
            return
        }
        const activate = await userService.activate(confirmationCode)
        if (activate) {
            res.status(204).json(activate)
        } else {
            res.status(400).json({
                    errorsMessages: [
                        {
                            message: "'Юзер не найден'",
                            field: "code"
                        }
                    ]
                }
            )
        }
    } catch (e) {
        res.status(500).send(e)
    }
}

export const emailResending = async (req: Request, res: Response) => {
    try {
        const {email} = req.body
        const validateUser = await userCollection.findOne({email})
        if (!validateUser) {
            res.status(400).json({
                    errorsMessages: [
                        {
                            message: "Юзер не найден",
                            field: "email"
                        }
                    ]
                }
            )
            return
            // throw ApiError.BadRequest('Юзер не найден', 'email')
        }
        if (validateUser.emailConfirmation?.isConfirmed) {
            res.status(400).json({
                    errorsMessages: [
                        {
                            message: "Юзер уже активирован",
                            field: "email"
                        }
                    ]
                }
            )
            return
        }
        const activationLink = uuid()
        const emailConfirmation: EmailConfirmationModel = {
            isConfirmed: false,
            confirmationCode: activationLink,
            expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 30,
                }
            )
        }
        const mailService = new MailService()
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/auth/registration-confirmation/?code=${activationLink}`)
        await userCollection.updateOne({email}, {$set: {emailConfirmation}})
        res.status(204).json()
    } catch (e) {
        res.status(500).send(e)
    }
}

