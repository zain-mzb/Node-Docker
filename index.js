const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session")
const redis = require("redis")
let RedisStore = require("connect-redis")(session)
const cors = require("cors")




const {
  MONGO_USER,
  MONGO_PASSWORD,
  MONGO_IP,
  MONGO_PORT,
  SESSION_SECRET,
  REDIS_URL,
  REDIS_PORT,
} = require("./config/config");



let redisClient = redis.createClient({
host: REDIS_URL,
port: REDIS_PORT
})


const postRouter = require("./routes/postRoutes")
const userRouter = require("./routes/userRoutes")

const app = express();

const mongoURL = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_IP}:${MONGO_PORT}/?authSource=admin`;

const connectWithRetry = () => {
  mongoose
    .connect(mongoURL)
    .then(() => console.log("Successfully Connected to database"))
    .catch((e) => {
      console.log(e);
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();
app.enable("trust proxy")

app.use(cors({}))
app.use(session({
    store: new RedisStore({client: redisClient}),
    secret:SESSION_SECRET,
    cookie:{
        secure: false,
        resave: false,
        saveUninitialized: false,
        httpOnly: true,
        maxAge: 3000000
    }
}))

app.use(express.json());

app.get("/api/v1", (req, res) => {
  res.send("<h1>Hi There man</h1>");
  console.log('Yea it ran');
});

app.use("/api/v1/posts", postRouter)
app.use("/api/v1/users", userRouter)


const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port ${port}`));
