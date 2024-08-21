import {NextFunction, Request, Response} from "express";
import * as jwt from "jsonwebtoken";
import {SETTINGS} from "../settings";
import {ObjectId} from "mongodb";
import {commentsQueryRepository} from "../queryRepositories/commentsQueryRepository";
import {commentCollection} from "../db/mongo-db";

export const isOwnMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    let token = req.headers.authorization
    if (!token) {
        res.status(401).send('Нет авторизации')
        return
    }
    try {
        token = token.split(' ')[1]
        if (token === null || !token) {
            console.log('token is null')
            res.status(401).send('Нет авторизации')
            return;
        }
        let decodedToken: any = jwt.verify(token, SETTINGS.VARIABLES.JWT_SECRET_ACCESS_TOKEN as string)
        if (!decodedToken) {
            res.status(401).send('Нет авторизации')
            return;
        }
        const comment = await commentCollection.findOne({_id: new ObjectId(req.params.id)})
        let isOwn: boolean = decodedToken._id === comment?.commentatorInfo.userId.toString()
        if (isOwn) {
            next()
        } else {
            res.status(403).send('Нет доступа')
        }
    } catch (e) {
        res.status(401).send('Нет авторизации catch')
        return;
    }
}
