import mongoose from "mongoose";
import { DB_URL_ATLAS, DB_URL_LOCAL } from "../Config/Config.service.js";

export async function TestDBConnection() {
  try {
    await mongoose.connect(DB_URL_LOCAL);
    console.log("DB Connected Successfully");
  } catch (error) {
    console.log("DB Connected Failed", error);
  }
}
export default TestDBConnection;
