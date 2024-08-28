import * as jwt from 'jsonwebtoken';
import {SETTINGS} from "../settings";
import {ApiError} from "../exceptions/api.error";
import {tokenCollection} from "../db/mongo-db";
import {WithId} from "mongodb";
import {RTokenDB} from "../types/tokens.interface";



export const tokenService = {

    createTokens(userId: string) {
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

    getToken(bearerToken: string | undefined) {
        const token = bearerToken ? bearerToken.split(' ')[1] as string : undefined
        if (!token) {
            throw ApiError.UnauthorizedError()
        }
        return token
    },

    decodeToken(token: string) {
        const decodedToken = jwt.decode(token)
        if (!token) {
            throw ApiError.UnauthorizedError()
        }
        return decodedToken
    },

    async refreshToken(refreshToken: string) {
        const tokenData: any = this.validateRefreshToken(refreshToken)
         if (!tokenData) {
            throw ApiError.AnyUnauthorizedError(refreshToken)
        }
        const token = await tokenCollection.findOne({refreshToken})
        if (!token || token.blackList) {
            throw ApiError.UnauthorizedError()
        }
        await tokenCollection.updateOne({_id: token._id}, {$set: {blackList: true}})
        const tokens = this.createTokens(token.userId)
        return {
            tokens,
            userId: token.userId
        }
    },

    async addTokenToDb(userId: string, refreshToken: string) {
        const token = await tokenCollection.insertOne({
            userId,
            refreshToken,
            blackList: false
        } as WithId<RTokenDB>)
        if (!token) {
            throw ApiError.UnauthorizedError()
        }
        return token
    },

    async updateTokenInDb(refreshToken: string) {
        const updatedToken = await tokenCollection.updateOne({refreshToken}, {$set: {blackList: true}})
        if (!updatedToken) {
            throw ApiError.UnauthorizedError()
        }
        return updatedToken
    },

    validateAccessToken(token: string) {
        try {
            const userData = jwt.verify(token, SETTINGS.VARIABLES.JWT_SECRET_ACCESS_TOKEN as string)
            return userData
        } catch (e) {
            return null
        }
    },

    validateRefreshToken(token: string) {
        try {
            const userData = jwt.verify(token, SETTINGS.VARIABLES.JWT_SECRET_REFRESH_TOKEN as string)
            return userData
        } catch (e) {
            return null
        }
    }
}
