import createChannel from '../config/rabbitmq.js';

async function publish(event, data) {
  try {

    const channel = await createChannel();
    await channel.assertExchange('rbevents', 'fanout', { durable: false });
    await channel.assertQueue('login', { durable: false });
    await channel.bindQueue('login', 'rbevents', '');
    channel.publish('rbevents', '', Buffer.from(JSON.stringify({ event, data })));
  } catch (error) {
    console.error(`Failed to publish event: ${error.message}`);
  }
}

async function consume() {
  try {
    const channel = await createChannel();
    await channel.assertExchange('rbevents', 'fanout', { durable: false });
    await channel.assertQueue('login', { durable: false });  // Ensure only 'rbqueue' is used
    await channel.bindQueue('login', 'rbevents', '');

    console.log(`Waiting for messages in queue: login`);
    channel.consume('login', (msg) => {
      if (msg !== null) {
        console.log(`Received event: ${msg.content.toString()}`);
        channel.ack(msg);  // Acknowledge the message
      }
    });
  } catch (error) {
    console.error(`Failed to consume messages: ${error.message}`);
  }
}

export default { publish, consume };

