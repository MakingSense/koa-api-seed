import {ApiErrorConfig} from "./errors";

class ApiError extends Error {
    public statusCode;
    public error;
    public details;

    constructor(error: ApiErrorConfig) {
        super(error.message);
        this.error = error.message;
        this.details = error.details;
        this.statusCode = error.code;
    }
}

export {ApiError};