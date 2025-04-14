import db from "../../config/database.js";
import circuitBreaker from "../../middleware/circuitbreaker.js";
import eventBus from "../../events/eventBus.js";
import { v4 as uuidv4 } from "uuid";
import logger from "../../middleware/logger.js";
import orderStatus from "../../utils/enum.js";

async function createOrder(body) {
  const { type, userid, shipping_address, items } = body;
  const orderId = uuidv4();
  const totalAmount = items.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0
  );

  await db.query("BEGIN");
  try {
    await circuitBreaker(async () => {
      await db.query(
        `INSERT INTO Orders (order_id, user_id, order_date, total_amount,shipping_address) VALUES ($1, $2, $3, $4, $5)`,
        [
          orderId,
          userid,
          new Date(Date.now()).toISOString(),
          totalAmount,
          shipping_address,
        ]
      );

      for (const item of items) {
        await db.query(
          `INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price,total_price) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            uuidv4(),
            orderId,
            item.productId,
            item.quantity,
            item.unit_price,
            item.quantity * item.unit_price,
          ]
        );
      }
    });

    await db.query("COMMIT");

    // Emit orderCreated event
    eventBus.publishOrder("orderCreated", {
      orderId,
      userid,
      items,
      totalAmount,
      type,
    });

    return { orderId, status: "pending" };
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}

async function inventoryOrderRes(data) {
  const { orderId, userid, productId, status, type } = data.data;
  const isSuccess = true;
  await db.query("BEGIN");
  try {
    if (
      type === orderStatus.ORDERRESERVED ||
      type === orderStatus.OUTOFSTOCK ||
      type === orderStatus.INVALIDSTOCK
    ) {
      await db.query(
        `UPDATE order_items SET notes = $1 WHERE order_Id = $2 and  product_id = $3`,
        [type, orderId, productId]
      );
    } else if (type === orderStatus.PROCESSING) {
      await db.query(
        `UPDATE orders SET notes = $1, status=$2 WHERE order_Id = $3 and user_id=$4`,
        [type, orderStatus.PROCESSING, orderId, userid]
      );
    }
    // Emit orderCreated event
    eventBus.publish("OrderProcessing", {
      orderId,
      userid,
      tyep: "OrderProcessing",
    });

    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    logger.error(error);
    throw error;
  }
}

export default { createOrder, inventoryOrderRes };
