import db from '../../config/database.js';
import circuitBreaker from '../../middleware/circuitbreaker.js';
import eventBus from '../../events/eventBus.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../../middleware/logger.js';

import { hashPassword } from '../../config/hashpassword.js';

async function createUser(item) {
  const useriID = uuidv4();

    // Hash the password
 const hashedPassword = await hashPassword(item.password);

  await db.query('BEGIN');
  try {
    await circuitBreaker(async () => {
        await db.query(
            `INSERT INTO Users (user_id, email, password_hash) VALUES ($1, $2, $3)`,
            [useriID, item.email, hashedPassword]
        );
    });

    // Emit event
   // eventBus.publish('userCreated', { userId: useriID, email: item.email });
   logger.info(`userCreated, userId: ${useriID}, email: ${item.email}`)

    await db.query('COMMIT');

    return {userId: useriID, status: 'completed' };
  } catch (error) {
    await db.query('ROLLBACK');
    logger.error(error);
    throw error;
  }
}

export default { createUser };
