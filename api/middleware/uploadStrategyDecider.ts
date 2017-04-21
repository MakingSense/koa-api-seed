import getLocalUploadMiddleware from "./local-upload.middleware";
import getS3UploadMiddleware from "./s3-upload.middleware";

import config from "../../configs/config";

export default function getUploadStrategy(resource) {
    if (config.uploads.strategy === "local") {
        return getLocalUploadMiddleware(resource);
    } else if (config.uploads.strategy === "s3") {
        return getS3UploadMiddleware(resource);
    }
}
