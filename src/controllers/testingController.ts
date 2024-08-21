import {Request, Response} from 'express';
import {testingRepository} from "../repositories/testingRepository";


export const testingController = async (req: Request, res: Response) => {
    await testingRepository.deleteAll()
    res.status(204).send('База очищена')
}
