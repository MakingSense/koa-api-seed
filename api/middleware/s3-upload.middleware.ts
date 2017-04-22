import {promisify} from "bluebird";
import {S3, Credentials} from "aws-sdk";
import * as fs from "fs";
import * as mime from "mime-types";

import config from "../../configs/config";

let s3Options: any = {
    apiVersion: config.uploads.s3.version,
    region: config.uploads.s3.region
};

if (!config.uploads.s3.omitCredentials) {
    // Credentials can be configured on the instance, either by
    // using a IAM role or by setting the ~/.aws/credentials file
    let credentials = new Credentials({
        accessKeyId: config.uploads.s3.accessKey,
        secretAccessKey: config.uploads.s3.secretKey
    });
    s3Options.credentials = credentials;
}

let s3 = new S3(s3Options);

export default function getS3UploadMiddleware(resource) {

    let bucket = config.uploads[resource].bucket || config.uploads.s3.bucket;

    let {field} = config.uploads[resource];

    return async function s3UploadMiddleware(ctx, next) {
        let sourceFile = ctx.request.body.files[field];
        let fileKey = config.uploads[resource].prefix + ctx.state.fileName;
        let mimeType = mime.lookup(ctx.state.fileName);

        let uploadData = await s3.upload({
            Body: fs.createReadStream(sourceFile.path),
            Key: fileKey,
            ContentType: mimeType,
            ACL: "public-read",
            Bucket: bucket
        }).promise();

        ctx.state.fileUrl = uploadData.Location;

        await next();
    };
}
