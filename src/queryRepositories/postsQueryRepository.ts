import {ObjectId, WithId} from "mongodb";
import {postCollection} from "../db/mongo-db";
import {Post} from "../types/posts.interface";


export const postsQueryRepository = {

    async postOutput(id: string) {
        const post = await postCollection.findOne({_id: new ObjectId(id)})
        return this.postMapOutput(post as WithId<Post>)
    },

    postMapOutput(post: WithId<Post>) {
        const {
            createdAt,
            blogName,
            title,
            shortDescription,
            content,
            _id,
            blogId
        } = post
        return {
            id: _id,
            title,
            shortDescription,
            content,
            blogId,
            blogName,
            createdAt
        }
    },

    async getAllPosts() {
        const posts = await postCollection.find().toArray()
        return posts.map(post => postsQueryRepository.postMapOutput(post))
    },

    async postsSortWithQuery(query: any) {
        const posts = await postCollection
            .find()
            .sort(query.sortBy, query.sortDirection)
            .limit(query.pageSize)
            .skip((query.page - 1) * query.pageSize)
            .toArray()
        return posts.map(post => postsQueryRepository.postMapOutput(post))
    },

    async getAllPostsByBlogIdSortWithQuery(blogId: string, query: any) {
        const posts = await postCollection
            .find({blogId})
            .sort(query.sortBy, query.sortDirection)
            .limit(query.pageSize)
            .skip((query.page - 1) * query.pageSize)
            .toArray()
        return posts.map(post => postsQueryRepository.postMapOutput(post))
    }

}
