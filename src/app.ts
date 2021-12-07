import express, { Application } from "express";
import cors, { CorsOptions } from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import passport from "passport";
import session from "express-session";
import initialize from "./utils/passport-config";
import { constants } from "./config/constants";
import { AuthRoutes } from "./routes";
import { createClient } from "redis";
import { healthCheck as redisHealthCheck } from "./utils/redisHealthCheck";

require("dotenv").config();

// Redis
const redisClient =
  process.env.NODE_ENV === "development"
    ? createClient()
    : createClient(process.env.REDIS_TLS_URL!, {
        tls: {
          rejectUnauthorized: false,
        },
      });
const RedisStore = require("connect-redis")(session);
redisHealthCheck(redisClient);

export const app: Application = express();

// Bodyparser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true } // for https
    store: new RedisStore({ client: redisClient }),
  })
);

const corsOptions: CorsOptions = {
  origin: process.env.NODE_ENV === "production" ? constants.REFERRERS : true,
  credentials: true,
};

// Cors middleware
app.use(cors(corsOptions));

// Passport.js
app.use(passport.initialize());
app.use(passport.session());
initialize(passport);

app.listen(process.env.PORT || constants.PORT, () => {
  mongoose.connect(process.env.MONGO_URI!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  });
  console.log("App listening on PORT: ", constants.PORT);
});

const db = mongoose.connection;
db.on("error", (err) => {
  console.log("### DB ERROR ###", err);
});

db.once("open", () => {
  // Routes
  app.use("/api/auth", AuthRoutes);
});
