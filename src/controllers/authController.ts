import {NextFunction, Request, Response} from 'express';
import {usersQueryRepository} from "../queryRepositories/usersQueryRepository";
import {tokenService} from "../services/token.service";
import {userService} from "../services/user.service";
import * as bcrypt from 'bcrypt';
import {EmailConfirmationModel, usersRepository} from "../repositories/usersRepository";
import {v4 as uuid} from 'uuid'
import MailService from "../services/mail.service";
import {add} from 'date-fns'
import {authService} from "../services/auth.service";
import {tokenCollection} from "../db/mongo-db";
import {WithId} from "mongodb";
import {RTokenDB} from "../types/tokens.interface";
import {ApiError} from "../exceptions/api.error";


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
            ).toString()
        }

        await usersRepository.createUser({email, password: hashPassword, login}, emailConfirmation)
        const mailService = new MailService()
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/auth/registration-confirmation/?code=${activationLink}`)
        res.status(204).send('Письмо с активацией отправлено')
    } catch (e) {
        next(e)
    }
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {loginOrEmail, password} = req.body;
        const user = await authService.validateUser(loginOrEmail)
        await authService.isPasswordCorrect(password, user.password)
        const token = tokenService.createTokens(user._id.toString())
        const {accessToken, refreshToken} = token
        await tokenCollection.insertOne({
            userId: user._id.toString(),
            refreshToken,
            blackList: false
        } as WithId<RTokenDB>)
        res.cookie('refreshToken', refreshToken.split(';')[0], {httpOnly: true, secure: true})
        res.status(200).json({accessToken})
    } catch
        (e) {
        return next(e)
    }
}

export const getMeController = async (req: Request, res: Response, next: NextFunction) => {
    // try {
    //     // const token = req.headers.cookie?.split('=')[1] as string
    //     const token = req.headers.authorization as string
    //     if (!token) {
    //         next(ApiError.AnyUnauthorizedError(req.headers))
    //     }
    //     const decodedToken: any = jwt.decode(token.split(' ')[1])
    //     console.log(decodedToken)
    //     const userCorresponds = await authService.checkUserExistsForToken(decodedToken?._id)
    //     const user = await usersQueryRepository.userOutput(userCorresponds._id.toString())
    //     res.status(200).json({
    //         userId: user.id,
    //         email: user.email,
    //         login: user.login,
    //     })
    // } catch (e) {
    //     next(e)
    // }
    try {
        const token = req.headers.authorization as string
        if (!token) {
            return next(ApiError.UnauthorizedError())
        }
        const tokenSplit = token.split(' ')[1]
        if (tokenSplit === null || !token) {
            return next(ApiError.AnyUnauthorizedError('no token split'))
        }
        let verifyToken: any = tokenService.validateAccessToken(tokenSplit)
        if (!verifyToken) {
            return next(ApiError.AnyUnauthorizedError('no verify token provided'))
        }
        const user = await usersQueryRepository.userOutput(verifyToken?.id.toString())
        if (!user) {
            return next(ApiError.AnyUnauthorizedError('no user'))
        }
        res.status(200).json({
            userId: user.id,
            email: user.email,
            login: user.login,
        })
    } catch (e) {
        return next(e)
    }
}

export const activateEmailUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const confirmationCode: string = req.body.code
        await authService.isActivateEmailByCode(confirmationCode)
        await authService.toActivate(confirmationCode)
        res.status(204).send('Email подтвержден')
    } catch (e) {
        next(e)
    }
}

export const resendEmailController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {email} = req.body
        await authService.validateUserByEmail(email)
        await authService.isActivateEmailByStatus(email)
        const activationLink = uuid()
        const emailConfirmation: EmailConfirmationModel = {
            isConfirmed: false,
            confirmationCode: activationLink,
            expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 30,
                }
            ).toString()
        }
        const mailService = new MailService()
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/auth/registration-confirmation/?code=${activationLink}`)
        await authService.userUpdateWithEmailConfirmation(email, emailConfirmation)
        res.status(204).send('Ссылка повторна отправлена')
    } catch (e) {
        next(e)
    }
}

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = Object.values(req.cookies)[0]
        const newTokenData = await tokenService.refreshToken(token)
        const {tokens, userId} = newTokenData
        await tokenCollection.insertOne({
            userId,
            refreshToken: tokens.refreshToken,
            blackList: false
        } as WithId<RTokenDB>)
        res.cookie('refreshToken', tokens.refreshToken, {httpOnly: true, secure: true})
        res.status(200).json({accessToken: tokens.refreshToken})
    } catch (e) {
        next(e)
    }
}

export const removeRefreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const token = req.headers.cookie?.split('=')[1] as string
        // const token = Object.values(req.cookies)[0]
        const token = req.cookies.refreshToken as string
        const tokenVerified = tokenService.validateRefreshToken(token)
        if (!tokenVerified) {
            next(ApiError.AnyUnauthorizedError(token))
        }
        const tokenFromDb = await tokenCollection.findOne({refreshToken: token as string})
        if (!tokenFromDb || tokenFromDb.blackList) {
            next(ApiError.UnauthorizedError())
        } else {
            await tokenCollection.updateOne({refreshToken: tokenFromDb?.refreshToken}, {$set: {blackList: true}})
            res.clearCookie('refreshToken')
            res.status(204).send('Logout')
        }
    } catch (e) {
        next(e)
    }

}

