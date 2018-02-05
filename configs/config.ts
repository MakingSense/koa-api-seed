import * as path from "path";

let config = {
    env: process.env.NODE_ENV,

    port: process.env.PORT || 3000,

    compression: typeof (process.env.COMPRESSION) === "undefined" ? true : process.env.USE_COMPRESSION === "true",

    db: {
        url: process.env.DATABASE_URL
    },

    redis: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    },

    websockets: {
        enabled: typeof (process.env.WEBSOCKETS_ENABLED) === "undefined" ? true : process.env.WEBSOCKETS_ENABLED === "true",
        useAdapter: process.env.WEBSOCKETS_USE_ADAPTER === "true"
    },

    test: {
        url: process.env.TEST_URL
    },

    jwt: {
        secret: process.env.JWT_SECRET
    },

    facebook: {
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET
    },

    forgotPassword: {
        duration: {
            amount: Number(process.env.FORGOT_PASSWORD_DURATION_AMOUNT) || 1,
            unit: process.env.FORGOT_PASSWORD_DURATION_UNIT || "days",
        }
    },

    auth0: {
        url: process.env.AUTH0_URL || "",
        token: process.env.AUTH0_TOKEN || "",
    },

    emails: {
        from: process.env.EMAIL_FROM,
        sendgrid: {
            apiKey: process.env.EMAIL_API_KEY
        }
    },

    logs: {
        logentries: {
            level: process.env.LOGENTRIES_LEVEL,
            token: process.env.LOGENTRIES_TOKEN,
        },
        files: {
            errors: process.env.LOG_FILE_ERRORS || path.join(__dirname, "../logs/errors.log"),
            all: process.env.LOG_FILE_ALL || path.join(__dirname, "../logs/all.log"),
            events: process.env.LOG_FILE_EVENTS || path.join(__dirname, "../logs/events.log"),
        },
        levels: {
            console: process.env.LOG_LEVELS_CONSOLE || "info",
            file: process.env.LOG_LEVELS_FILE || "info"
        }
    },

    toggles: {
        emails: process.env.TOGGLE_EMAILS
    },

    iterations: Number(process.env.PASSWORD_ITERATIONS) || 1,

    uploads: {
        temp: process.env.UPLOADS_TEMP || path.resolve(__dirname + "/../../temp"),
        base: process.env.UPLOADS_BASE || "/uploads",
        strategy: process.env.UPLOADS_STRATEGY || "local",
        local: {
            path: process.env.UPLOADS_LOCAL_PATH || path.resolve(__dirname + "/../.."),
            host: process.env.UPLOADS_LOCAL_HOST || "http://localhost:3000",
        },
        s3: {
            version: process.env.UPLOADS_S3_API_VERSION || "2006-03-01",
            region: process.env.UPLOADS_S3_REGION || "us-west-2",
            accessKey: process.env.UPLOADS_S3_ACCESS_KEY || "access_key",
            secretKey: process.env.UPLOADS_S3_SECRET_KEY || "access_secret",
            omitCredentials: process.env.UPLOADS_S3_OMIT_CREDENTIALS === "true" || false,
            // Bucket for all assets, can be overriden for each individual resource
            bucket: process.env.UPLOADS_S3_BUCKET || "assets"
        },
        users: {
            base: "/users",
            allowedTypes: process.env.USER_UPLOADS_ALLOWED_TYPES || ["image/jpeg", "image/gif", "image/png"],
            sizeLimit: process.env.USER_UPLOADS_SIZE_LIMIT || 2 * 1024 * 1024, // 2MB
            field: process.env.USER_UPLOADS_FIELD || "image",
            prefix: process.env.USER_UPLOADS_S3_PREFIX || "user-",
            bucket: process.env.USER_UPLOADS_S3_BUCKET
        },
    }

};

function checkConfigsAreSet(config, previousKey = "") {
    Object.keys(config).forEach(key => {
        if (typeof config[key] === "object") {
            return checkConfigsAreSet(config[key], `${previousKey ? previousKey + "." : ""}${key}`)
        }
        if (!config[key]) { // value has not been set
            console.warn(`WARNING: ${previousKey ? previousKey + "." : ""}${key} is NOT set.`)
        }
    });
}

checkConfigsAreSet(config);

export default config;