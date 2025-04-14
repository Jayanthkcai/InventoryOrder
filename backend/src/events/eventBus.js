//import { producer } from "../config/kafka.js";
import createChannel from "../config/rabbitmq.js";
import logger from "../middleware/logger.js";

import invenotryOrderCheck from "../commands/inventory/inventory.service.js";
import inventoryOrderRes from "../commands/order/order.service.js";

async function publish(event, data) {
  try {
    const channel = await createChannel();
    await channel.assertExchange("rbevents", "fanout", {
      durable: false,
    });
    await channel.assertQueue("rbqueue", { durable: false });
    await channel.bindQueue("rbqueue", "rbevents", "");
    channel.publish(
      "rbevents",
      "",
      Buffer.from(JSON.stringify({ event, data }))
    );
  } catch (error) {
    logger.error(`Failed to publish event: ${error.message}`);
  }
}

async function publishOrder(event, data) {
  if (data == "") return;
  logger.info(`Publich order: ${data}`);
  try {
    const channel = await createChannel();
    await channel.assertExchange("rbevents_orders", "fanout", {
      durable: false,
    });
    await channel.assertQueue("rbqueue_orders", { durable: false });
    await channel.bindQueue("rbqueue_orders", "rbevents_orders", "");
    channel.publish(
      "rbevents_orders",
      "",
      Buffer.from(JSON.stringify({ event, data }))
    );
  } catch (error) {
    logger.error(`Failed to publish event: ${error.message}`);
  }
}

//Consume
async function consumeOrderInventoryCheck() {
  return new Promise(async (resolve, reject) => {
    try {
      const channel = await createChannel();
      await channel.assertExchange("rbevents_orders", "fanout", {
        durable: false,
      });
      await channel.assertQueue("rbqueue_orders", { durable: false });
      await channel.bindQueue("rbqueue_orders", "rbevents_orders", "");

      logger.info(`Waiting for messages in queue: rbqueue_orders`);

      channel.consume(
        "rbqueue_orders",
        async (msg) => {
          if (msg !== null) {
            try {
              const messageContent = msg.content.toString();
              const data = JSON.parse(messageContent);

              await invenotryOrderCheck.invenotryOrderCheck(data); // Call inventory service

              channel.ack(msg); // Acknowledge message

              resolve(data); // Resolve the Promise with received data
            } catch (error) {
              logger.error(`❌ Error processing message: ${error.message}`);
              channel.nack(msg, false, false); // Reject without requeue
              reject(error); // Reject the Promise
            }
          }
        },
        { noAck: false }
      );
    } catch (error) {
      logger.error(`Failed to consume messages ---2: ${error.messageContent}`);
      reject(error); // Reject on setup failure
    }
  });
}

async function publishOrderInventoryRes(event, data) {
  try {
    const channel = await createChannel();
    await channel.assertExchange("rbevents_order_inv_res", "fanout", {
      durable: false,
    });
    await channel.assertQueue("rbqueue_orders_inventory_res", {
      durable: false,
    });
    await channel.bindQueue(
      "rbqueue_orders_inventory_res",
      "rbevents_order_inv_res",
      ""
    );
    channel.publish(
      "rbevents_order_inv_res",
      "",
      Buffer.from(JSON.stringify({ event, data }))
    );
  } catch (error) {
    logger.info(`Failed to publish event: ${error.message}`);
  }
}

async function consumeOrderInventoryRes() {
  return new Promise(async (resolve, reject) => {
    try {
      const channel = await createChannel();

      await channel.assertExchange("rbevents_order_inv_res", "fanout", {
        durable: false,
      });
      await channel.assertQueue("rbqueue_order_inv_res", { durable: false });
      await channel.bindQueue(
        "rbqueue_order_inv_res",
        "rbevents_order_inv_res",
        ""
      );

      logger.info(`Waiting for messages in queue: rbqueue_order_inv_res`);

      channel.consume(
        "rbqueue_order_inv_res",
        async (msg) => {
          if (msg !== null) {
            try {
              const messageContent = msg.content.toString();
              logger.info(`Received event: ${messageContent}`);
              const data = JSON.parse(messageContent);

              await inventoryOrderRes.inventoryOrderRes(data); // Call order service function

              channel.ack(msg); // Acknowledge the message
              resolve(data); // Resolve the Promise with received data
            } catch (error) {
              logger.error(`❌ Error processing message: ${error.message}`);
              channel.nack(msg, false, false); // Reject without requeue
              reject(error);
            }
          }
        },
        { noAck: false }
      );
    } catch (error) {
      logger.error(`❌ Failed to consume messages ---1: ${error.message}`);
      reject(error);
    }
  });
}

async function closeChannel(params) {
  process.on("SIGINT", async () => {
    console.log("\n🚦 Shutting down listener...");

    await params.channel.close(); // Gracefully close the channel
    await params.connection.close(); // Close the RabbitMQ connection

    process.exit(0); // Exit the process cleanly
  });
}

export default {
  publish,
  publishOrder,
  consumeOrderInventoryCheck,
  publishOrderInventoryRes,
  consumeOrderInventoryRes,
};
