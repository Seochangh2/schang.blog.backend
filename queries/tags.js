const queries = {
  selectTagsByPostId: `SELECT tags FROM posts WHERE id = ?`,
  selectCountByTag: `SELECT JSON_LENGTH(postIDs) AS count
  FROM tags
  WHERE name = ?`,
  insertPostId: `
  INSERT INTO tags (name, postIds)
  VALUES (?, JSON_ARRAY(?))
  ON DUPLICATE KEY UPDATE postIds = JSON_ARRAY_APPEND(postIds, '$', ?)`,
  removePostId: `
  UPDATE tags 
  SET postIds = JSON_REMOVE(postIds, JSON_UNQUOTE(JSON_SEARCH(postIds, 'one', ?))) 
  WHERE name = ?
`,
  deleteByTag: `DELETE FROM tags WHERE name = ?`,
  selectTags: `SELECT * FROM tags ORDER BY JSON_LENGTH(postIDs) DESC`,
};
module.exports = queries;
