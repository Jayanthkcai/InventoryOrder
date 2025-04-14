import dotenv from "dotenv";
// import path from "path";

const envVal = dotenv.config({ path: "./.env" });
// const parentEnvPath = path.resolve("../../.env");

// console.log("Parent .env path:", parentEnvPath);

// // Evaluate ./.env
// const currentEnvPath = path.resolve("./.env");
// console.log("Current .env path:", currentEnvPath);

export default envVal;
