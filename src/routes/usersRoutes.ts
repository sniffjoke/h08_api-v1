import express from "express";
import {createUserController, deleteUserByIdController, getUsersController} from "../controllers/usersController";
import {idUserValidator} from "../middlewares/authValidators";
import {errorMiddleware} from "../middlewares/errorMiddleware";
import {authMiddleware} from "../middlewares/authMiddleware";
import {emailUserValidator, loginUserValidator, passwordUserValidator} from "../middlewares/usersValidators";


const router = express.Router();

router.route('/')
    .get(getUsersController)
    .post(
        authMiddleware,
        loginUserValidator,
        emailUserValidator,
        passwordUserValidator,
        errorMiddleware,
        createUserController
    );
router.route('/:id')
    .delete(
        authMiddleware,
        idUserValidator,
        errorMiddleware,
        deleteUserByIdController
    )

export default router
