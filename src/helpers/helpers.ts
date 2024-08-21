import {db} from "../db/mongo-db";

export const queryHelper = async (query: { [key: string]: string | undefined }, searchProperty: 'blogs' | 'posts', blogId?: string) => {
    const searchNameTerm = query.searchNameTerm ? query.searchNameTerm : null

    const queryName = searchNameTerm !== null ? searchNameTerm : ''

    const filterName = searchProperty === 'blogs' ? {name: {$regex: queryName, $options: "i"}} : {};
    const filterId = blogId ? blogId : {}

    const totalCount = await db.collection(searchProperty).countDocuments(blogId ? {blogId: filterId} : filterName)
    const pageSize = query.pageSize !== undefined ? +query.pageSize : 10
    const pagesCount = Math.ceil(totalCount / +pageSize)

    return {
        totalCount,
        pageSize,
        pagesCount,
        page: query.pageNumber ? Number(query.pageNumber) : 1,
        sortBy: query.sortBy ? query.sortBy : 'createdAt',
        sortDirection: query.sortDirection ? query.sortDirection : 'desc',
        searchNameTerm
    }
}
