// src/queries/inventory/inventory.query.js
import db from '../../config/database.js';

async function getInventoryByProductId(productId) {
  const inventory = await db.query('SELECT * FROM Inventory WHERE product_id = $1', [productId]);
  return inventory.rows[0];
}

export default { getInventoryByProductId };
