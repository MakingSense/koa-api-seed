import config from './configs/config';
import * as mongoose from 'mongoose';

function setupDb(app) {
    mongoose.Promise = global.Promise;
    mongoose.connect(config.db.url);

    mongoose.connection.on('error', function (err) {
            console.error('MongoDB connection error: ', err);
            process.exit(-1);
        }
    );
}

export default setupDb;