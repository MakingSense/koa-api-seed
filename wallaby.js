module.exports = function (wallaby) {
  return {
    // debug: true,
    files: [
      {pattern: 'api/shared/email.service.ts', instrument: false, load: true}, //do not include this in coverage cause we don't send emails during tests
      {pattern: 'api/shared/logger.service.ts', instrument: false, load: true}, //do not include this in coverage cause we don't send emails during tests
      {pattern: 'db.config.ts', instrument: false, load: true}, //do not include this in coverage cause we don't send emails during tests
      '!api/**/*.spec.ts',
      '!gulpfile*',
      '!**/*.sample.ts',
      'api/**/*.ts',
      'configs/**/*.ts',
      '*.ts',
      'logs/**/*.log',
      '.env',
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
    bootstrap: function (wallaby) {
      function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
      }
      require('dotenv').config({silent: true});

      var mongoose = require('mongoose');
      mongoose.models = {};
      mongoose.modelSchemas = {};

      // DB setup code
      var config = require('./configs/config').default;
      config.db.url = config.db.url + '-' + wallaby.workerId;
      // set up port for each process
      config.port = getRandomInt(1001, 50000); // ensure port used is above 1000 (restricted ports)
      config.test.url = `http://localhost:${config.port}`; // ensure port used is above 1000 (restricted ports)
    },
    teardown: function (wallaby) {
      var mongoose = require('mongoose');
      mongoose.connection.close();
    }
  };
};
