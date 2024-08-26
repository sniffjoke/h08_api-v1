import {app} from '../src/app'
import {agent} from 'supertest'
import {BlogDBType} from "../src/dtos/blogs.dto";
import {PostDBType} from "../src/dtos/posts.dto";
import {SETTINGS} from "../src/settings";
import {UserDBType} from "../src/dtos/users.dto";

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

export const testCreateBlogAndPost = async (amount: number) => {
    const resCreateBlog = await req
        .post(SETTINGS.PATH.BLOGS)
        .send(mockBlog(amount))
        .set({'Authorization': `Basic ` + codeAuth(SETTINGS.VARIABLES.ADMIN)})
        .expect(201)
    const newPost: PostDBType = mockPost(amount, resCreateBlog.body.id)
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

