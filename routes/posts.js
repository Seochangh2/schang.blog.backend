const connectDB = require("../database/mariadb");
const express = require("express");
const postQueries = require("../queries/posts");
const tagQueries = require("../queries/tags");
const { marked } = require("marked");
const { htmlToText } = require("html-to-text");

const router = express.Router();

router.route("/:page").get(async (req, res) => {
  try {
    DB = await connectDB();
    const page = parseInt(req.params.page);
    const limit = 5;
    const [rows] = await DB.query(postQueries.selectPostsByPage, [
      limit,
      page * limit,
    ]);

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

router
  .route("/")
  .get(async (req, res) => {
    try {
      DB = await connectDB();
      const [rows] = await DB.query(postQueries.selectPosts);
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
  })
  .post(async (req, res) => {
    try {
      const { title, tags, markdown, id } = req.body;
      if (title) {
        //게시물 생성
        if (!id) {
          DB = await connectDB();
          await DB.beginTransaction();

          const preview = getPreviewText(markdown);
          const [result] = await DB.execute(postQueries.insertPost, [
            title,
            JSON.stringify(tags),
            markdown,
            new Date(),
            preview,
          ]);
          const insertId = result.insertId;
          for (const tag of tags) {
            const [result] = await DB.execute(tagQueries.insertPostId, [
              tag,
              insertId,
              insertId,
            ]);
          }

          await DB.commit();

          res.status(201).json({
            message: `${insertId}:upload success`,
          });
        } else {
          //게시물 수정
          DB = await connectDB();
          await DB.beginTransaction();

          const [rows] = await DB.query(tagQueries.selectTagsByPostId, [id]);
          if (rows.length > 0) {
            const prevTags = JSON.parse(rows[0].tags);
            for (const prevTag of prevTags) {
              await DB.query(tagQueries.removePostId, [id, prevTag]);
              const [row] = await DB.query(tagQueries.selectCountByTag, [
                prevTag,
              ]);
              const count = row[0].count;
              if (count === 0) {
                await DB.query(tagQueries.deleteByTag, [prevTag]);
              }
            }
          }

          const preview = getPreviewText(markdown);
          const [result] = await DB.query(postQueries.updatePost, [
            title,
            JSON.stringify(tags),
            markdown,
            preview,
            id,
          ]);
          const insertId = id;
          for (const tag of tags) {
            const [result] = await DB.execute(tagQueries.insertPostId, [
              tag,
              insertId,
              insertId,
            ]);
          }

          await DB.commit();

          res.status(201).json({
            message: `"${insertId}:update success`,
          });
        }
      } else {
        res.status(400).json({
          message: "요청 값을 확인해주세요",
        });
      }
    } catch (err) {
      console.error("쿼리 오류 발생:", err.stack);
      await DB.rollback();
      res.status(500).json({ message: "server error" });
    } finally {
      await DB.release();
    }
  });
router.route("/detail/:id").get(async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      res.status(400).json({
        message: "요청 값을 확인해주세요",
      });
      return;
    }

    DB = await connectDB();
    const [rows] = await DB.query(postQueries.selectPostById, [id]);
    if (rows.length > 0) {
      res.status(201).json(rows[0]);
    } else {
      res.status(404).json({
        message: `"${id}"에 해당하는 게시물이 없습니다`,
      });
      return;
    }
  } catch (err) {
    console.error("쿼리 오류 발생:", err.stack);
    res.status(500).json({ message: "server error" });
  } finally {
    await DB.release();
  }
});
router.route("/:id").delete(async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (!id) {
      res.status(400).json({
        message: "요청 값을 확인해주세요",
      });
      return;
    }

    DB = await connectDB();
    await DB.beginTransaction();

    const [tagRows] = await DB.query(tagQueries.selectTagsByPostId, [id]);
    if (tagRows.length > 0) {
      const prevTags = JSON.parse(tagRows[0].tags);
      for (const prevTag of prevTags) {
        await DB.query(tagQueries.removePostId, [id, prevTag]);
        const [row] = await DB.query(tagQueries.selectCountByTag, [prevTag]);
        const count = row[0].count;
        if (count === 0) {
          await DB.query(tagQueries.deleteByTag, [prevTag]);
        }
      }
    }

    const [rows] = await DB.query(postQueries.hasPostByID, [id]);
    if (rows.length > 0) {
      const [rows] = await DB.query(postQueries.deletePost, [id]);
      res.status(201).json({ message: `${id}:delete success` });
      await DB.commit();
    } else {
      res.status(404).json({
        message: `"${id}"에 해당하는 게시물이 없습니다`,
      });
      await DB.rollback();
      return;
    }
  } catch (err) {
    console.error("쿼리 오류 발생:", err.stack);
    await DB.rollback();
    res.status(500).json({ message: "server error" });
  } finally {
    await DB.release();
  }
});
router.route("/search/:keyword").get(async (req, res) => {
  try {
    const keyword = req.params.keyword;
    if (!keyword) {
      res.status(400).json({
        message: "요청 값을 확인해주세요",
      });
      return;
    }

    DB = await connectDB();
    const [rows] = await DB.query(postQueries.selectPostsByKeyword, [
      `%${keyword}%`,
    ]);
    if (rows.length > 0) {
      const result = [];
      rows.forEach((row) => {
        result.push(row);
      });
      res.status(201).json(result);
    } else {
      res.status(404).json({
        message: `"${keyword}"에 해당하는 게시물이 없습니다`,
      });
      return;
    }
  } catch (err) {
    console.error("쿼리 오류 발생:", err.stack);
    res.status(500).json({ message: "server error" });
  } finally {
    await DB.release();
  }
});
router.route("/tag/:tag").get(async (req, res) => {
  try {
    const tag = req.params.tag;
    if (!tag) {
      res.status(400).json({
        message: "요청 값을 확인해주세요",
      });
      return;
    }

    DB = await connectDB();
    const [rows] = await DB.query(postQueries.selectPostsBytag, [tag]);
    if (rows.length > 0) {
      const result = [];
      rows.forEach((row) => {
        result.push(row);
      });
      res.status(201).json(result);
    } else {
      res.status(404).json({
        message: `"${tag}"에 해당하는 게시물이 없습니다`,
      });
      return;
    }
  } catch (err) {
    console.error("쿼리 오류 발생:", err.stack);
    res.status(500).json({ message: "server error" });
  } finally {
    await DB.release();
  }
});
module.exports = router;

function getPreviewText(markdown) {
  const html = marked(markdown);
  const text = htmlToText(html, {
    wordwrap: 130,
  })
    .replace(/\n/g, "")
    .replace(">", " ")
    .replace("*", " ")
    .replace("+", " ");
  const preview =
    text.length > 20 ? text.substring(0, 20) : text.substring(0, text.length);
  return preview;
}
