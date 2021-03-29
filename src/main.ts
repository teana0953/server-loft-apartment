import './config';
import * as http from 'http';

import { app } from './app';
import { Utility, MongoDBService } from './helpers';

process.on('uncaughtException', async (err) => {
    let error: Error = err as any;
    console.log(error.name, error.message);
    console.log('unhandled exception, shutting down...');

    Utility.killServer();
});

let server: http.Server = undefined;

const connectMongoDB = async () => {
    MongoDBService.connectionUrl = process.env.DATABASE_URL;
    await MongoDBService.initiation();

    console.log(`app connect to mongodb on \u001b[33m${process.env.DATABASE_URL}\u001b[0m...`);
};

const startServer = async () => {
    let port: number = parseInt(process.env.PORT) || 3000;

    server = app.listen(port, () => {
        console.log();
        console.log(`app running on port \u001b[33m${port}\u001b[0m...`);
        console.log();
    });
};

connectMongoDB();
startServer();

process.on('unhandledRejection', async (err) => {
    let error: Error = err as any;
    console.log(error.name, error.message);
    console.log('unhandled rejection, shutting down...');

    if (server) {
        await server.close();
    }
    Utility.killServer();
});

