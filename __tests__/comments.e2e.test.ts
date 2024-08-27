import {client, commentCollection, connectToDB} from "../src/db/mongo-db";
import {
    login,
    req,
    testCreateBlogAndPost,
    testCreateComment,
    testCreateUser
} from "./test-helpers";
import {SETTINGS} from "../src/settings";

describe('users', () => {
    beforeAll(async () => { // очистка базы данных перед началом тестирования
        await connectToDB()
        await commentCollection.deleteMany()
    })

    afterAll(async () => {
        await client.close()
    })

// --------------------------------------------------------------------------------------------- //
// ---------------------------api/posts/{postId}/comments--------------------------------------- //
// --------------------------------------------------------------------------------------------- //

    it('should create a Comment', async () => {
        const {newUser, userData} = await testCreateUser(1)
        const {newPost} = await testCreateBlogAndPost(1)
        const {loginData} = await login(newUser.body.login, userData.password)
        const {newComment, commentData} = await testCreateComment(1, newUser, newPost.body.id, loginData.body.accessToken)

        expect(newComment.body.content).toEqual(commentData.content)
    })

// --------------------------------------------------------------------------------------------- //

    it('should get all Comments by postId', async () => {
        const {newUser, userData} = await testCreateUser(2)
        const {newPost} = await testCreateBlogAndPost(2)
        const {loginData} = await login(newUser.body.login, userData.password)
        const {} = await testCreateComment(2, newUser, newPost.body.id, loginData.body.accessToken)

        const getCommentsByPostId = await req
            .get(`${SETTINGS.PATH.POSTS}` + '/' + `${newPost.body.id}` + '/' + 'comments')
            .expect(200)
        console.log(getCommentsByPostId.body)
    })

// --------------------------------------------------------------------------------------------- //
// ------------------------------------api/comments--------------------------------------------- //
// --------------------------------------------------------------------------------------------- //

    it('should get a Comment by id', async () => {
        const {newUser, userData} = await testCreateUser(3)
        const {newPost} = await testCreateBlogAndPost(3)
        const {loginData} = await login(newUser.body.login, userData.password)
        const {newComment} = await testCreateComment(3, newUser, newPost.body.id, loginData.body.accessToken)

        const getComment = await req
            .get(`${SETTINGS.PATH.COMMENTS}` + '/' + `${newComment.body.id}`)
            .expect(200)
    })

// --------------------------------------------------------------------------------------------- //

    it('should update one Comment', async () => {
        const {newUser, userData} = await testCreateUser(4)
        const {newPost} = await testCreateBlogAndPost(4)
        const {loginData} = await login(newUser.body.login, userData.password)
        const {newComment} = await testCreateComment(4, newUser, newPost.body.id, loginData.body.accessToken)

        const updatedComment = await req
            .put(`${SETTINGS.PATH.COMMENTS}` + '/' + `${newComment.body.id}`)
            .send({...newComment, content: 'new-contentComment20X'})
            .auth(loginData.body.accessToken, {type: 'bearer'})
            .expect(204)
    })

// --------------------------------------------------------------------------------------------- //

    it('should remove one Post', async () => {
        const {newUser, userData} = await testCreateUser(5)
        const {newPost} = await testCreateBlogAndPost(5)
        const {loginData} = await login(newUser.body.login, userData.password)
        const {newComment} = await testCreateComment(5, newUser, newPost.body.id, loginData.body.accessToken)

        const removedComment = await req
            .delete(`${SETTINGS.PATH.COMMENTS}` + '/' + `${newComment.body.id}`)
            .auth(loginData.body.accessToken, {type: 'bearer'})
            .expect(204)
    })

})
