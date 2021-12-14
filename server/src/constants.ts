export const COOKIE_NAME = 'meta-x-cookie';
export const __prod__ = process.env.NODE_ENV === 'production'

export const PASSWORD_FIELD_NAME = {
    password: 'password',
    old: 'oldPassword',
    new: 'newPassword',
    confirm: 'confirmPassword'
}

export enum IsChangePassword {
    No = "0",
    Yes = "1",
}

export const emailRegexp = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/