import {NextFunction, Request, Response} from 'express';
import {EmailConfirmationModel, usersRepository} from "../repositories/usersRepository";
import {usersQueryHelper} from "../helpers/usersHelper";
import {usersQueryRepository} from "../queryRepositories/usersQueryRepository";
import {UserDBType} from "../dtos/users.dto";
import * as bcrypt from "bcrypt";
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

export const getUserByIdController = async (req: Request, res: Response) => {
    const id = req.params.id
    const user = await usersQueryRepository.userOutput(id)
    res.status(200).json(user)
}

export const createUserController = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {login, email, password} = req.body
        await userService.userExists(email, login)
        const emailConfirmation: EmailConfirmationModel = {
            isConfirmed: true
        }
        const hashPassword = await bcrypt.hash(password, 3)
        const userData: UserDBType = {login, email, password: hashPassword}
        const newUserId = await usersRepository.createUser(userData, emailConfirmation)
        const newUser = await usersQueryRepository.userOutput(newUserId.toString())
        res.status(201).json(newUser)
    } catch (e) {
        // res.status(500).send(e)
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
