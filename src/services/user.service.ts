import {ApiError} from "../exceptions/api.error";
import {EmailConfirmationModel, usersRepository} from "../repositories/usersRepository";
import {add} from "date-fns";
import {v4 as uuid} from "uuid";
import {UserDBType} from "../dtos/users.dto";
import mailService from "./mail.service";
import {cryptoService} from "./crypto.service";
import {SETTINGS} from "../settings";


export const userService = {

    async registerUser(userData: UserDBType) {
        const {login, email, password} = userData
        const activationLink = uuid()
        const emailConfirmation: EmailConfirmationModel = {
            isConfirmed: false,
            confirmationCode: activationLink,
            expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 30,
                }
            ).toString()
        }
        await this.isExistOrThrow(login, email)
        const hashPassword = await cryptoService.hashPassword(password)
        const userId = await usersRepository.createUser({email, password: hashPassword, login}, emailConfirmation)
        await mailService.sendActivationMail(email, `${SETTINGS.PATH.API_URL}/api/auth/registration-confirmation/?code=${activationLink}`)
        return userId
    },

    async isExistOrThrow(login: string, email: string) {
        const emailExists = await usersRepository.getUserByEmail(email)
        const loginExists = await usersRepository.getUserByLogin(login)
        if (emailExists) {
            throw ApiError.BadRequest(`Юзер с email ${email} уже существует`, 'email')
        }
        if (loginExists) {
            throw ApiError.BadRequest(`Юзер с login ${login} уже существует`, 'login')
        }
        return null
    }

}
