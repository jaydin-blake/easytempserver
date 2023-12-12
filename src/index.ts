import express from "express";
import cors from "cors";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
const mysql = require("mysql2");
type Device = {
    deviceId: number;
    storeId: number;
    deviceDescription: string;
};
type Log = {
    logId: number;
    deviceId: number;
    storeId: number;
    temp: number;
    humidity: number;
    date: Date;
};
const device2: Device = {
    deviceId: 3,
    storeId: 61,
    deviceDescription: "Device 2",
};
const app = express();
const port = process.env.PORT || 3001;

const DB_HOST = process.env.DB_HOST || "sql3.freesqldatabase.com";
const DB_USER = process.env.DB_USER || "sql3665929";
const DB_PASSWORD = process.env.DB_PASSWORD || "Pd7llapQlE";
const DB_NAME = process.env.DB_NAME || "sql3665929";

// Create a connection pool with environment variables
const connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
});
const util = require("util");
const query = util.promisify(connection.query).bind(connection);
// Enable CORS for all routes
app.use(cors());
app.use(express.json());
connection.connect(async (err: any) => {
    if (err) {
        console.error("Error connecting to the database:", err);
        return;
    }
    console.log("Connected to the database");
    const devices = await getAllDevicesFromDB();

    console.log(devices);
});

app.get("/", (req, res) => {
    res.send("Hello, CORS!");
});
//routes
app.get("/devices", async (req, res) => {
    try {
        const devices = await getAllDevicesFromDB();
        res.json(devices);
    } catch (error) {
        console.error("Error fetching devices:", error);
        res.status(500).send("Internal Server Error");
    }
});
app.post("/addLog", async (req, res) => {
    const deviceId = req.body.deviceId;
    const storeId = req.body.storeId;
    const temp = req.body.temp;
    const humidity = req.body.humidity;
    if (
        !deviceId ||
        !storeId ||
        !temp ||
        !humidity ||
        typeof deviceId !== "number" ||
        typeof storeId !== "number" ||
        typeof temp !== "number" ||
        typeof humidity !== "number"
    ) {
        res.status(400).send("Invalid request body");
        return;
    }
    try {
        await addLogToDB(deviceId, storeId, temp, humidity);
        res.send("Log added");
    } catch (error) {
        console.error("Error adding log:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.get("/temps", async (req, res) => {
    try {
        const temps = await getAllLogsFromDb();
        res.json(temps);
    } catch (error) {
        console.error("Error fetching temps:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

async function getAllDevicesFromDB(): Promise<Array<Object>> {
    try {
        const results = await query("SELECT * FROM sql3665929.devices;");
        return results;
    } catch (error) {
        throw error;
    }
}

async function addDeviceToDB(
    deviceId: number,
    storeId: number,
    deviceDescription: string
): Promise<void> {
    await query(
        `INSERT INTO sql3665929.devices (deviceId, deviceDescription) VALUES (?,?,?);`,
        [deviceId, storeId, deviceDescription]
    );
}

async function getAllLogsFromDb(): Promise<Array<Object>> {
    try {
        const results = await query(`SELECT * FROM sql3665929.tempLogs
        RIGHT JOIN sql3665929.devices ON sql3665929.tempLogs.deviceId = sql3665929.devices.deviceId
        ORDER BY sql3665929.tempLogs.tempDate DESC;`);
        return results;
    } catch (error) {
        throw error;
    }
}
async function getAllDeviceLogsFromDB(): Promise<Array<Object>> {
    try {
        const results = await query(`SELECT * FROM sql3665929.tempLogs;
        `);
        return results;
    } catch (error) {
        throw error;
    }
}
async function addLogToDB(
    deviceId: number,
    storeId: number,
    temp: number,
    humidity: number
): Promise<void> {
    await query(
        `INSERT INTO sql3665929.tempLogs (logId, deviceId, temp, humidity, tempDate) VALUES (?,?,?,?,?);`,
        [
            uuidv4(),
            deviceId,
            temp,
            humidity,
            dayjs().format("YYYY-MM-DD HH:mm:ss"),
        ]
    );
}
function randomuuid(): any {
    throw new Error("Function not implemented.");
}
