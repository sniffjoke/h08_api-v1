import {codeAuth, req} from './test-helpers'
import {SETTINGS} from '../../h05_api-v1/src/settings'
import {client, connectToDB, userCollection} from "../../h05_api-v1/src/db/mongo-db";
import {UserDBType} from "../../h05_api-v1/src/dtos/users.dto";

describe('/users', () => {
    beforeAll(async () => { // очистка базы данных перед началом тестирования
        await connectToDB()
        await userCollection.deleteMany()
    })

    afterAll(async () => {
        await client.close()
    })

    it('should created User', async () => {
        const newUser: UserDBType = {
            login: 'l1ret',
            email: 'em@em.ru',
            password: '1234qwer'
        }


        const res = await req
            .post(SETTINGS.PATH.USERS)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.PATH.ADMIN)})
            .send(newUser)
            .expect(201)
        console.log(res.body)
        expect(res.body.login).toEqual(newUser.login)
        expect(res.body.email).toEqual(newUser.email)
        expect(typeof res.body.id).toEqual('string')
        expect(typeof res.body).toEqual('object')
    });

    it('should return all users', async () => {
        const res = await req.get(SETTINGS.PATH.USERS)
        expect(res.status).toBe(200)
        expect(res.body.items.length).toBeGreaterThan(0)
    })



})


// it('should get empty array', async () => {
//     // setDB() // очистка базы данных если нужно
//
//     const res = await req
//         .get(SETTINGS.PATH.BLOGS)
//         .expect(200) // проверяем наличие эндпоинта
//
//     console.log(res.body) // можно посмотреть ответ эндпоинта
//
//     // expect(res.body.length).toBe(0) // проверяем ответ эндпоинта
// })
// it('should get not empty array', async () => {
//     // setDB(dataset1) // заполнение базы данных начальными данными если нужно
//
//     const res = await req
//         .get(SETTINGS.PATH.BLOGS)
//         .expect(200)
//
//     console.log(res.body)
//
//     // expect(res.body.length).toBe(1)
//     // expect(res.body[0]).toEqual(dataset1.videos[0])
// })
