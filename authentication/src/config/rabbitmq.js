import envVal from "./envload.js"; // Load environment variables

const result = envVal;

import amqp from "amqplib";

async function createChannel() {
  const connection = await amqp.connect(process.env.RABBITMQ_URL);
  return connection.createChannel();
}

export default createChannel;
