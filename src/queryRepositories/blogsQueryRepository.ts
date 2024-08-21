import {ObjectId, WithId} from "mongodb";
import {blogCollection} from "../db/mongo-db";
import {Blog} from "../types/blogs.interface";

// сразу отправляем в качестве ответа

export const blogsQueryRepository = {

    async blogsSortWithQuery(query: any) {
        const queryName = query.searchNameTerm !== null ? query.searchNameTerm : ''
        const filter = {
            name: {$regex: queryName, $options: "i"},
        }
        const blogsWithSort = await blogCollection
            .find(filter)
            .sort(query.sortBy, query.sortDirection)
            .limit(query.pageSize)
            .skip((query.page - 1) * query.pageSize)
            .toArray()
        return blogsWithSort.map(blog => this.blogMapOutput(blog))
    },

    async blogOutput(id: string) {
        const blog = await blogCollection.findOne({_id: new ObjectId(id)})
        // return this.blogMapOutput(blog as Blog)
        return this.blogMapOutput(blog as WithId<Blog>)
    },

    blogMapOutput(blog: WithId<Blog>) {
        const {_id, createdAt, name, websiteUrl, isMembership, description} = blog
        return {
            id: _id.toString(),
            name,
            websiteUrl,
            isMembership,
            createdAt,
            description
        }
    },

    // async getAllBlogs() {
    //     const blogs = await blogCollection.find().toArray()
    //     return blogs.map(blog => this.blogMapOutput(blog))
    // }

}
