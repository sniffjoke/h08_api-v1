import {blogCollection, commentCollection, postCollection, tokenCollection, userCollection} from "../db/mongo-db";


export const testingRepository = {
    async deleteAll() {
        const blogs = await blogCollection.deleteMany()
        const posts = await postCollection.deleteMany()
        const users = await userCollection.deleteMany()
        const comments = await commentCollection.deleteMany()
        const tokens = await tokenCollection.deleteMany()
        return {
            blogs,
            posts,
            users,
            comments,
            tokens
        }
    },
}
