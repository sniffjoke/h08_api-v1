import {ApiError} from "../exceptions/api.error";
import {EmailConfirmationModel, usersRepository} from "../repositories/usersRepository";
import {add} from "date-fns";
import {v4 as uuid} from "uuid";
import {UserDBType} from "../dtos/users.dto";
import mailService from "./mail.service";
import {cryptoService} from "./crypto.service";
import {SETTINGS} from "../settings";
import {usersQueryRepository} from "../queryRepositories/usersQueryRepository";


export const userService = {

    async createUser(userData: UserDBType, confirmStatus: boolean) {
        const {login, email, password} = userData
        const activationLink = uuid()
        const emailConfirmation = this.createEmailInformationInfo(confirmStatus, activationLink)
        await this.isExistOrThrow(login, email)
        const hashPassword = await cryptoService.hashPassword(password)
        const userId = await usersRepository.createUser({email, password: hashPassword, login}, emailConfirmation)
        if (!confirmStatus) {
            await mailService.sendActivationMail(email, `${SETTINGS.PATH.API_URL}/api/auth/registration-confirmation/?code=${activationLink}`)
        }
        const user = await usersQueryRepository.userOutput(userId.toString())
        return user
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
    },

    createEmailInformationInfo(isConfirm: boolean, activationLink: string) {
        const emailConfirmationNotConfirm: EmailConfirmationModel = {
            isConfirmed: false,
            confirmationCode: activationLink,
            expirationDate: add(new Date(), {
                    hours: 1,
                    minutes: 30,
                }
            ).toString()
        }
        const emailConfirmationIsConfirm: EmailConfirmationModel = {
            isConfirmed: true,
        }
        return isConfirm ? emailConfirmationIsConfirm : emailConfirmationNotConfirm
    }

}
