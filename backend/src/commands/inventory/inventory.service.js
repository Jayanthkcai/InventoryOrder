import db from "../../config/database.js";
import circuitBreaker from "../../middleware/circuitbreaker.js";
import eventBus from "../../events/eventBus.js";
import orderStatus from "../../utils/enum.js";
import logger from "../../middleware/logger.js";
import { v4 as uuidv4 } from "uuid";

async function updateStock(productId, quantity) {
  await circuitBreaker(async () => {
    await db.query(
      `UPDATE Inventory SET stock_quantity = stock_quantity + $1 WHERE product_id = $2`,
      [quantity, productId]
    );
  });

  eventBus.publish("stockUpdated", { productId, quantity });
  return { productId, quantity };
}

async function invenotryOrderCheck(data) {
  const { orderId, userid, items } = data.data;

  let isSuccess = true;
  await db.query("BEGIN");
  try {
    for (const item of items) {
      const result = await db.query(
        `SELECT product_id,stock_quantity FROM inventory WHERE product_id = $1`,
        [item.productId]
      );

      if (result.rows.length > 0) {
        const { product_id, stock_quantity } = result.rows[0];

        if (item.quantity <= stock_quantity) {
          await db.query(
            `UPDATE Inventory SET stock_quantity = stock_quantity - $1 WHERE product_id = $2`,
            [item.quantity, item.productId]
          );

          await db.query(
            `INSERT INTO inventory_transactions(transaction_id,product_id,transaction_type,quantity,notes) VALUES ($1, $2, $3, $4, $5)`,
            [uuidv4(), item.productId, "Sale", item.quantity, "Sold"]
          );

          // Emit product order reserved event
          eventBus.publishOrderInventoryRes(orderStatus.ORDERRESERVED, {
            orderId,
            userid,
            productId: product_id,
            status: true,
            type: orderStatus.ORDERRESERVED,
          });
        } else {
          isSuccess = false;
          // Emit Out of Stock event
          eventBus.publishOrderInventoryRes(orderStatus.OUTOFSTOCK, {
            orderId,
            userid,
            productId: product_id,
            status: false,
            type: orderStatus.OUTOFSTOCK,
          });
        }
      } else {
        isSuccess = false;
        // Emit Invalid Stock  event
        eventBus.publishOrderInventoryRes(orderStatus.INVALIDSTOCK, {
          orderId,
          userid,
          productId: product_id,
          status: false,
          type: orderStatus.INVALIDSTOCK,
        });
      }
    }
    // Emit Product status
    eventBus.publishOrderInventoryRes(orderStatus.PROCESSING, {
      orderId,
      userid,
      productId: "",
      status: isSuccess,
      type: orderStatus.PROCESSING,
    });
    await db.query("COMMIT");
  } catch (error) {
    await db.query("ROLLBACK");
    logger.error(error);
    throw error;
  }
}

export default { updateStock, invenotryOrderCheck };
