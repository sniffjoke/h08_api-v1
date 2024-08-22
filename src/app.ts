import express from "express";
import cors from "cors";
import {SETTINGS} from "./settings";
import {connectToDB} from "./db/mongo-db";
import blogsRoutes from "./routes/blogsRoutes";
import postsRoutes from "./routes/postsRoutes";
import testingRoutes from "./routes/testingRoutes";
import usersRoutes from "./routes/usersRoutes";
import authRoutes from "./routes/authRoutes";
import commentsRoutes from "./routes/commentsRoutes";
import {errorCustomApiMiddleware} from "./middlewares/errorApiMiddleware";

connectToDB()

export const app = express()
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {

    res.status(200).json({version: '1.0'})

})

app.use(SETTINGS.PATH.BLOGS, blogsRoutes)
app.use(SETTINGS.PATH.BLOGS + '/posts', blogsRoutes)
app.use(SETTINGS.PATH.POSTS, postsRoutes)
app.use(SETTINGS.PATH.POSTS + '/comments', postsRoutes)
app.use(SETTINGS.PATH.COMMENTS, commentsRoutes)
app.use(SETTINGS.PATH.USERS, usersRoutes)
app.use(SETTINGS.PATH.AUTH, authRoutes)
app.use(SETTINGS.PATH.TESTING, testingRoutes)
app.use(errorCustomApiMiddleware)
