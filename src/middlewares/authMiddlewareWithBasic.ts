import {Request, Response, NextFunction} from "express";
import * as jwt from "jsonwebtoken";
import {SETTINGS} from "../settings";
import {ApiError} from "../exceptions/api.error";

export const authMiddlewareWithBasic = (req: Request, res: Response, next: NextFunction) => {
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
