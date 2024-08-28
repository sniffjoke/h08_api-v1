import {NextFunction, Request, Response} from 'express';
import {usersRepository} from "../repositories/usersRepository";
import {usersQueryHelper} from "../helpers/usersHelper";
import {usersQueryRepository} from "../queryRepositories/usersQueryRepository";
import {userService} from "../services/user.service";


export const getUsersController = async (req: Request<any, any, any, any>, res: Response) => {
    const usersQuery = await usersQueryHelper(req.query)
    const users = await usersQueryRepository.getAllUsersWithQuery(usersQuery)
    const {
        pageSize,
        pagesCount,
        totalCount,
        page
    } = usersQuery
    res.status(200).json({
        pageSize,
        pagesCount,
        totalCount,
        page,
        items: users
    })
}

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {login, email, password} = req.body
        const newUser = await userService.createUser({login, email, password}, true)
        res.status(201).json(newUser)
    } catch (e) {
        next(e)
    }
}

export const deleteUserByIdController = async (req: Request, res: Response) => {
    try {
        const id = req.params.id
        await usersRepository.deleteUser(id)
        res.status(204).send('Удалено');
    } catch (e) {
        res.status(500).send(e)
    }
}
