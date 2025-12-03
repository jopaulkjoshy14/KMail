import { createServer } from "http";
import app from "./app";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 4000;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`KMail backend listening on port ${PORT}`);
});
