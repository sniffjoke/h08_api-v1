import {hash} from "bcrypt";


export const cryptoService = {
    async hashPassword(password: string): Promise<string> {
        const hashPassword = await hash(password, 3)
        return hashPassword
    }
}
