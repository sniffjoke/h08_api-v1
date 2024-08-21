import {usersQueryRepository} from "../queryRepositories/usersQueryRepository";
import {userCollection} from "../db/mongo-db";


export const userService = {

    async validateUser(userLoginOrEmail: string) {
        let user
        if (!/^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(userLoginOrEmail)) {
            // return  await usersQueryRepository.validateUserByLogin(userLoginOrEmail)
            user = await usersQueryRepository.validateUserByLogin(userLoginOrEmail)
        } else {
            // return  await usersQueryRepository.validateUserByEmail(userLoginOrEmail)
            user = await usersQueryRepository.validateUserByEmail(userLoginOrEmail)
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
    }

}
