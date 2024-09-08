const express = require("express");
const app = express();
const port = 1113;

const cors = require("cors");
const morgan = require("morgan"); // 디버깅
const helmet = require("helmet"); // 보안
const bodyParser = require("body-parser");
const postRouter = require("./routes/posts");
const tagRouter = require("./routes/tags");
const commentRouter = require("./routes/comments");
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
app.use(cors());
app.use(bodyParser.json());
app.use("/posts", postRouter);
app.use("/tags", tagRouter);
app.use("/comments", commentRouter);
