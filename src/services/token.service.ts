import * as jwt from 'jsonwebtoken';
import {SETTINGS} from "../settings";
import {ApiError} from "../exceptions/api.error";


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

}
