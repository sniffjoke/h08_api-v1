import {NextFunction, Request, Response} from "express";
import {ApiError} from "../exceptions/api.error";
import {tokenService} from "../services/token.service";

export const authMiddlewareWithBearer = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization as string
    if (!token) {
        // next(ApiError.UnauthorizedError())
        next(ApiError.AnyUnauthorizedError('1'))
    }
    try {
        token = token!.split(' ')[1] as string
        if (token === null || !token) {
            // next(ApiError.UnauthorizedError())
            next(ApiError.AnyUnauthorizedError('2'))
        }
        let verifyToken = tokenService.validateRefreshToken(token)
        if (!verifyToken) {
            // next(ApiError.UnauthorizedError())
            next(ApiError.AnyUnauthorizedError(token))
        }
        next()
    } catch (e) {
        // return next(ApiError.UnauthorizedError())
        next(ApiError.AnyUnauthorizedError(token))
    }
}
