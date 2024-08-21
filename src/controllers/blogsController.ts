import {Request, Response} from 'express';
import {ObjectId} from "mongodb";
import {blogsRepository} from "../repositories/blogsRepository";
import {queryHelper} from "../helpers/helpers";
import {blogsQueryRepository} from "../queryRepositories/blogsQueryRepository";


export const getBlogsController = async (req: Request<any, any, any, any>, res: Response) => {
    // const query = await queryHelper(req.query, 'blogs')
    // const blogs = await blogsRepository.getAllBlogs(query)
    const blogsQuery = await queryHelper(req.query, 'blogs')
    const blogs = await blogsQueryRepository.blogsSortWithQuery(blogsQuery)
    const {
        pageSize,
        pagesCount,
        totalCount,
        page,
    } = blogsQuery
    res.status(200).json({
        pageSize,
        pagesCount,
        totalCount,
        page,
        items: blogs
    })
}

export const getBlogByIdController = async (req: Request, res: Response) => {
    const id = req.params.id
    const blog = await blogsQueryRepository.blogOutput(id)
    res.status(200).json(blog)
}

export const createBlogController = async (req: Request, res: Response) => {
    try {
        const newBlogId = await blogsRepository.createBlog(req.body)
        // const newBlogMap = blogsQueryRepository.blogMapOutput(newBlog as Blog)
        const newBlog = await blogsQueryRepository.blogOutput(newBlogId.toString())
        res.status(201).json(newBlog)
    } catch (e) {
        res.status(500).send(e)
    }
}

export const updateBlogController = async (req: Request, res: Response) => {
    try {
        const blogId = req.params.id
        await blogsRepository.updateBlogById(blogId, req.body)
        res.status(204).send('Обновлено')
    } catch (e) {
        res.status(500).send(e)
    }
}

export const deleteBlogController = async (req: Request, res: Response) => {
    try {
        const blogId = new ObjectId(req.params.id)
        await blogsRepository.deleteBlog(blogId)
        res.status(204).send('Удалено');
    } catch (e) {
        res.status(500).send(e)
    }

}

