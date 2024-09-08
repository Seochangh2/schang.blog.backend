const mariadb = require("./database/connect/mariadb");
mariadb.connect();
export default mariadb;
