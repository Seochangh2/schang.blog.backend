const connectDB = require("../database/mariadb");
const express = require("express");
const tagQueries = require("../queries/tags");

const router = express.Router();

router.route("/").get(async (req, res) => {
  try {
    DB = await connectDB();
    const [rows] = await DB.query(tagQueries.selectTags);
    let result = [];
    rows.forEach((row) => {
      result.push(row);
    });
    res.status(201).json(result);
  } catch (err) {
    console.error("쿼리 오류 발생:", err.stack);
    res.status(500).json({ message: "server error" });
  } finally {
    await DB.release();
  }
});

module.exports = router;
