import {ApiErrorConfig} from "./errors";

class ApiError extends Error {
    public statusCode;
    public error;
    public details;
    public event;


    constructor(error: ApiErrorConfig) {
        super(error.message);
        this.error = error.message;
        this.details = error.details;
        this.statusCode = error.code;
        this.event = error.event;
    }
}

export {ApiError};