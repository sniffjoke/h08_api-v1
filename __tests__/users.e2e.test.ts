import {codeAuth,  req, testCreateUser} from './test-helpers'
import {SETTINGS} from '../src/settings'
import {client, connectToDB, userCollection} from "../src/db/mongo-db";

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
        const {newUser, userData} = await testCreateUser(1)

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
        const {newUser} = await testCreateUser(2)

        const removeUser = await req
            .delete(`${SETTINGS.PATH.USERS}` + '/' + `${newUser.body.id}`)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .expect(204)
        expect(removeUser.status).toBe(204)
    })

})

