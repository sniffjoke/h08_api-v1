import express from "express";
import {testingController} from "../controllers/testingController";

const router = express.Router();

router.route('/')
    .delete(
        testingController
    )

export default router;
