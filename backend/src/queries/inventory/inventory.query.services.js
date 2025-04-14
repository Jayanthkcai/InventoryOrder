// src/queries/order/order.query.js
import db from '../../config/database.js';

async function getOrderById(orderId) {
  const order = await db.query('SELECT * FROM Orders WHERE id = $1', [orderId]);
  const items = await db.query('SELECT * FROM OrderItems WHERE order_id = $1', [orderId]);

  return {
    order: order.rows[0],
    items: items.rows,
  };
}

export default { getOrderById };
