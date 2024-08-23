import {NextFunction, Request, Response} from "express";
import {ApiError} from "../exceptions/api.error";
import {tokenService} from "../services/token.service";

export const authMiddlewareWithBearer = (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization
    if (!token) {
        next(ApiError.UnauthorizedError())
    }
    try {
        token = token!.split(' ')[1]
        if (token === null || !token) {
            next(ApiError.UnauthorizedError())
        }
        let verifyToken = tokenService.validateAccessToken(token)
        if (!verifyToken) {
            next(ApiError.UnauthorizedError())
        }
        next()
    } catch (e) {
        // return next(ApiError.UnauthorizedError())
        next(ApiError.AnyUnauthorizedError(token))
    }
}
