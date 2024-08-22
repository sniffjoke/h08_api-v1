import {NextFunction, Request, Response} from "express";
import {ApiError} from "../exceptions/api.error";
import * as jwt from "jsonwebtoken";
import {SETTINGS} from "../settings";

export const authMiddlewareWithBearer = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization
    if (!token) {
        return next(ApiError.UnauthorizedError())
    }
    try {
        token = token!.split(' ')[1]
        if (token === null || !token) {
            return next(ApiError.UnauthorizedError())
        }
        let verifyToken = jwt.verify(token, SETTINGS.VARIABLES.JWT_SECRET_ACCESS_TOKEN as string)
        if (!verifyToken) {
            return next(ApiError.UnauthorizedError())
        }
        next()
    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}
