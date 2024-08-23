import * as jwt from 'jsonwebtoken';
import {SETTINGS} from "../settings";
import {ApiError} from "../exceptions/api.error";
import {tokenCollection} from "../db/mongo-db";



export const tokenService = {

    createToken(userId: string) {
        const accessToken = jwt.sign(
            {_id: userId},
            SETTINGS.VARIABLES.JWT_SECRET_ACCESS_TOKEN as string,
            // {expiresIn: 60*60*1000}
            {expiresIn: '12s'}
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

    async refreshToken(refreshToken: string) {
        const tokenData: any = this.validateRefreshToken(refreshToken)
         if (!tokenData) {
            // throw ApiError.UnauthorizedError()
            throw ApiError.AnyUnauthorizedError(refreshToken)
        }
        const token = await tokenCollection.findOne({refreshToken})
        if (!token || token.blackList) {
            throw ApiError.UnauthorizedError()
        }
        await tokenCollection.updateOne({_id: token._id}, {$set: {blackList: true}})
        const tokens = this.createToken(token.userId)
        return {
            tokens,
            userId: token.userId
        }
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
