import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import orgRoutes from "./routes/orgs";
import licenseRoutes from "./routes/licenses";
import webhookRoutes from "./routes/webhooks";
import apikeyRoutes from "./routes/apikeys";

dotenv.config();

const app = express();
app.use(cors());
// Mount webhook routes before body parsing so Stripe raw body is available
app.use("/api/webhooks", webhookRoutes);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/orgs", orgRoutes);
app.use("/api/licenses", licenseRoutes);
app.use("/api/apikeys", apikeyRoutes);

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

export default app;
