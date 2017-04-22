import * as bodyParser from "koa-body";
import * as path from "path";
import * as fs from "fs";
import {promisify} from "bluebird";
import * as crypto from "crypto";
import * as base64url from "base64-url";
import {Magic, MAGIC_MIME_TYPE} from "mmmagic";
import * as mime from "mime-types";
import * as _ from "lodash";

import config from "../../configs/config";
import {ApiError} from "../errors/api-error.errors";
import {errors} from "../errors/errors";

let magic = new Magic(MAGIC_MIME_TYPE);

// Promisify callback functions
let fsRename = promisify(fs.rename);
let magicDetect = promisify(magic.detectFile, {
    context: magic
});

// Creates the body parser that will take care of
// copying the file into a temporary dir. It only
// accepts multipart requests and will ignore
// any non-file param
let getMultipartParser = function (resource) {
    return bodyParser({
        multipart: true,
        urlencoded: false,
        text: false,
        json: false,
        formidable: {
            multiples: false,
            // TODO: None of these two options work to limit file size
            bytesExpected: config.uploads[resource].sizeLimit,
            maxFieldsSize: config.uploads[resource].sizeLimit,
            uploadDir: config.uploads.temp
        }
    });
};

// Creates a middleware that will validate the uploaded
// file and move it into its final destination
let getUploadValidationMiddleware = function (resource) {
    let {field, base, allowedTypes, sizeLimit} = config.uploads[resource];
    let destPath = config.uploads.base + base;

    return async function uploadValidationMiddleware(ctx, next) {
        // Check if file exists
        let sourceFile = ctx.request.body.files[field];
        if (!sourceFile) {
            throw new ApiError(errors.upload.field_not_found);
        }

        // Check if file does not exceed max allowed size
        // TODO: This is wrong, uploading of the file should
        // be cancelled if the file size is invalid during
        // the parsing of the body, but it seems that
        // node-formidable does not support that out of the box
        if (sourceFile.size > sizeLimit) {
            throw new ApiError(errors.upload.file_too_large);
        }

        // Check if mime type is allowed
        let mimeType = await magicDetect(sourceFile.path);
        if (_.indexOf(allowedTypes, mimeType) === -1) {
            throw new ApiError(errors.upload.invalid_mime_type);
        }

        // Add proper extension
        let extension = mime.extension(mimeType);

        // Create a random name and leave it for the next middleware
        let fileHash = base64url.encode(crypto.randomBytes(32));

        ctx.state.fileName = `${fileHash}.${extension}`;

        await next();
    };
};

export {getMultipartParser, getUploadValidationMiddleware};
