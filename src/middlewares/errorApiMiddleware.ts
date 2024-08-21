import {Request, Response, NextFunction} from "express";
import {ApiError} from "../exceptions/api.error";


export const errorApiMiddleware = (err: Error, req: Request, res: Response) => {
    if  (err instanceof ApiError) {
        res.status(err.status).json({ErrorsMessage: [ {message: err.message,  field: err.field}]})
    }
    return res.status(500).json({message: 'Непредвиденная ошибка'})
}
