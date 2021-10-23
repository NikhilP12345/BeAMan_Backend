import { Transport } from "@nestjs/microservices";

export default () => ({
  port: 3000,
  database: {
    url: 'mongodb+srv://devLocalisation:GIV5gCoUufpihyGW@dev-central.qvkeu.mongodb.net/localisation?retryWrites=true&w=majority',
  },
  redis: {
    port: 6379, // Redis port
    host: '104.155.238.118', // Redis host
    password: 'socketManagement', // redis password
  },
  rabbitmq: {
    transport: Transport.RMQ,
    options:{
      urls: ['amqps://taikxpxs:sv6t-qeUMlEp2DVJqSFc5gu1he-hs1nb@puffin.rmq2.cloudamqp.com/taikxpxs'],
      queue: 'translation_queue',
      noAck: false,
      queueOptions: {
        durable: false
      }
    }
  },
  amqpUrl: 'amqp://dev:8q3hLTENfc3f4sWU@40.71.177.114:5672/',
  completeByPassUrls: ['hello'],
});
