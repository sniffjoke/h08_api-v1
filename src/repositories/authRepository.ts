import {LoginUserDto} from "../dtos/login.dto";


export const authRepository = {

    async login(loginDto: LoginUserDto): Promise<any> {
        return loginDto
    }

}
