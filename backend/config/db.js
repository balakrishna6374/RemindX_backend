import mongoose from "mongoose";
import { env } from "./env.js";

export const connectDB = async () => {
  const targetURI = env.MONGO_URI;

  if (!targetURI) {
    const errorMsg = "MONGO_URI is undefined. Please add the MONGO_URI environment variable in your Render dashboard (Settings -> Environment).";
    console.error(`[MongoDB] Configuration Error: ${errorMsg}`);
    throw new Error(errorMsg);
  }

  try {
    const conn = await mongoose.connect(targetURI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[MongoDB] Successfully connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error("[MongoDB] Connection failed:", error.message);
    
    // In local development only, try fallback if different
    if (env.NODE_ENV === "development") {
      const localURI = "mongodb://127.0.0.1:27017/certialert";
      if (targetURI !== localURI) {
        console.log(`[MongoDB] (Dev Mode) Attempting fallback to local database: ${localURI}...`);
        try {
          const localConn = await mongoose.connect(localURI, { serverSelectionTimeoutMS: 3000 });
          console.log(`[MongoDB] Connected to Local MongoDB fallback: ${localConn.connection.host}`);
          return localConn;
        } catch (localErr) {
          console.error("[MongoDB] Local fallback also failed:", localErr.message);
        }
      }
    }
    
    throw error;
  }
};
