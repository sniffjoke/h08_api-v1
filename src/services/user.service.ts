import {usersQueryRepository} from "../queryRepositories/usersQueryRepository";
import {userCollection} from "../db/mongo-db";
import {WithId} from "mongodb";
import {User} from "../types/users.interface";
import {ApiError} from "../exceptions/api.error";
import {usersRepository} from "../repositories/usersRepository";


export const userService = {

    async validateUserByEmail(email: string) {
        const user = await userCollection.findOne({email});
        if (user) {
            return usersQueryRepository.userMapOutput(user as WithId<User>);
        } else {
            return null
        }
    },
    // обычный репозиторий
    async validateUserByLogin(login: string) {
        // отдавать не всего юзера
        const user = await userCollection.findOne({login});
        if (user) {
            return usersQueryRepository.userMapOutput(user as WithId<User>)
        } else {
            return null
        }
    },

    async validateUser(userLoginOrEmail: string) {
        let user
        if (!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(userLoginOrEmail)) {
            user = await this.validateUserByLogin(userLoginOrEmail)
        } else {
            user = await this.validateUserByEmail(userLoginOrEmail)
        }
        // if (!user) {
        //     throw ApiError.BadRequest('Пользователь не найден', 'loginOrEmail')
        // }
        return user
    },

    async activate(confirmationCode: any) {
        const user = await userCollection.findOneAndUpdate({'emailConfirmation.confirmationCode': confirmationCode}, {$set: {'emailConfirmation.isConfirmed': true}})
        // await userCollection.updateOne(user, {$set: {'emailConfirmation.isConfirmed': true}})
        return user
    },

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
