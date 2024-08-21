import {ObjectId} from "mongodb";
import {userCollection} from "../db/mongo-db";
import {User} from "../types/users.interface";


export const usersQueryRepository = {

    async findAllUsers(query: any) {
        const queryLogin = query.searchLoginTerm !== null ? query.searchLoginTerm : ''
        const queryEmail = query.searchEmailTerm !== null ? query.searchEmailTerm : ''
        const filter = {
            $or: [
                {login: {$regex: queryLogin, $options: "i"}},
                {email: {$regex: queryEmail, $options: "i"}}
             ]
        }

        const users = await userCollection
            .find(filter)
            .sort(query.sortBy, query.sortDirection)
            .limit(query.pageSize)
            .skip((query.page - 1) * query.pageSize)
            .toArray()
        return users
    },

    async findUserById(id: ObjectId) {
        return await userCollection.findOne({_id: id})
    },

    async userOutput(id: ObjectId): Promise<Omit<User, '_id'> | null> {
        const user = await this.findUserById(id)
        return this.userMapOutput(user as User)
    },

    userMapOutput(user: User) {
        const {_id, createdAt, login, email} = user
        return {
            id: _id,
            login,
            email,
            createdAt
        }
    },

    async validateUserByEmail(email: string) {
        const user = await this.getUserByEmail(email);
        return user
    },
    // обычный репозиторий
    async validateUserByLogin(login: string) {
        const user = await this.getUserByLogin(login);
        // отдавать не всего юзера
        return user
    },

    async getUserByEmail(email: string) {
        const user = await userCollection.findOne({email}) //$or
        return user
    },

    async getUserByLogin(login: string) {
        const user = await userCollection.findOne({login})
        return user
    },

    async getUserById(id: ObjectId) {
        const user = await userCollection.findOne({_id: id})
        return user
    }
}
