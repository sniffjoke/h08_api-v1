import {app} from '../src/app'
import {agent} from 'supertest'
import {BlogDBType} from "../src/dtos/blogs.dto";
import {PostDBType} from "../src/dtos/posts.dto";
import {SETTINGS} from "../src/settings";
import {UserDBType} from "../src/dtos/users.dto";
import {LoginUserDto} from "../src/dtos/login.dto";
import {CommentDBType} from "../src/dtos/comments.dto";

export const req = agent(app)

export const codeAuth = (code: string) => {
    const buff2 = Buffer.from(code, 'utf8')
    const codedAuth = buff2.toString('base64')
    return codedAuth
}

export const mockBlog = (n: number): BlogDBType => ({
    name: 'name' + `${n}`,
    description: 'description' + `${n}`,
    websiteUrl: 'http://some-' + `${n}` + '-url.com'
})

export const mockPost = (n: number, blogId: string): PostDBType => ({
    title: 'title' + `${n}`,
    shortDescription: 'shortDescription' + `${n}`,
    content: 'content' + `${n}`,
    blogId
})

export const mockUser = (n: number): UserDBType => ({
    login: 'login-' + `${n}`,
    email: 'email' + `${n}` + '@mail.ru',
    password: 'qwerty1'
})

export const mockLoginData = (n: number): LoginUserDto => ({
    loginOrEmail: 'login-' + `${n}`,
    password: 'qwerty1'
})

export const testCreateBlog = async (n: number) => {
    const newBlog = await req
        .post(SETTINGS.PATH.BLOGS)
        .send(mockBlog(n))
        .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
        .expect(201)
    return {newBlog}
}

export const testCreatePost = async (n: number, blog: any) => {
    const postData = mockPost(n, blog.body.id)
    const newPost = await req
        .post(SETTINGS.PATH.POSTS)
        .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
        .send(postData)
        .expect(201)
    return {newPost}
}

export const testCreateBlogAndPost = async (n: number) => {
    const resCreateBlog = await req
        .post(SETTINGS.PATH.BLOGS)
        .send(mockBlog(n))
        .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
        .expect(201)
    const newPost: PostDBType = mockPost(n, resCreateBlog.body.id)
    const resCreatePost = await req
        .post(SETTINGS.PATH.POSTS)
        .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
        .send(newPost)
        .expect(201)
    return {
        newBlog: resCreateBlog,
        postData: newPost,
        newPost: resCreatePost
    }
}

export const testCreateUser = async (n: number) => {
    const userData: UserDBType = mockUser(n)

    const newUser = await req
        .post(SETTINGS.PATH.USERS)
        .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
        .send(userData)
        .expect(201)

    return {
        newUser,
        userData
    }
}

export const mockComment = (n: number, newUser: any, postId: string): CommentDBType => ({
    content: 'commentContent20 + ' + `${n}`,
    commentatorInfo: {
        userId: newUser.body.id,
        userLogin: newUser.body.login
    },
    postId
})

export const testCreateComment = async (n: number, newUser: any, postId: string, token: string) => {
    const commentData = mockComment(n, newUser, postId)
    const newComment = await req
        .post(`${SETTINGS.PATH.POSTS}` + '/' + `${postId}` + '/' + 'comments')
        .auth(token, {type: 'bearer'})
        .send(commentData)
        .expect(201)
    return {
        commentData,
        newComment
    }
}

export const login = async (loginOrEmail: string, password: string) => {
    const loginData = await req
        .post(SETTINGS.PATH.LOGIN)
        .send({loginOrEmail, password})
        .expect(200)
    return {
        loginData
    }
}

