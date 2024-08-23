export interface User {
    login: string;
    email: string;
    password: string;
    createdAt: string;
    emailConfirmation: {
        confirmationCode?: string
        expirationDate?: string
        isConfirmed: boolean
    }
}
