import {db} from "../db/mongo-db";
import {ObjectId} from "mongodb";

export const commentsQueryHelper = async (query: { [key: string]: string | undefined }, postId?: string) => {
    const filter = postId ? {postId: new ObjectId(postId)} : undefined
    const totalCount = await db.collection('comments').countDocuments(filter)
    const pageSize = query.pageSize !== undefined ? +query.pageSize : 10
    const pagesCount = Math.ceil(totalCount / +pageSize)

    return {
        totalCount,
        pageSize,
        pagesCount,
        page: query.pageNumber ? Number(query.pageNumber) : 1,
        sortBy: query.sortBy ? query.sortBy : 'createdAt',
        sortDirection: query.sortDirection ? query.sortDirection : 'desc',
        postId
    }
}
