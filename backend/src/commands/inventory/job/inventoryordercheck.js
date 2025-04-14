import eventBus from "../../../events/eventBus.js";
import logger from "../../../middleware/logger.js";


async function listenToInventoryOrderCheck() {
  try {
    logger.info("Listening to Inventory Order Check Queue");
    const data = eventBus.consumeOrderInventoryCheck();

   
  } catch (error) {
    logger.error(error);
  }
}

export default listenToInventoryOrderCheck;

//listenToInventoryOrderCheck();
