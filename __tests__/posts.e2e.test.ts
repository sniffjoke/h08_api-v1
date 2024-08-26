import {codeAuth, mockPost, req, testCreateBlogAndPost} from './test-helpers'
import {SETTINGS} from '../src/settings'
import {blogCollection, client, connectToDB, postCollection,} from "../src/db/mongo-db";
import {PostDBType} from "../src/dtos/posts.dto";

describe('posts', () => {
    beforeAll(async () => { // очистка базы данных перед началом тестирования
        await connectToDB()
        await blogCollection.deleteMany()
        await postCollection.deleteMany()
    })

    afterAll(async () => {
        await client.close()
    })

// --------------------------------------------------------------------------------------------- //

    it('should created a Post', async () => {
        const {newPost, postData} = await testCreateBlogAndPost(1)

        expect(newPost.body.title).toEqual(postData.title)
        expect(newPost.body.shortDescription).toEqual(postData.shortDescription)
        expect(newPost.body.content).toEqual(postData.content)
        expect(typeof newPost.body.id).toEqual('string')
        expect(typeof newPost.body).toEqual('object')
    });

// --------------------------------------------------------------------------------------------- //

    it('should created a Post with params', async () => {
        const {newBlog} = await testCreateBlogAndPost(2)
        const newPostData = mockPost(3, newBlog.body.id)

        const newPost = await req
            .post(`${SETTINGS.PATH.BLOGS}` + '/' + `${newBlog.body.id}` + '/posts')
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .send({
                title: newPostData.title,
                shortDescription: newPostData.shortDescription,
                content: newPostData.content,
            })
            .expect(201)

        expect(newPost.body.title).toEqual(newPostData.title)
        expect(newPost.body.shortDescription).toEqual(newPostData.shortDescription)
        expect(newPost.body.content).toEqual(newPostData.content)
        expect(typeof newPost.body.id).toEqual('string')
        expect(typeof newPost.body).toEqual('object')
    });

// --------------------------------------------------------------------------------------------- //

    it('should return all posts', async () => {
        const res = await req.get(SETTINGS.PATH.BLOGS)
        expect(res.status).toBe(200)
        expect(res.body.items.length).toBeGreaterThan(0)
    })

// --------------------------------------------------------------------------------------------- //

    it('should update one post', async () => {
        const {newBlog, newPost} = await testCreateBlogAndPost(3)

        const updatePost: PostDBType = mockPost(4, newBlog.body.id)
        const updatedPost = await req
            .put(`${SETTINGS.PATH.POSTS}` + '/' + `${newPost.body.id}`)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .send(updatePost)
            .expect(204)
        expect(typeof updatedPost.body).toEqual('object')
        expect(updatedPost.status).toBe(204)
    })

// --------------------------------------------------------------------------------------------- //

    it('should remove one post', async () => {
        const {newPost} = await testCreateBlogAndPost(5)

        const resRemovePost = await req
            .delete(`${SETTINGS.PATH.POSTS}` + '/' + `${newPost.body.id}`)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .expect(204)
        expect(resRemovePost.status).toBe(204)
    })

// --------------------------------------------------------------------------------------------- //

    it('should return one post by id', async () => {
        const {newPost} = await testCreateBlogAndPost(6)

        const getPostById = await req
            .get(`${SETTINGS.PATH.POSTS}` + '/' + `${newPost.body.id}`)
            .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
            .expect(200)
        expect(getPostById.status).toBe(200)
    })

})
