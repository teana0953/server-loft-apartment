import * as dotenv from "dotenv";

let envPath: string = './.env.dev';

if (process.env.NODE_ENV === "production") {
    envPath = './.env';
}

const config: dotenv.DotenvConfigOutput = dotenv.config({
    path: envPath,
});
