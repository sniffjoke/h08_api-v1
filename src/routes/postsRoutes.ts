import express from "express";
import {
    getPostsController,
    createPostController,
    updatePostController, getPostByIdController, deletePostController
} from "../controllers/postsController";
import {
    titlePostValidator,
    contentPostValidator,
    shortDescriptionPostValidator,
    blogIdValidator,
    idPostValidator
} from "../middlewares/postsValidators";
import {errorMiddleware} from "../middlewares/errorMiddleware";
import {authMiddleware, authMiddlewareWithBearer} from "../middlewares/authMiddleware";
import {createCommentByPostIdWithParamsController, getAllCommentsByPostIdController} from "../controllers/commentsController";
import {contentCommentValidator} from "../middlewares/commentsValidators";


const router = express.Router();

router.route('/')
    .get(getPostsController)
    .post(
        authMiddleware,
        titlePostValidator,
        contentPostValidator,
        blogIdValidator,
        shortDescriptionPostValidator,
        errorMiddleware,
        createPostController
    );

router.route('/:id')
    .put(
        authMiddleware,
        idPostValidator,
        titlePostValidator,
        contentPostValidator,
        blogIdValidator,
        shortDescriptionPostValidator,
        errorMiddleware,
        updatePostController
    )
    .delete(
        authMiddleware,
        idPostValidator,
        errorMiddleware,
        deletePostController
    )
    .get(
        idPostValidator,
        errorMiddleware,
        getPostByIdController
    )


router.route('/:id/comments')
    .get(
        idPostValidator,
        errorMiddleware,
        getAllCommentsByPostIdController
    )
    .post(
        authMiddlewareWithBearer,
        idPostValidator,
        contentCommentValidator,
        errorMiddleware,
        createCommentByPostIdWithParamsController
    )


export default router
