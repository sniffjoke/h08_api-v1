import {SETTINGS} from "../settings";
import {Collection, Db, MongoClient, WithId} from "mongodb";
import {BlogDBType} from "../dtos/blogs.dto";
import {PostDBType} from "../dtos/posts.dto";
import {UserDBType} from "../dtos/users.dto";
import {CommentDBType} from "../dtos/comments.dto";
import {Blog} from "../types/blogs.interface";
import {Post} from "../types/posts.interface";
import {IComment} from "../types/comments.interface";

export const client: MongoClient = new MongoClient(SETTINGS.PATH.MONGODB as string) as MongoClient;
export const db: Db = client.db(SETTINGS.VARIABLES.DB_NAME);

// получение доступа к коллекциям
export const blogCollection: Collection<Blog> = db.collection<Blog>(SETTINGS.VARIABLES.BLOG_COLLECTION_NAME)
export const postCollection: Collection<Post> = db.collection<Post>(SETTINGS.VARIABLES.POST_COLLECTION_NAME)
export const userCollection: Collection<UserDBType> = db.collection<UserDBType>(SETTINGS.VARIABLES.USER_COLLECTION_NAME)
export const commentCollection: Collection<IComment> = db.collection<IComment>(SETTINGS.VARIABLES.COMMENT_COLLECTION_NAME)

// проверка подключения к бд
export const connectToDB = async () => {
    try {
        await client.connect()
        console.log('connected to db')
        return true
    } catch (e) {
        console.log(e)
        await client.close()
        return false
    }
}
