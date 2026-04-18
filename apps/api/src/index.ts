import { Hono } from 'hono';
import { usersApp } from './routes/users';
import type { Env, Variables } from './types';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.get('/', (c) => c.text('Hello Cloudflare Workers!'));

app.route('/users', usersApp);

export default app;
