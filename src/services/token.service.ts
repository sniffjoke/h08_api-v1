import * as jwt from 'jsonwebtoken';
import {SETTINGS} from "../settings";
import {ApiError} from "../exceptions/api.error";



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
