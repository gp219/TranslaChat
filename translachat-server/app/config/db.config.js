import { connect } from 'mongoose';

// Define your MongoDB connection URI (replace with your actual connection string)
const MONGODB_URI = process.env.MONGODB_URI;

// Function to establish the database connection
const connectDB = async () => {
    try {
        const conn = await connect(MONGODB_URI, {
            // useNewUrlParser: true, 
            // useUnifiedTopology: true, 
        });

        console.log(`\nMongoDB Connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`MongoDB Connection Error: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;