import dns from "dns";
import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// Some ISP/router DNS servers proxy plain A-record lookups fine but refuse
// the SRV query type that mongodb+srv:// needs (Node's resolver hits this as
// "querySrv ECONNREFUSED" even when e.g. `nslookup` succeeds via a different
// resolution path). Pointing Node's own resolver at public DNS sidesteps it.
dns.setServers(["8.8.8.8", "1.1.1.1", ...dns.getServers()]);

const connectDB = async () => {
    try {
        // `dbName` (not string-concatenating `${MONGODB_URI}/${DB_NAME}`) so this
        // works whether MONGODB_URI is the bare cluster string Atlas gives you by
        // default or one that already has a /<database> path on the end.
        const connectionInstance = await mongoose.connect(process.env.MONGODB_URI, {
            dbName: DB_NAME,
        });
        console.log(
            `MongoDB connected. DB host: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
};

export default connectDB;
