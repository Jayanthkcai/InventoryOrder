import { Kafka } from 'kafkajs';

const kafka = new Kafka({
  clientId: 'microservices',
  brokers: [process.env.KAFKA_BROKER],
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'microservices-group' });

export { producer, consumer };
