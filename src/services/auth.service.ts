import {ApiError} from "../exceptions/api.error";
import {EmailConfirmationModel, usersRepository} from "../repositories/usersRepository";
import * as bcrypt from "bcrypt";
import {authRepository} from "../repositories/authRepository";
import {LoginUserDto} from "../dtos/login.dto";
import {tokenService} from "./token.service";
import {tokensRepository} from "../repositories/tokensRepository";
import {RTokenDB} from "../types/tokens.interface";


export const authService = {

    async loginUser(userData: LoginUserDto) {
        const user = await this.validateUser(userData.loginOrEmail)
        if (!user) {
            throw ApiError.UnauthorizedError()
        }
        const isPasswordCorrect =  await this.isPasswordCorrect(userData.password, user.password)
        if (!isPasswordCorrect) {
            throw ApiError.UnauthorizedError()
        }
        const {accessToken, refreshToken} = tokenService.createTokens(user._id.toString())
        const tokenData = {
            userId: user._id.toString(),
            refreshToken,
            blackList: false
        } as RTokenDB
        await tokensRepository.createToken(tokenData)
        return {
            accessToken,
            refreshToken
        }
    },

    async refreshToken(token: string) {
        const tokenValidate: any = tokenService.validateRefreshToken(token)
        if (!tokenValidate) {
            throw ApiError.UnauthorizedError()
        }
        const isTokenExists = await tokensRepository.findTokenByRefreshToken(token)
        if (!isTokenExists || isTokenExists.blackList) {
            throw ApiError.UnauthorizedError()
        }
        const updateTokenInfo = await tokensRepository.updateTokenForActivate(token)
        if (!updateTokenInfo) {
            throw ApiError.UnauthorizedError()
        }
        const {refreshToken, accessToken} = tokenService.createTokens(isTokenExists.userId)
        const tokenData = {
            userId: isTokenExists.userId,
            refreshToken,
            blackList: false
        } as RTokenDB
        const addTokenToDb = await tokensRepository.createToken(tokenData)
        if (!addTokenToDb) {
            throw ApiError.UnauthorizedError()
        }
        return {
            refreshToken,
            accessToken
        }

    },

    async logoutUser(token: string) {
        const tokenVerified = tokenService.validateRefreshToken(token)
        if (!tokenVerified) {
            throw ApiError.UnauthorizedError()
        }
        const tokenFromDb = await tokensRepository.findTokenByRefreshToken(token)
        if (!tokenFromDb || tokenFromDb.blackList) {
            throw ApiError.UnauthorizedError()
        }
        const updatedToken = await tokensRepository.updateTokenForActivate(tokenFromDb.refreshToken)
        if (!updatedToken) {
            throw ApiError.UnauthorizedError()
        }
        return updatedToken
    },

    async validateUser(userLoginOrEmail: string) {
        let user
        if (!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(userLoginOrEmail)) {
            user = await usersRepository.getUserByLogin(userLoginOrEmail)
        } else {
            user = await usersRepository.getUserByEmail(userLoginOrEmail)
        }
        if (!user) {
            throw ApiError.BadRequest('Пользователь не найден', 'loginOrEmail')
        }
        return user
    },

    async isPasswordCorrect(password: string, hashedPassword: string) {
        const isCorrect =  await bcrypt.compare(password, hashedPassword)
        if (!isCorrect) {
            throw ApiError.UnauthorizedError()
        }
        return isCorrect
    },

    async isActivateEmailByCode(confirmationCode: string) {
        const isActivate = await authRepository.checkActivateEmailByCode(confirmationCode)
        if (!isActivate) {
            throw ApiError.BadRequest('Юзер уже активирован', 'code')
        }
    },

    async toActivate(confirmationCode: string) {
        const user = await authRepository.toActivateEmail(confirmationCode)
        if (!user) {
            throw ApiError.BadRequest('Юзер не найден', 'code')
        }
        return user
    },

    async validateUserByEmail(email: string) {
        const isExists = await usersRepository.getUserByEmail(email)
        if (!isExists) {
            throw ApiError.BadRequest('Юзер не найден', 'email')
        }
        return isExists
    },

    async isActivateEmailByStatus(email: string) {
        const isActivate = await usersRepository.getUserByEmail(email)
        if (isActivate?.emailConfirmation.isConfirmed) {
            throw ApiError.BadRequest('Юзер уже активирован', 'email')
        }
        return isActivate
    },

    async userUpdateWithEmailConfirmation(email: string, confirmationCode: EmailConfirmationModel) {
        const user = await authRepository.updateUserWithResendActivateEmail(email, confirmationCode)
        return user
    },

    async checkUserExistsForToken(id: string) {
        const user = await usersRepository.findUserById(id)
        if (!user) {
            throw ApiError.BadRequest('Токен не валидный', 'token')
        }
        return user
    }

}
