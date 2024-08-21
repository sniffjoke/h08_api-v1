import {blogCollection} from "../db/mongo-db";
import {ObjectId, UpdateResult, WithId} from "mongodb";
import {blogsQueryRepository} from "../queryRepositories/blogsQueryRepository";
import {BlogDBType} from "../dtos/blogs.dto";
import {Blog} from "../types/blogs.interface";


export const blogsRepository = {

    // async getAllBlogs(query: any) {
    //     const blogs = await blogsQueryRepository.blogsSortWithQuery(query)
    //     return {
    //         ...query,
    //         items: blogs.map(blog => blogsQueryRepository.blogMapOutput(blog))
    //     }
    // },

    async findBlogById(id: string) {
        return await blogCollection.findOne({_id: new ObjectId(id)})
    },

    // async createBlog(newBlog: BlogDBType): Promise<Omit<Blog, '_id'>> {
    async createBlog(blogData: BlogDBType): Promise<ObjectId> {
        const blog: Blog = {
            name: blogData.name,
            description: blogData.description,
            websiteUrl: blogData.websiteUrl,
            isMembership: false,
            createdAt: new Date(Date.now()).toISOString()
        }
        const  newBlog = await blogCollection.insertOne(blog as WithId<Blog>)
        return newBlog.insertedId
    },

    async updateBlogById(id: string, blog: BlogDBType): Promise<UpdateResult> {
        const findedBlog = await blogCollection.findOne({_id: new ObjectId(id)})
        const updates = {
            $set: {
                name: blog.name,
                description: blog.description,
                websiteUrl: blog.websiteUrl,
            }
        }
        const updatedBlog = await blogCollection.updateOne({_id: findedBlog?._id}, updates)
        // const updatedBlog = await blogCollection.updateOne({_id: new ObjectId(id)}, updates)
        return updatedBlog
    },

    async deleteBlog(id: ObjectId) {
        return await blogCollection.deleteOne({_id: id})
    }

}
