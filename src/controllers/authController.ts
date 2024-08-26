import {NextFunction, Request, Response} from 'express';
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
import {usersQueryRepository} from "../queryRepositories/usersQueryRepository";


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
        return next(e)
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
    try {
        let token = req.headers.authorization as string
        if (!token) {
            return next(ApiError.UnauthorizedError())
        }
        let tokenSplit = token.split(' ')[1]
        if (tokenSplit === null || !token) {
            return next(ApiError.AnyUnauthorizedError('no token'))
        }
        let verifyToken: any = tokenService.validateRefreshToken(tokenSplit)
        if (!verifyToken) {
            return next(ApiError.AnyUnauthorizedError(`${token} - token`))
        }
        const user = await usersQueryRepository.userOutput(verifyToken?._id)
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
        return next(e)
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
        return next(e)
    }
}

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = Object.values(req.cookies)[0]
        const newTokenData = await tokenService.refreshToken(token)
        const {tokens, userId} = newTokenData
        await tokenService.addTokenToDb(userId, tokens.refreshToken)
        res.cookie('refreshToken', tokens.refreshToken, {httpOnly: true, secure: true})
        res.status(200).json({accessToken: tokens.refreshToken})
    } catch (e) {
        return next(e)
    }
}

export const removeRefreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const token = req.headers.cookie?.split('=')[1] as string
        // const token = Object.values(req.cookies)[0]
        const token = req.cookies.refreshToken as string
        const tokenVerified = tokenService.validateRefreshToken(token)
        if (!tokenVerified) {
            return next(ApiError.UnauthorizedError())
        }
        const tokenFromDb = await tokenCollection.findOne({refreshToken: token as string})
        if (!tokenFromDb || tokenFromDb.blackList) {
            return next(ApiError.UnauthorizedError())
        }
        await tokenService.updateTokenInDb(tokenFromDb.refreshToken)
        res.clearCookie('refreshToken')
        res.status(204).send('Logout')
    } catch (e) {
        return next(e)
    }

}

