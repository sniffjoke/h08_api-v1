import * as jwt from 'jsonwebtoken';
import {SETTINGS} from "../settings";
import {ApiError} from "../exceptions/api.error";
import {tokenCollection} from "../db/mongo-db";
import {RTokenDB} from "../types/tokens.interface";
import {WithId} from "mongodb";


export const tokenService = {

    createToken(userId: string) {
        const accessToken = jwt.sign(
            {_id: userId},
            SETTINGS.VARIABLES.JWT_SECRET_ACCESS_TOKEN as string,
            // {expiresIn: 60*60*1000}
            {expiresIn: '10s'}
        )
        const refreshToken = jwt.sign(
            {_id: userId},
            SETTINGS.VARIABLES.JWT_SECRET_REFRESH_TOKEN as string,
            // {expiresIn: 60*60*1000}
            {expiresIn: '20s'}
        )
        return {
            accessToken,
            refreshToken
        }
    },

    decodeToken(token: string) {
        const decodedToken = jwt.decode(token)
        return decodedToken
    },

    getToken(bearerToken: string | undefined) {
        const token = bearerToken ? bearerToken.split(' ')[1] : undefined
        if (!token) {
            throw ApiError.UnauthorizedError()
        }
        return token
    },

    async saveToken(userId: string, token: string) {
        const tokenData: WithId<RTokenDB> | null = await tokenCollection.findOne({userId})
        if (!tokenData) {
            throw ApiError.UnauthorizedError()
        }
        await tokenCollection.updateOne({userId: tokenData.userId}, {$set: {blackList: true}})
        return tokenData
    },

    async refreshToken(refreshToken: string) {
        const tokenData: any = this.validateRefreshToken(refreshToken)
         if (!tokenData) {
            throw ApiError.BadRequest('1', '2')
        }
        const token = await tokenCollection.findOne({refreshToken})
        if (!token || token.blackList) {
            throw ApiError.BadRequest('3', '4')
        }
        await tokenCollection.updateOne({_id: token._id}, {$set: {blackList: true}})
        const tokens = this.createToken(token.userId)
        return {
            tokens,
            userId: token.userId
        }
    },

    validateRefreshToken(token: string) {
        try {
            const userData = jwt.verify(token, SETTINGS.VARIABLES.JWT_SECRET_REFRESH_TOKEN as string);
            return userData;
        } catch (e) {
            return null;
        }
    }

}
