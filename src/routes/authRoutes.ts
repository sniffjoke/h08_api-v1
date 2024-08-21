import express from "express";
import {
    activateEmailUserController, emailResending,
    getMeController,
    loginController,
    registerController
} from "../controllers/authController";
import {errorMiddleware} from "../middlewares/errorMiddleware";
import {authMiddlewareWithBearer} from "../middlewares/authMiddleware";
import {
    emailAuthRegisterValidator,
    loginAuthRegisterValidator,
    passwordAuthRegisterValidator
} from "../middlewares/authValidators";


const router = express.Router();

router.route('/login')
    .post(
        // loginUserValidator,
        // passwordUserValidator,
        // emailResending,
        errorMiddleware,
        loginController
    );



router.route('/registration')
    .post(
        loginAuthRegisterValidator,
        emailAuthRegisterValidator,
        passwordAuthRegisterValidator,
        errorMiddleware,
        registerController
    );

router.route('/registration-confirmation')
    .post(
        activateEmailUserController
    );

router.route('/registration-email-resending')
    .post(
        emailAuthRegisterValidator,
        emailResending
    );


router.route('/me')
    .get(
        authMiddlewareWithBearer,
        errorMiddleware,
        getMeController
    );

export default router
