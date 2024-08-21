

export interface UserDBType {
    login: string;
    password: string;
    email: string;
    emailConfirmation?: {
        confirmationCode?: string
        expirationDate?: Date
        isConfirmed?: boolean
    }
}
