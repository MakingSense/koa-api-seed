"use strict";

import * as winston from "winston";
import "le_node";
import config from "../../configs/config";
let logger;

var logLevels = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        verbose: 3,
        debug: 4,
        silly: 5
    },
    colors: {
        error: "red",
        warn: "yellow",
        info: "cyan",
        verbose: "black",
        debug: "green",
        silly: "black"
    }
};

winston.setLevels(logLevels.levels);
winston.addColors(logLevels.colors);

if (config.env === "test") {
    logger = new (winston.Logger)({
        transports: [
            new (winston.transports.File)({filename: config.logs.files.all})
        ]
    });
    logger.stream = {
        write: function (message, encoding) {
            logger.info(message.slice(0, -1));
        }
    };
} else {
    let transports = [
        new winston.transports.Logentries({
            level: config.logs.logentries.level,
            token: config.logs.logentries.token,
            tags: [config.env],
            json: true
        }),
        new winston.transports.Console({colorize: true, level: config.logs.levels.console, timestamp: true}),
        new winston.transports.File({
            name: "errorLog",
            colorize: true,
            timestamp: true,
            level: "error",
            maxsize: 2097152 /* 2MB */,
            maxFiles: 7,
            filename: config.logs.files.errors,
            handleExceptions: true
        }),
        new winston.transports.File({
            name: "everythingLog",
            colorize: true,
            timestamp: true,
            level: config.logs.levels.file,
            maxsize: 2097152 /* 2MB */,
            maxFiles: 5,
            filename: config.logs.files.all
        }),
        new winston.transports.File({
            name: "eventLog",
            colorize: true,
            timestamp: true,
            level: "event",
            maxsize: 2097152 /* 2MB */,
            maxFiles: 3,
            filename: config.logs.files.events
        })
    ], exceptionHandlers = [
        new winston.transports.Logentries({
            level: config.logs.logentries.level,
            token: config.logs.logentries.token,
            tags: [config.env],
            json: true
        }),
        new winston.transports.Console({colorize: true, timestamp: true, level: config.logs.levels.console})
    ];
    logger = new (winston.Logger)({
        levels: logLevels.levels,
        transports: transports,
        exceptionHandlers: exceptionHandlers,
        exitOnError: false
    });
    logger.info("logger initialized.");
    logger.stream = {
        write: function (message, encoding) {
            logger.info(message.slice(0, -1));
        }
    };
}


export {logger as Logger}

