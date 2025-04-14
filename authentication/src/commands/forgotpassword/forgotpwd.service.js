import db from "../../config/database.js";
import circuitBreaker from "../../middleware/circuitbreaker.js";
import eventBus from "../../events/eventBus.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import envVal from "../../config/envload.js";

const result = envVal;

if (result.error) {
  console.error("Failed to load .env file:", result.error);
} else {
  console.log(".env file loaded successfully-2");
}
import { hashPassword } from "../../config/hashpassword.js";
import logger from "../../middleware/logger.js";

async function forgotpasswordlink(item) {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = await hashPassword(resetToken);

  const expiryTimestamp = new Date(Date.now() + 3600000).toISOString(); //current time + one hour

  await db.query("BEGIN");
  try {
    await circuitBreaker(async () => {
      await db.query(
        `INSERT INTO forgot_password (user_email, reset_token, reset_token_expiry) VALUES ($1, $2, $3)`,
        [item.email, hashedToken, expiryTimestamp]
      );
    });

    const resetLink = `${
      process.env.HOST_URL
    }?token=${hashedToken}&email=${encodeURIComponent(item.email)}`;

    // Emit event
    //eventBus.publish('forgotpasswordlinkcreated', { email: item.email, resetLink: resetLink, status: completed });

    logger.info(
      `resetpasswordlink, userId: ${item.email}, resetLink: ${resetLink}`
    );

    await db.query("COMMIT");

    return { resetlink: resetLink, status: "completed" };
  } catch (error) {
    await db.query("ROLLBACK");
    logger.error(error);
    throw error;
  }
}

async function resetpassword(item) {
  await db.query("BEGIN");
  try {
    logger.info(`email: ${item.email}`);
    logger.info(`resetToken: ${item.resetToken}`);
    const result = await db.query(
      `SELECT user_email,reset_token,reset_token_expiry FROM forgot_password WHERE user_email = $1 and reset_token = $2`,
      [item.email.trim(), item.resetToken.trim()]
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid email or token");
    }

    const { user_email, reset_token, reset_token_expiry } = result.rows[0];
    //const isValid = await bcrypt.compare(token, user.resetToken);
    const isTokenValid = item.resetToken === reset_token;
    const expiryDate = new Date(reset_token_expiry); // Convert expiry to Date object
    if (!isTokenValid || expiryDate < new Date(Date.now()).toISOString()) {
      throw new Error("Invalid or expired reset token");
    }

    // Hash the password
    const hashedPassword = await hashPassword(item.password);

    await db.query(
      `UPDATE USERS SET password_hash=$2,updated_at=$3 WHERE email = $1`,
      [item.email, hashedPassword, new Date(Date.now()).toISOString()]
    );

    // Emit event
    // eventBus.publish('passwordrest', { email: item.email, status: completed });
    logger.info(`password reset, userId: ${item.email}, status: Updated`);

    await db.query("COMMIT");

    return { email: item.email, status: "completed" };
  } catch (error) {
    await db.query("ROLLBACK");
    logger.error(error);
    throw error;
  }
}
export default { forgotpasswordlink, resetpassword };
