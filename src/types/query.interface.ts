

export interface IQuery {
    totalCount?: number,
    pageSize: number,
    pagesCount?: number,
    page: number,
    sortBy: string,
    sortDirection: string,
    searchNameTerm?: string,
    searchLoginTerm?: string,
    searchEmailTerm?: string
}
