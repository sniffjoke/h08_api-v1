import {app} from '../../h05_api-v1/src/app'
import {agent} from 'supertest'
import {BlogDBType} from "../../h05_api-v1/src/dtos/blogs.dto";

export const req = agent(app)

export const codeAuth = (code: string) => {
    const buff2 = Buffer.from(code, 'utf8')
    const codedAuth = buff2.toString('base64')
    return codedAuth
}

export const mockBlog: BlogDBType = {
    name: 'n2',
    description: 'd2',
    websiteUrl: 'http://some-url.com'
}
