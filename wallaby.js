module.exports = function(wallaby) {
    return {
        // debug: true,
        files: [
            {pattern: "api/shared/email.service.ts", instrument: false, load: true}, //do not include this in coverage cause we don't send emails during tests
            {pattern: "api/shared/logger.service.ts", instrument: false, load: true}, //do not include this in coverage cause we don't send emails during tests
            {pattern: "db.config.ts", instrument: false, load: true}, //do not include this in coverage cause we don't send emails during tests
            "!api/**/*.spec.ts",
            "!api/**/*.e2e.ts",
            "!gulpfile*",
            "!**/*.sample.ts",
            "api/**/*.ts",
            "configs/**/*.ts",
            "*.ts",
            "temp/",
            "**/*.jpg",
            "logs/**/*.log",
            ".env",
        ],
        env: {
            type: 'node',
            params: {
                env: 'NODE_ENV=test'
            }
        },
        tests: [
            'api/**/*.spec.ts'
        ],
        compilers: {
            '**/*.ts?(x)': wallaby.compilers.typeScript({
                "experimentalDecorators": true,
                "emitDecoratorMetadata": true,
                "module": "commonjs",
                "outDir": "build",
                "target": "es6"
            })
        },
        testFramework: 'mocha',

        workers: {
            recycle: false
        },
        bootstrap: function(wallaby) {
            function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            require('dotenv').config({silent: true});
            process.env.USER_UPLOADS_SIZE_LIMIT = 50 * 1024; // 50KB
            process.env.UPLOADS_TEMP = "/opt/api-seed/temp";
            process.env.UPLOADS_LOCAL_PATH = "/opt/api-seed";
            process.env.SENSOR_DEFAULT_IMAGE = "asd.png";

            let mongoose = require('mongoose');
            mongoose.models = {};
            mongoose.modelSchemas = {};

            // DB setup code
            let config = require('./configs/config').default;
            config.db.url = config.db.url + '-' + wallaby.workerId;
            // set up port for each process
            config.port = getRandomInt(1001, 50000); // ensure port used is above 1000 (restricted ports)
            config.test.url = `http://localhost:${config.port}`; // ensure port used is above 1000 (restricted ports)
        },
        teardown: function(wallaby) {
            let mongoose = require('mongoose');
            mongoose.connection.close();
        }
    };
};
