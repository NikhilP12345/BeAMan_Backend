import { Transport } from "@nestjs/microservices";

export default () => ({
  port: 3000,
  database: {
    // TODO
    url: 'mongodb+srv://foManagement:Lwgc5U28HX1PdtI3@fieldops.3iicz.mongodb.net/fieldops?retryWrites=true&w=majority',
  },
  redis: {
    port: 6379, // Redis port
    host: '35.200.151.58', // Redis host
    password: 'wUzFP7Bi', // redis password
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
  amqpUrl:
    'amqp://tech:bIX3KgugzsnTdv2L23e9ZByDZxH6Qe6H@rabbitmq.letstransport.in:5672/',
  completeByPassUrls: ['hello'],
});
