import * as path from 'path';

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
        enabled: typeof (process.env.WEBSOCKETS_ENABLED) === "undefined" ? true : process.env.USE_COMPRESSION === "true",
        useAdapter:  process.env.WEBSOCKETS_USE_ADAPTER === "true"
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
            unit: process.env.FORGOT_PASSWORD_DURATION_UNIT || 'days',
        }
    },

    emails: {
        from: 'gabrielemanuel@gmail.com',
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
            errors: process.env.LOG_FILE_ERRORS || path.join(__dirname, '../logs/errors.log'),
            all: process.env.LOG_FILE_ALL || path.join(__dirname, '../logs/all.log'),
            events: process.env.LOG_FILE_EVENTS || path.join(__dirname, '../logs/events.log'),
        },
        levels: {
            console: process.env.LOG_LEVELS_CONSOLE || 'info',
            file: process.env.LOG_LEVELS_FILE || 'info'
        }
    },

    toggles: {
        emails: process.env.TOGGLE_EMAILS
    },

    iterations: Number(process.env.PASSWORD_ITERATIONS) || 1

};

function checkConfigsAreSet(config, previousKey = '') {
    Object.keys(config).forEach(key => {
        if (typeof config[key] === "object") {
            return checkConfigsAreSet(config[key], `${previousKey ? previousKey + '.' : ''}${key}`)
        }
        if (!config[key]) { // value has not been set
            console.warn(`WARNING: ${previousKey ? previousKey + '.' : ''}${key} is NOT set.`)
        }
    });
}

checkConfigsAreSet(config);

export default config;