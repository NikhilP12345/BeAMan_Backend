import { Transport } from "@nestjs/microservices";

export default () => ({
  port: 6000,
  database: {
    // TODO
    url: 'mongodb+srv://testLocalisation:D7okWQhKvGezODGF@test-central.ptlxu.mongodb.net/localisation?retryWrites=true&w=majority',
  },
  redis: {
    port: 6379, // Redis port
    host: '34.93.100.217', // Redis host
    password:
      'I02ED3YSwAsYGQCyYxQTuQvR1NrVFXnGS59zbRY8FMBQ1FK2e6VhBLw4WWHtOX1b0ZCcfOvno1zqGN7', // redis password
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
  amqpUrl: 'amqp://test:HJ95N7Yc7e6hyNpx@104.211.95.49:5672/',
  completeByPassUrls: ['hello'],
});
