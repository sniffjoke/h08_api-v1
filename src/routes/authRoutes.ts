import express from "express";
import {
    activateEmailUserController,
    getMeController,
    loginController, refreshTokenController,
    registerController, logoutController, resendEmailController
} from "../controllers/authController";
import {errorMiddleware} from "../middlewares/errorMiddleware";
import {
    emailAuthRegisterValidator,
    loginAuthRegisterValidator,
    passwordAuthRegisterValidator
} from "../middlewares/authValidators";


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
        getMeController
    );

router.route('/refresh-token')
    .post(
        refreshTokenController
    )

router.route('/logout')
    .post(
        logoutController
    )

export default router
