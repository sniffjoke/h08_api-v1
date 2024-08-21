import {Request, Response, NextFunction} from "express";
import * as jwt from "jsonwebtoken";
import {SETTINGS} from "../settings";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Basic')) {
        token = req.headers.authorization.split(' ')[1]
        const decodedToken = Buffer.from(token, 'base64').toString('base64')
        const codedToken = Buffer.from(SETTINGS.VARIABLES.ADMIN, 'utf-8').toString('base64')
        if (decodedToken !== codedToken) {
            res.status(401).send('Нет авторизации')
            return
        }
    }
    if (!req.headers.authorization || !req.headers.authorization.startsWith('Basic')) {
        res.status(401).send('Нет авторизации')
        return
    }
    next()
}

export const authMiddlewareWithBearer = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization
    if (!token) {
        res.status(401).send('Нет авторизации')
        return
    }
    try {
        token = token.split(' ')[1]
        if (token === null || !token) {
            res.status(401).send('Нет авторизации')
            return;
        }
        let decodedToken = jwt.verify(token, SETTINGS.VARIABLES.JWT_SECRET_ACCESS_TOKEN as string)
        if (!decodedToken) {
            res.status(401).send('Нет авторизации')
            return;
        }

        next()
    } catch (e) {
        res.status(401).send('Нет авторизации')
        return;
    }
}
