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
import {authMiddlewareWithBasic} from "../middlewares/authMiddlewareWithBasic";
import {authMiddlewareWithBearer} from "../middlewares/authMiddlewareWithBearer"
import {createCommentByPostIdWithParamsController, getAllCommentsByPostIdController} from "../controllers/commentsController";
import {contentCommentValidator} from "../middlewares/commentsValidators";


const router = express.Router();

router.route('/')
    .get(getPostsController)
    .post(
        authMiddlewareWithBasic,
        titlePostValidator,
        contentPostValidator,
        blogIdValidator,
        shortDescriptionPostValidator,
        errorMiddleware,
        createPostController
    );

router.route('/:id')
    .put(
        authMiddlewareWithBasic,
        idPostValidator,
        titlePostValidator,
        contentPostValidator,
        blogIdValidator,
        shortDescriptionPostValidator,
        errorMiddleware,
        updatePostController
    )
    .delete(
        authMiddlewareWithBasic,
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
