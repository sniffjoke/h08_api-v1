import {NextFunction, Request, Response} from 'express';
import {tokenService} from "../services/token.service";
import {userService} from "../services/user.service";
import {EmailConfirmationModel} from "../repositories/usersRepository";
import {v4 as uuid} from 'uuid'
import {add} from 'date-fns'
import {authService} from "../services/auth.service";
import {ApiError} from "../exceptions/api.error";
import {usersQueryRepository} from "../queryRepositories/usersQueryRepository";
import mailService from "../services/mail.service";


export const registerController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {login, email, password} = req.body
        await userService.registerUser({login, email, password})
        res.status(204).send('Письмо с активацией отправлено')
    } catch (e) {
        return next(e)
    }
}

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {loginOrEmail, password} = req.body;
        const {accessToken, refreshToken} = await authService.loginUser({loginOrEmail, password})
        res.cookie('refreshToken', refreshToken.split(';')[0], {httpOnly: true, secure: true})
        res.status(200).json({accessToken})
    } catch (e) {
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
            return next(ApiError.UnauthorizedError())
        }
        let verifyToken: any = tokenService.validateAccessToken(tokenSplit)
        if (!verifyToken) {
            return next(ApiError.UnauthorizedError())
        }
        const user = await usersQueryRepository.userOutput(verifyToken?._id)
        if (!user) {
            return next(ApiError.UnauthorizedError())
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
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/auth/registration-confirmation/?code=${activationLink}`)
        await authService.userUpdateWithEmailConfirmation(email, emailConfirmation)
        res.status(204).send('Ссылка повторна отправлена')
    } catch (e) {
        return next(e)
    }
}

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {refreshToken, accessToken} = await authService.refreshToken(Object.values(req.cookies)[0])
        res.cookie('refreshToken', refreshToken, {httpOnly: true, secure: true})
        res.status(200).json({accessToken})
    } catch (e) {
        return next(e)
    }
}

export const logoutController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await authService.logoutUser(req.cookies.refreshToken as string)
        res.clearCookie('refreshToken')
        res.status(204).send('Logout')
    } catch (e) {
        return next(e)
    }
}

// const token = req.headers.cookie?.split('=')[1] as string
// const token = Object.values(req.cookies)[0]

