const queries = {
  insertComment: `INSERT INTO comments (post_id, ip, nickname, password, comment,date)
VALUES (?, ?, ?, ?, ?,?)
 `,
  deleteComment: `DELETE FROM comments 
WHERE id = ? AND nickname = ? AND password = ?`,
  selectCommentByPostId: `SELECT * FROM comments WHERE post_id = ?`,
};
module.exports = queries;
