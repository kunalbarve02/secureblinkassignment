require("dotenv").config();

const mongoose = require("mongoose");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require('helmet');
const csurf = require('csurf');
const rateLimit = require("express-rate-limit");

const logger = require('./logger');
  
//DB Connection
mongoose
  .connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  })
  .then(() => {
    logger.info("DB CONNECTED");
  })
  .catch(() => {
    logger.error("DB CONNECTION FAILED");
  });

//Middlewares
app.use(bodyParser.json());
app.use(cookieParser());
app.use(cors({
  origin: "*",
}));
app.use(helmet());
app.use(csurf({ cookie: true }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

//Rouutes
const authRoutes = require('./routes/auth')
const profileRoutes = require('./routes/user');

app.use("/api", authRoutes);
app.use("/api", profileRoutes);

const port = 8000 || process.env.port;

if (process.env.NODE_ENV == 'test') {
  app.listen(0, () => console.log(`app listening on port 0!`))
  logger.info("app running in test environment");
}
else
{
  app.listen(port, () => console.log(`app listening on port ${port}!`))
  logger.info(`app listening on port ${port}!`);
}


module.exports = app;
