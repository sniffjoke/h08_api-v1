import {ApiError} from "../exceptions/api.error";
import {EmailConfirmationModel, usersRepository} from "../repositories/usersRepository";
import * as bcrypt from "bcrypt";
import {authRepository} from "../repositories/authRepository";


export const authService = {

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

    // async isActivateEmailByStatus(confirmationCode: string) {
    //     const isActivate = await authRepository.checkActivateEmailByStatus(confirmationCode)
    //     if (!isActivate) {
    //         throw ApiError.BadRequest('Юзер уже активирован', 'code')
    //     }
    // },

    async isActivateEmailByStatus(email: string) {
        const isActivate = await usersRepository.getUserByEmail(email)
        if (isActivate?.emailConfirmation.isConfirmed) {
            throw ApiError.BadRequest('Юзер уже активирован', 'email')
        }
        return isActivate
    },

    async userUpdateWithEmailConfirmation(email: string, confirmationCode: EmailConfirmationModel) {
        const user = await authRepository.updateUserWithResendActivateEmail(email, confirmationCode)
        //
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
