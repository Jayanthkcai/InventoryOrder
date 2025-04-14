import db from "../../config/database.js";
import circuitBreaker from "../../middleware/circuitbreaker.js";
import eventBus from "../../events/eventBus.js";
import bcrypt from "bcrypt";
import { hashPassword } from "../../config/hashpassword.js";
import logger from "../../middleware/logger.js";
import jwt from "jsonwebtoken";

async function login(item) {
  try {
    const result = await db.query(
      `SELECT user_id,email,password_hash,last_login FROM users WHERE email = $1`,
      [item.email.trim()]
    );

    if (result.rows.length === 0) {
      throw new Error("Invalid Login");
    }
    const { user_id, email, password_hash } = result.rows[0];
    const isMatch = await bcrypt.compare(item.password, password_hash);
    if (isMatch) {
      // const uid = user_id;
      // const jwtuser = email;
      const accesstoken = mintAccessToken({ user: email });
      const refreshtoken = jwt.sign(
        { user: email },
        process.env.REFRESH_TOKEN_SECRET
      );

      logger.info(`Login Successful, userId: ${item.email}, status: Completed`);

      return { accesstoken: accesstoken, refreshtoken: refreshtoken };
    } else {
      logger.info(`Login failed, userId: ${item.email}, status: unsuccessful`);
      throw new Error("Login Failied. Password mismatch");
    }
  } catch (error) {
    logger.info(`Login failed, userId: ${item.email}, status: unsuccessful`);
    logger.error(error);
    throw error;
  }
}

async function token(item) {
  const refreshtoken = item.refreshtoken;
  const email = item.email;

  if (refreshtoken == null) {
    return { Status: "failed" };
  }
  try {
    const decoded = await jwt.verify(
      refreshtoken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const accesstoken = mintAccessToken({ user: decoded.user });

    logger.info(
      `Token generation successful, userId: ${decoded.user}, status: Completed`
    );

    return { accesstoken: accesstoken, status: "completed" };
  } catch (error) {
    logger.info(
      `Token generation failed, userId: ${item.email}, status: unsuccessful`
    );
    logger.error(error);
    throw error;
  }
}

async function logout(item) {
  const refreshtoken = item.refresh_token;
  console.log("token: ", refreshtoken);
  return { refreshtoken: refreshtoken };
  res.sendStatus(204);
}

function mintAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30s" });
}

async function verifyToken(req) {
  const authzHeader = req.headers["authorization"];
  const accesstoken = authzHeader && authzHeader.split(" ")[1];
  if (accesstoken == null) {
    return res.status(401);
  } else {
    try {
      const decoded = await jwt.verify(
        accesstoken,
        process.env.ACCESS_TOKEN_SECRET
      );
      logger.info(`Token verification successful, status: successful`);
      return { user: decoded.user, status: "completed" };
    } catch (error) {
      logger.info(`Token verification failed, status: unsuccessful`);
      logger.error(error);
      throw error;
    }
  }
}

export default { login, logout, token, verifyToken };
