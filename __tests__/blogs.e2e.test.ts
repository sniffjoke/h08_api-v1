import {codeAuth, req} from './test-helpers'
import {SETTINGS} from '../../h05_api-v1/src/settings'
import {blogCollection, client, connectToDB, postCollection, userCollection} from "../../h05_api-v1/src/db/mongo-db";
import {BlogDBType} from "../../h05_api-v1/src/dtos/blogs.dto";

describe('/blogs', () => {

    beforeAll(async () => { // очистка базы данных перед началом тестирования
        await connectToDB()
        await blogCollection.deleteMany()
        await postCollection.deleteMany()
        await userCollection.deleteMany()
    })

    afterAll(async () => {
        await client.close()
    })

    it('should created Blog', async () => {
        const newBlog: BlogDBType = {
            name: 'n1',
            description: 'd1',
            websiteUrl: 'http://some.com'
        }


        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            // .set({'Authorization': `Basic ` + codeAuth(SETTINGS.PATH.ADMIN)})
            .set({'Authorization': `Bearer ` + codeAuth(SETTINGS.PATH.ADMIN)})
            .send(newBlog)
            .expect(201)

        expect(res.body.name).toEqual(newBlog.name)
        expect(res.body.description).toEqual(newBlog.description)
        expect(res.body.websiteUrl).toEqual(newBlog.websiteUrl)
        expect(typeof res.body.id).toEqual('string')
        expect(typeof res.body).toEqual('object')
        // expect(bodyResponse.body).toEqual({} as Blog)
    });

    it('should return all blogs', async () => {
        const res = await req.get(SETTINGS.PATH.BLOGS)
        expect(res.status).toBe(200)
        expect(res.body.items.length).toBeGreaterThan(0)
        // expect(res.body).toEqual()
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
