import { UserMutationResponse } from "../types/UserMuationRepsonse";

export const validatePasswordInput = (password: string, fieldName: string = 'password') :  (UserMutationResponse | null) => {
    const regexPassword = new RegExp(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/);
    if(!regexPassword.test(password))
    return {
        code: 400,
        success: false,
        message: 'Invalid password',
        errors: [
            {
                field: fieldName,
                message: 'Password must contain minimum eight characters, at least one uppercase letter, at least one lowercase letter, at least one number and one special character'
            }
        ]
    }
    return null;
}

export const validateConfirmPasswordInput = (newPassword: string, confirmPassword: string) : (UserMutationResponse | null) => {
    if(confirmPassword !== newPassword)
    return {
        code: 400,
        success: false,
        message: 'Confirm Password',
        errors: [
            {
                field: 'confirmPassword',
                message: 'Password must be same'
            }
        ]
    }
    return null;
}