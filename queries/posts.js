const queries = {
  selectPosts:
    "SELECT id, title, tags, date, preview FROM posts ORDER BY date DESC",
  selectPostsByPage: `SELECT id, title, tags, date, preview
      FROM posts
      ORDER BY date DESC
      LIMIT ? OFFSET ?`,
  insertPost: ` INSERT INTO posts (title, tags, markdown, date, preview)
  VALUES (?, ?, ?, ?, ?)`,
  updatePost: `UPDATE posts 
  SET title = ?, tags = ?, markdown = ?, preview = ? 
  WHERE id = ?`,
  deletePost: `DELETE FROM posts WHERE id = ?`,
  hasPostByID: `SELECT * FROM posts WHERE id = ? LIMIT 1`,
  selectPostById: `SELECT * FROM posts WHERE id = ?`,
  selectPostsByKeyword: `SELECT id, title, tags, date, preview FROM posts WHERE markdown LIKE ? ORDER BY date DESC`,
  selectPostsBytag: `SELECT id, title, tags, date, preview
  FROM posts
  WHERE JSON_CONTAINS(tags, JSON_QUOTE(?), '$') ORDER BY date DESC`,
};
module.exports = queries;
