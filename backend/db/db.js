import mongoose from "mongoose";


export const dbconnect = async () => {
  const mongoURI = process.env.MONGODB_URL;


  if (!mongoURI) {
    console.error("❌ MONGODB_URL is not defined in the environment variables.");
    return;
  }

  try {
    const connect = await mongoose.connect(mongoURI, {
      
    });

    console.log(`✅ MongoDB connected: connect `);
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error);
    process.exit(1); // Exit process with failure
  }
};
