require('dotenv').config();
import 'reflect-metadata';
import express from 'express';
import {createConnection} from 'typeorm';
import { User } from './entities/User';
import { ApolloServer } from 'apollo-server-express';
import { UserResolver } from './resolvers/user';
import { buildSchema } from 'type-graphql';
import { ApolloServerPluginLandingPageGraphQLPlayground } from 'apollo-server-core';
import mongoose from 'mongoose';
import session from 'express-session';
import { COOKIE_NAME, __prod__ } from './constants';
import MongoStore from 'connect-mongo';
import { Context } from './types/Context';
import cors from 'cors';
import { OauthAccount } from './entities/OauthAccount';
import path from 'path';

const main = async () => {
    const connection = await createConnection({
        type: 'postgres',
        ...(__prod__
			? { url: process.env.DATABASE_URL }
			: {
					database: 'meta-x',
					username: process.env.DB_USERNAME_DEV,
					password: process.env.DB_PASSWORD_DEV
			  }),
		logging: true,
		...(__prod__
			? {
					extra: {
						ssl: {
							rejectUnauthorized: false
						}
					},
					ssl: true
			  }
			: {}),
		...(__prod__ ? {} : { synchronize: true }),
        entities: [User, OauthAccount],
        migrations: [path.join(__dirname, '/migrations/*')]
    });

    if (__prod__) await connection.runMigrations()

    const app = express();

    app.use(cors({
        origin: __prod__
            ? process.env.CORS_ORIGIN_PROD
            : process.env.CORS_ORIGIN_DEV,
        credentials: true
    }));

    //Session/Cookie store
    const mongoUrl = `mongodb+srv://${process.env.SESSION_DB_USERNAME_DEV_PROD}:${process.env.SESSION_DB_PASSWORD_DEV_PROD}@meta-x-cluster.sl2k2.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    await mongoose.connect(mongoUrl);
    console.log("Mongo connected");

    app.set('trust proxy', 1)

    app.use(session({
        name: COOKIE_NAME,
        store: MongoStore.create({ mongoUrl }),
        cookie: {
            maxAge: 1000 * 60 * 60,
            httpOnly: true,
            secure: __prod__,
            sameSite: 'none'
        },
        secret: process.env.SESSION_SECRET_DEV_PROD as string,
        saveUninitialized: false,
        resave: false
    }));

    const apolloServer = new ApolloServer({
        schema: await buildSchema({ 
            resolvers: [
                UserResolver
            ], 
            validate: false,
        }),
        context: ({ req, res }): Context => ({ 
            req, 
            res,
            connection
        }),
        plugins: [ApolloServerPluginLandingPageGraphQLPlayground()]
    });

    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });

    const PORT = process.env.PORT || 2101;
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}. GraphQL started on port ${PORT}${apolloServer.graphqlPath}.`))
}

main().catch(err => console.log(err));