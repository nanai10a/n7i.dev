import pino from "pino";
import pino_pretty from "pino-pretty";

const stream = pino_pretty();
const logger = pino(stream);

export default logger;
