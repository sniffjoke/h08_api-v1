import {NextFunction, Request, Response} from 'express';
import {userService} from "../services/user.service";
import {authService} from "../services/auth.service";


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
        const user = await authService.getMe(req.headers.authorization?.split(' ')[1] as string)
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
        await authService.activateEmail(req.body.code)
        res.status(204).send('Email подтвержден')
    } catch (e) {
        return next(e)
    }
}

export const resendEmailController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await authService.resendEmail(req.body.email)
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

