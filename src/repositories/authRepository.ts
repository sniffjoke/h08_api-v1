import {userCollection} from "../db/mongo-db";
import {EmailConfirmationModel} from "./usersRepository";


export const authRepository = {

    async updateUserWithResendActivateEmail(email: string, emailConfirmation: EmailConfirmationModel) {
        const updateUserInfo = await userCollection.updateOne({email}, {$set: {emailConfirmation}});
        return updateUserInfo
    },

    async checkActivateEmailByCode(confirmationCode: string) {
        const checkActivate = await userCollection.findOne({'emailConfirmation.confirmationCode': confirmationCode})
        return checkActivate;
    },

    async toActivateEmail(confirmationCode: string) {
        const updateEmail = await userCollection.findOneAndUpdate(
            {'emailConfirmation.confirmationCode': confirmationCode},
            {$set: {emailConfirmation: {isConfirmed: true}}}
        )
        return updateEmail
    }

}
