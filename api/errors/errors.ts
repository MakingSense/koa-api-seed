interface ApiErrorConfig {
    message: string,
    details?: string,
    code: number
}

const errors = {
    auth: {
        no_credentials: {
            message: 'NO_CREDENTIALS_IN_BODY',
            log: 'The body of the request must not be empty.',
            code: 400,
        },
        no_password: {
            message: 'NO_PASSWORD_PROVIDED',
            log: 'The body of the request must contain a "password" field.',
            code: 400,
        },
        no_username: {
            message: 'NO_USERNAME_PROVIDED',
            log: 'The body of the request must contain an "email" field.',
            code: 400,
        }
    },
    users: {
        username_taken: {
            message: 'USERNAME_TAKEN',
            log: 'The username has already been taken.',
            code: 409,
        },
        email_taken: {
            message: 'EMAIL_TAKEN',
            log: 'A user with this email already exists.',
            code: 409,
        },
        emails_mismatch: {
            message: 'EMAILS_MISMATCH',
            log: 'The emails provided don\'t match.',
            code: 400,
        },
        invalid_forgot_password_code: {
            message: 'INVALID_FORGOT_PASSWORD_CODE',
            log: 'The invitation code does not exist or is not valid anymore',
            code: 400,
        },
        bad_emails: {
            message: 'BAD_EMAILS',
            log: 'The email provided is not a valid email.',
            code: 400,
        },
        not_found: {
            message: 'USER_NOT_FOUND',
            log: 'User could not be found.',
            code: 404,
        },
        user_deleted: {
            message: 'USER_HAS_BEEN_DELETED',
            log: 'The user has been deleted.',
            code: 403,
        },
    },
    generic: {
        internal_server_error: {
            message: 'INTERNAL_SERVER_ERROR',
            log: 'The server experienced an internal error.',
            code: 500,
        },
        unauthorized: {
            message: 'UNAUTHORIZED',
            log: 'Not authorized to access this resource.',
            code: 403,
        },
        unauthenticated: {
            message: 'UNAUTHENTICATED',
            log: 'Accessing this resource requires an authenticated user.',
            code: 401,
        },
        empty_request: {
            message: 'EMPTY_REQUEST',
            log: 'The request cannot be empty',
            code: 400,
        },
        not_found: {
            message: 'RESOURCE_NOT_FOUND',
            log: 'The Resource could not be found.',
            code: 404,
        }
    },

};

export {errors, ApiErrorConfig};