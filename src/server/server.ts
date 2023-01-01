import express, { Request, Response } from 'express';
import path from 'path';
import morgan from 'morgan';
import { ServerError } from '../types';
import apiRouter from './routes/apiRouter';
import session from 'express-session';
import { createClient } from 'redis';
export type RedisClientType = ReturnType<typeof createClient>

import connect_redis from 'connect-redis';

const PORT = Number(process.env.PORT) || 3000;
const REDIS_URL = process.env.REDIS_URL;

const redisStore = connect_redis(session);
const redisClient = createClient({
  socket: { host: REDIS_URL, port: 6379 },
  legacyMode: true,
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

redisClient.connect()
  .then(() => console.log('Connected to Redis'));

redisClient.on('error', (err) => {
  console.log('Redis error: ERR: ', err);
});

redisClient.on('connect', () => {
  console.log('Connected to Redis successfully');
});

app.use(session({
  secret: 'secret-key',
  name:'Redis sessionID',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60, // 1 minute
  },
  store: new redisStore({
    host: REDIS_URL,
    port: 6379,
    // @ts-expect-error because wrong type definitions of connect-redis
    client: redisClient,
  })
}));

app.use(morgan('tiny'));

// condition: NODE_ENV is production, serve static files
if(process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.join(__dirname, '../../dist')));
}

// serve routes
app.use('/api', apiRouter);

// Is this redundant? Webpack dev server proxy pointed to root is redundant?
app.use('/*', (req, res) => {
  console.log('refreshing page or visting server route other than root endpoint');
  return res.status(200).sendFile(path.resolve(__dirname, '../../dist/index.html'));
});


// 404 handler
app.use('*', (req: Request, res: Response) => {
  console.log('Error: Client attempted access to unknown route!');
  return res.status(404).sendFile(path.resolve(__dirname, '../client/404error.html'));
});

// global error handler
app.use('/', (err: ServerError, req: Request, res: Response) => {
  const defaultErr: ServerError = {
    log: 'Express error handler caught unknown middleware error',
    status: 400,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

app.listen(PORT, () => console.log(`Server is listening on PORT ${PORT}`));