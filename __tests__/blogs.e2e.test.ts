import {codeAuth, mockBlog, req} from './test-helpers'
import {blogCollection, client, connectToDB,} from "../src/db/mongo-db";
import {BlogDBType} from "../src/dtos/blogs.dto";
import {SETTINGS} from "../src/settings";


describe('blogs', () => {
    beforeAll(async () => { // очистка базы данных перед началом тестирования
        await connectToDB()
        await blogCollection.deleteMany()
    })
    afterAll(async () => {
        await client.close()
    })

// --------------------------------------------------------------------------------------------- //

    it('should created Blog', async () => {
        const newBlog: BlogDBType = mockBlog(1)
        const res = await req
            .post(SETTINGS.PATH.BLOGS)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            // .set({'Authorization': `Bearer ` + codeAuth(SETTINGS.PATH.ADMIN)})
            .send(newBlog)
            .expect(201)
        expect(res.body.name).toEqual(newBlog.name)
        expect(res.body.description).toEqual(newBlog.description)
        expect(res.body.websiteUrl).toEqual(newBlog.websiteUrl)
        expect(typeof res.body.id).toEqual('string')
        expect(typeof res.body).toEqual('object')
        // expect(bodyResponse.body).toEqual({} as Blog)
    });

// --------------------------------------------------------------------------------------------- //

    it('should return all blogs', async () => {
        const res = await req.get(SETTINGS.PATH.BLOGS)
        expect(res.status).toBe(200)
        expect(res.body.items.length).toBeGreaterThan(0)
        // expect(res.body).toEqual()
    });

// --------------------------------------------------------------------------------------------- //

    it('should update one blog', async () => {
        const newBlog = mockBlog(2)
        const resCreate = await req
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .expect(201)
        const updateBlog = mockBlog(3)
        const resUpdate = await req
            .put(`${SETTINGS.PATH.BLOGS}` + '/' + `${resCreate.body.id}`)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .send(updateBlog)
            .expect(204)
        expect(typeof resUpdate.body).toEqual('object')
        expect(resUpdate.status).toBe(204)
    })

// --------------------------------------------------------------------------------------------- //

    it('should remove one blog', async () => {
        const newBlog = mockBlog(4)
        const resCreate = await req
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .expect(201)
        const resRemove = await req
            .delete(`${SETTINGS.PATH.BLOGS}` + '/' + `${resCreate.body.id}`)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .expect(204)
        expect(resRemove.status).toBe(204)
    })

// --------------------------------------------------------------------------------------------- //

    it('should return one blog by id', async () => {
        const newBlog = mockBlog(5)
        const resCreate = await req
            .post(SETTINGS.PATH.BLOGS)
            .send(newBlog)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .expect(201)
        const resGetBlogById = await req
            .get(`${SETTINGS.PATH.BLOGS}` + '/' + `${resCreate.body.id}`)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .expect(200)
        expect(resGetBlogById.status).toBe(200)
    })
})
