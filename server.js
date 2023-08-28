import Fastify from 'fastify'
const fastify = Fastify({
  logger: true,
  bodyLimit: 104857600
})
import {SERVER_PORT} from './js/config.js';
import fastify_formbody from '@fastify/formbody';
import fastify_multipart from '@fastify/multipart';
import fastify_cors from '@fastify/cors';

import {maple} from './routes/maple.js';

fastify.register(maple);

// 맨 마지막에 실행.
fastify.register(fastify_multipart, { attachFieldsToBody: true });
fastify.register(fastify_formbody);
fastify.register(fastify_cors,{ origin:true });

// Declare a route
fastify.get('/', async (request, reply) => {
    return { hello: 'world' }
});

// Run the server!
const start = async () => {
    try {
        await fastify.listen({ host: '0.0.0.0', port: SERVER_PORT })
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    } finally {
        // 종료할때 실행되는지 확인.
    }
};

start();
