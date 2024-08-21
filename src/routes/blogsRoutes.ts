import express from "express";
import {
    createBlogController, deleteBlogController, getBlogByIdController,
    getBlogsController, updateBlogController

} from "../controllers/blogsController";
import {
    descriptionBlogValidator,
    idBlogValidator,
    nameBlogValidator,
    websiteUrlValidator
} from "../middlewares/blogsValidators";
import {errorMiddleware} from "../middlewares/errorMiddleware";
import {authMiddleware} from "../middlewares/authMiddleware";
import {getAllPostsByBlogId, createPostByBlogIdWithParams} from "../controllers/postsController";
import {
    contentPostValidator,
    shortDescriptionPostValidator,
    titlePostValidator
} from "../middlewares/postsValidators";


const router = express.Router();

router.route('/')
    .get(getBlogsController)
    .post(
        authMiddleware,
        nameBlogValidator,
        descriptionBlogValidator,
        websiteUrlValidator,
        errorMiddleware,
        createBlogController
    );
router.route('/:id')
    .put(
        authMiddleware,
        idBlogValidator,
        nameBlogValidator,
        websiteUrlValidator,
        descriptionBlogValidator,
        errorMiddleware,
        updateBlogController
    )
    .delete(
        authMiddleware,
        idBlogValidator,
        errorMiddleware,
        deleteBlogController
    )
    .get(
        idBlogValidator,
        errorMiddleware,
        getBlogByIdController
    );

router.route('/:id/posts')
    .get(
        idBlogValidator,
        errorMiddleware,
        getAllPostsByBlogId
    )
    .post(
        authMiddleware,
        idBlogValidator,
        contentPostValidator,
        shortDescriptionPostValidator,
        titlePostValidator,
        errorMiddleware,
        createPostByBlogIdWithParams
    )


export default router
