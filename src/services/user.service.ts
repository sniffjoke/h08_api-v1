import {ApiError} from "../exceptions/api.error";
import {usersRepository} from "../repositories/usersRepository";


export const userService = {

    async userExists(email: string, login: string) {
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
