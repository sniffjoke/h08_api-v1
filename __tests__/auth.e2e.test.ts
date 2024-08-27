import {client, connectToDB, userCollection} from "../src/db/mongo-db";
import {UserDBType} from "../src/dtos/users.dto";
import {codeAuth, mockLoginData, mockUser, req} from "./test-helpers";
import {SETTINGS} from "../src/settings";

describe('users', () => {
    beforeAll(async () => { // очистка базы данных перед началом тестирования
        await connectToDB()
        await userCollection.deleteMany()
    })

    afterAll(async () => {
        await client.close()
    })

// --------------------------------------------------------------------------------------------- //

    it('should login success', async () => {
        const userData: UserDBType = mockUser(1)

        const newUser = await req
            .post(SETTINGS.PATH.USERS)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .send(userData)
            .expect(201)

        const loginSuccess = await req
            .post(SETTINGS.PATH.LOGIN)
            .send(mockLoginData(1))
            .expect(200)
        expect(loginSuccess.status).toBe(200)
        expect(typeof loginSuccess.body.accessToken).toEqual('string')
    })

})
