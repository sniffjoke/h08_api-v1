import {NextFunction, Request, Response} from 'express';
import {usersQueryRepository} from "../queryRepositories/usersQueryRepository";
import {tokenService} from "../services/token.service";
import {userService} from "../services/user.service";
import * as bcrypt from 'bcrypt';
import {EmailConfirmationModel, usersRepository} from "../repositories/usersRepository";
import {v4 as uuid} from 'uuid'
import MailService from "../services/mail.service";
import {add} from 'date-fns'
import {userCollection} from "../db/mongo-db";
import {authService} from "../services/auth.service";


export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {login, email, password} = req.body
        await userService.userExists(login, email)
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
        next(e)
    }
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {loginOrEmail, password} = req.body;
        const user = await authService.validateUser(loginOrEmail)
        await authService.isPasswordCorrect(password, user.password)
        const token = tokenService.createToken(user._id.toString())
        res.status(200).json({accessToken: token})
    } catch
        (e) {
        return next(e)
    }
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = tokenService.getToken(req.headers.authorization)
        const decodedToken: any = tokenService.decodeToken(token)
        const user = await usersQueryRepository.userOutput(decodedToken._id)
        res.status(200).json({
            id: user.id,
            email: user.email,
            login: user.login,
        })

    } catch (e) {
        next(e)
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
        const activate = await authService.activate(confirmationCode)
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

