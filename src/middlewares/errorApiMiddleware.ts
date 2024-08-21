import {Request, Response, NextFunction} from "express";
import {ApiError} from "../exceptions/api.error";


export const errorApiMiddleware = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof ApiError) {
        return res.status(err.status).json({errorsMessages: [{message: err.message, field: err.field}]})
    }
    return res.status(500).json({message: 'Непредвиденная ошибка', field: 'unknown field'})
}
