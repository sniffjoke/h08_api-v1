import {Request, Response} from 'express';
import {ObjectId} from "mongodb";
import {postsRepository} from "../repositories/postsRepository";
import {queryHelper} from "../helpers/helpers";
import {postsQueryRepository} from "../queryRepositories/postsQueryRepository";
import {blogsRepository} from "../repositories/blogsRepository";


export const getPostsController = async (req: Request<any, any, any, any>, res: Response) => {
    try {
        const postsQuery = await queryHelper(req.query, 'posts')
        const posts = await postsQueryRepository.postsSortWithQuery(postsQuery)
        const {
            pageSize,
            pagesCount,
            totalCount,
            page
        } = postsQuery
        res.status(200).json({
            pageSize,
            pagesCount,
            totalCount,
            page,
            items: posts
        })
    } catch (e) {
        res.status(500).send(e)
    }
}

export const getPostByIdController = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id
        const post = await postsQueryRepository.postOutput(postId)
        res.status(200).json(post)
    } catch (e) {
        res.status(500).send(e)
    }
}

export const createPostController = async (req: Request, res: Response) => {
    try {
        const blog = await blogsRepository.findBlogById(req.body.blogId)
        const newPostId = await postsRepository.createPost({...req.body, blogName: blog?.name})
        const newPost = await postsQueryRepository.postOutput(newPostId.toString())
        res.status(201).json(newPost)
    } catch (e) {
        res.status(500).send(e)
    }
}

export const updatePostController = async (req: Request, res: Response) => {
    try {
        const postId = req.params.id
        await postsRepository.updatePostById(postId, req.body)
        res.status(204).send('Обновлено')
    } catch (e) {
        res.status(500).send(e)
    }
}

export const deletePostController = async (req: Request, res: Response) => {
    try {
        const postId = new ObjectId(req.params.id)
        await postsRepository.postDelete(postId)
        res.status(204).send('Удалено');
    } catch (e) {
        res.status(500).send(e)
    }
}

export const getAllPostsByBlogId = async (req: Request<any, any, any, any>, res: Response) => {
    try {
        const postsQueryByBlogId = await queryHelper(req.query, 'posts', req.params.id)
        const posts = await postsQueryRepository.getAllPostsByBlogIdSortWithQuery(req.params.id, postsQueryByBlogId)
        const {
            pageSize,
            pagesCount,
            totalCount,
            page,
        } = postsQueryByBlogId
        res.status(200).json({
            pageSize,
            pagesCount,
            totalCount,
            page,
            items: posts
        })
    } catch (e) {
        res.status(500).send(e)
    }
}

export const createPostByBlogIdWithParams = async (req: Request, res: Response) => {
    try {
        const blog = await blogsRepository.findBlogById(req.params.id)
        const newPostId = await postsRepository.createPost({...req.body, blogName: blog?.name, blogId: req.params.id})
        const newPost = await postsQueryRepository.postOutput(newPostId.toString())
        res.status(201).json(newPost)
    } catch (e) {
        res.status(500).send(e)
    }
}

