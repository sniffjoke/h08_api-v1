import {codeAuth, mockBlog, req} from './test-helpers'
import {SETTINGS} from '../../h05_api-v1/src/settings'
import {client, connectToDB, postCollection} from "../../h05_api-v1/src/db/mongo-db";
import {PostDBType} from "../../h05_api-v1/src/dtos/posts.dto";

describe('/posts', () => {
    beforeAll(async () => { // очистка базы данных перед началом тестирования
        await connectToDB()
        await postCollection.deleteMany()
    })

    afterAll(async () => {
        await client.close()
    })



    it('should created a Post', async () => {
        await req.post(SETTINGS.PATH.BLOGS)
            .send(mockBlog)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.PATH.ADMIN)})
            .expect(201)
        const resBlog = await req.get(SETTINGS.PATH.BLOGS)
        const newPost: PostDBType = {
            blogId: resBlog.body.items[0].id,
            content: 'c1',
            title: 't1',
            shortDescription: 'sd1'
        }



        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.PATH.ADMIN)})
            .send(newPost)
            .expect(201)

        expect(res.body.title).toEqual(newPost.title)
        expect(res.body.shortDescription).toEqual(newPost.shortDescription)
        expect(res.body.content).toEqual(newPost.content)
        expect(typeof res.body.id).toEqual('string')
        expect(typeof res.body).toEqual('object')
    });

    it('should created a Post with params', async () => {
        const resBlog = await req.post(SETTINGS.PATH.BLOGS)
            .send(mockBlog)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.PATH.ADMIN)})
            .expect(201)
        const findBlogId = await req.get(SETTINGS.PATH.BLOGS + '/' + resBlog.body.id)
        const newPost: Omit<PostDBType, 'blogId'> = {
            content: 'c1',
            title: 't1',
            shortDescription: 'sd1'
        }


        const res = await req
            .post(SETTINGS.PATH.POSTS)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.PATH.ADMIN)})
            .send({...newPost, blogId: findBlogId.body.id})
            .expect(201)

        expect(res.body.title).toEqual(newPost.title)
        expect(res.body.shortDescription).toEqual(newPost.shortDescription)
        expect(res.body.content).toEqual(newPost.content)
        expect(typeof res.body.id).toEqual('string')
        expect(typeof res.body).toEqual('object')
    });

    it('should return all posts', async () => {
        const res = await req.get(SETTINGS.PATH.BLOGS)
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
