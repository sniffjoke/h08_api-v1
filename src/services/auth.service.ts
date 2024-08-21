import {userCollection} from "../db/mongo-db";
import {ApiError} from "../exceptions/api.error";
import {usersRepository} from "../repositories/usersRepository";


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

    async activate(confirmationCode: any) {
        const user = await userCollection.findOneAndUpdate({'emailConfirmation.confirmationCode': confirmationCode}, {$set: {'emailConfirmation.isConfirmed': true}})
        // await userCollection.updateOne(user, {$set: {'emailConfirmation.isConfirmed': true}})
        return user
    },

}
