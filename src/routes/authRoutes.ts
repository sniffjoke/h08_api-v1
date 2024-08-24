import express from "express";
import {
    activateEmailUserController,
    getMeController,
    loginController, refreshTokenController,
    registerController, removeRefreshTokenController, resendEmailController
} from "../controllers/authController";
import {errorMiddleware} from "../middlewares/errorMiddleware";
import {authMiddlewareWithBearer} from "../middlewares/authMiddlewareWithBearer"
import {
    emailAuthRegisterValidator,
    loginAuthRegisterValidator,
    passwordAuthRegisterValidator
} from "../middlewares/authValidators";
import {errorCustomApiMiddleware} from "../middlewares/errorApiMiddleware";


const router = express.Router();

router.route('/login')
    .post(
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
        resendEmailController
    );


router.route('/me')
    .get(
        authMiddlewareWithBearer,
        getMeController
    );

router.route('/refresh-token')
    .post(
        refreshTokenController
    )

router.route('/logout')
    .post(
        removeRefreshTokenController
    )

export default router
