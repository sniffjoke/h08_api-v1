import {codeAuth, mockUser, req} from './test-helpers'
import {SETTINGS} from '../src/settings'
import {client, connectToDB, userCollection} from "../src/db/mongo-db";
import {UserDBType} from "../src/dtos/users.dto";

describe('users', () => {
    beforeAll(async () => { // очистка базы данных перед началом тестирования
        await connectToDB()
        await userCollection.deleteMany()
    })

    afterAll(async () => {
        await client.close()
    })

// --------------------------------------------------------------------------------------------- //

    it('should created User', async () => {
        const userData: UserDBType = mockUser(1)

        const newUser = await req
            .post(SETTINGS.PATH.USERS)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .send(userData)
            .expect(201)
        expect(newUser.body.login).toEqual(userData.login)
        expect(newUser.body.email).toEqual(userData.email)
        expect(typeof newUser.body.id).toEqual('string')
        expect(typeof newUser.body).toEqual('object')
    });

// --------------------------------------------------------------------------------------------- //

    it('should return all users', async () => {
        const users = await req.get(SETTINGS.PATH.USERS)
        expect(users.status).toBe(200)
        expect(users.body.items.length).toBeGreaterThan(0)
    })

// --------------------------------------------------------------------------------------------- //

    it('should remove one user by params id', async () => {
        const userData: UserDBType = mockUser(2)

        const newUser = await req
            .post(SETTINGS.PATH.USERS)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .send(userData)
            .expect(201)


        const removeUser = await req
            .delete(`${SETTINGS.PATH.USERS}` + '/' + `${newUser.body.id}`)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .expect(204)
        expect(removeUser.status).toBe(204)
    })

})

