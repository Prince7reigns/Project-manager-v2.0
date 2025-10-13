import mongooese from "mongoose";
import { DB_NAME } from "../utils/constants.js"

const dbConnect = async () => {
    try {
        console.log(`${process.env.MONGO_URL}/${DB_NAME}`)
        const connectionInstance = await mongooese.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
        console.log(`Database connected successfully: ${connectionInstance.connection.host}`);

    } catch (error) {
        console.error("Database connection error:", error);
        process.exit(1);
    }
}

export default dbConnect;