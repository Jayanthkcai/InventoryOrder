import eventBus from "../../../events/eventBus.js";
import logger from "../../../middleware/logger.js";


async function listenToInventoryOrderRes() {
  try {
    logger.info("Listening to Inventory Order Response Queue");
    const data = eventBus.consumeOrderInventoryRes();

   
  } catch (error) {
    logger.error(error);
  }
}

export default listenToInventoryOrderRes;
