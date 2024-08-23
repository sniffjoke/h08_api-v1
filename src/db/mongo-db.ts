import {SETTINGS} from "../settings";
import {Collection, Db, MongoClient} from "mongodb";
import {Blog} from "../types/blogs.interface";
import {Post} from "../types/posts.interface";
import {IComment} from "../types/comments.interface";
import {User} from "../types/users.interface";
import {RTokenDB} from "../types/tokens.interface";

export const client: MongoClient = new MongoClient(SETTINGS.PATH.MONGODB as string) as MongoClient;
export const db: Db = client.db(SETTINGS.VARIABLES.DB_NAME);

// получение доступа к коллекциям
export const blogCollection: Collection<Blog> = db.collection<Blog>(SETTINGS.VARIABLES.BLOG_COLLECTION_NAME)
export const postCollection: Collection<Post> = db.collection<Post>(SETTINGS.VARIABLES.POST_COLLECTION_NAME)
export const userCollection: Collection<User> = db.collection<User>(SETTINGS.VARIABLES.USER_COLLECTION_NAME)
export const commentCollection: Collection<IComment> = db.collection<IComment>(SETTINGS.VARIABLES.COMMENT_COLLECTION_NAME)
export const tokenCollection: Collection<RTokenDB> = db.collection<RTokenDB>(SETTINGS.VARIABLES.TOKEN_COLLECTION_NAME)

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
