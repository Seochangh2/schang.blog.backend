const connectDB = require("../database/mariadb");
const express = require("express");
const commentQueries = require("../queries/comments");
const requestIp = require("request-ip");

const router = express.Router();

router
  .route("/")
  .post(async (req, res) => {
    const { post_id, nickname, password, comment } = req.body;
    if (!post_id || !nickname || !password || !comment) {
      res.status(400).json({
        message: "요청 값을 확인해주세요",
      });
      return;
    }

    try {
      DB = await connectDB();
      const ip = requestIp.getClientIp(req);
      const [result] = await DB.query(commentQueries.insertComment, [
        post_id,
        ip,
        nickname,
        password,
        comment,
        new Date(),
      ]);
      res.status(201).json({ message: "comment upload success" });
    } catch (err) {
      console.error("쿼리 오류 발생:", err.stack);
      res.status(500).json({ message: "server error" });
    } finally {
      await DB.release();
    }
  })
  .delete(async (req, res) => {
    const { nickname, password, id } = req.body;
    if (!nickname || !password || !id) {
      res.status(400).json({
        message: "요청 값을 확인해주세요",
      });
      return;
    }
    try {
      DB = await connectDB();
      let [result] = await DB.query(commentQueries.deleteComment, [
        id,
        nickname,
        password,
      ]);
      if (result.affectedRows > 0) {
        res.status(201).json({
          message: `comment delete success`,
        });
      } else {
        res.status(201).json({
          message: "No matching comment found or incorrect credentials.",
        });
      }
    } catch (err) {
      console.error("쿼리 오류 발생:", err.stack);
      res.status(500).json({ message: "server error" });
    } finally {
      await DB.release();
    }
  });
router.route("/:post_id").get(async (req, res) => {
  const post_id = parseInt(req.params.post_id);
  try {
    DB = await connectDB();
    const [rows] = await DB.query(commentQueries.selectCommentByPostId, [
      post_id,
    ]);

    let result = [];
    rows.forEach((row) => {
      result.push(row);
    });
    res.status(201).json(result);
  } catch (error) {
    console.error("쿼리 오류 발생:", err.stack);
    res.status(500).json({ message: "server error" });
  } finally {
    await DB.release();
  }
});
module.exports = router;
