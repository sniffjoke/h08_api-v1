import {userCollection} from "../db/mongo-db";
import {ObjectId, WithId} from "mongodb";
import {UserDBType} from "../dtos/users.dto";
import {User} from "../types/users.interface";

export interface EmailConfirmationModel {
        confirmationCode?: string
        expirationDate?: Date
        isConfirmed: boolean
}

export const usersRepository = {

    async createUser(userData: UserDBType, emailConfirmation: EmailConfirmationModel): Promise<ObjectId> {
        const user: User = {
            login: userData.login,
            email: userData.email,
            password: userData.password,
            emailConfirmation,
            createdAt: new Date(Date.now()).toISOString()
        }
        const newUser = await userCollection.insertOne(user as WithId<User>)
        return newUser.insertedId
    },

    async deleteUser(id: string) {
        return await userCollection.deleteOne({_id: new ObjectId(id)})
    },

    async findUserById(id: string) {
        return await userCollection.findOne({_id: new ObjectId(id)})
    },

    async getUserByEmail(email: string) {
        const user = await userCollection.findOne({email}) //$or
        return user
    },

    async getUserByLogin(login: string) {
        const user = await userCollection.findOne({login})
        return user
    },

}
