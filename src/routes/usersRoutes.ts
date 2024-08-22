import express from "express";
import {createUserController, deleteUserByIdController, getUsersController} from "../controllers/usersController";
import {idUserValidator} from "../middlewares/authValidators";
import {errorMiddleware} from "../middlewares/errorMiddleware";
import {authMiddlewareWithBasic} from "../middlewares/authMiddlewareWithBasic";
import {emailUserValidator, loginUserValidator, passwordUserValidator} from "../middlewares/usersValidators";


const router = express.Router();

router.route('/')
    .get(getUsersController)
    .post(
        authMiddlewareWithBasic,
        loginUserValidator,
        emailUserValidator,
        passwordUserValidator,
        errorMiddleware,
        createUserController
    );
router.route('/:id')
    .delete(
        authMiddlewareWithBasic,
        idUserValidator,
        errorMiddleware,
        deleteUserByIdController
    )

export default router
