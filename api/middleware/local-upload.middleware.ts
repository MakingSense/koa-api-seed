import {promisify} from "bluebird";
import * as fs from "fs";

import config from "../../configs/config";

// Promisify callback functions
let fsRename = promisify(fs.rename);

export default function getLocalUploadMiddleware(resource) {
    let { base, field } = config.uploads[resource];
    let destPath = config.uploads.base + base;

    return async function localUploadMiddleware(ctx, next) {
        let sourceFile = ctx.request.body.files[field];
        let filePath = `${destPath}/${ctx.state.fileName}`;

        await fsRename(sourceFile.path, config.uploads.local.path + filePath);

        ctx.state.fileUrl = config.uploads.local.host + filePath;

        await next();
    };
}
