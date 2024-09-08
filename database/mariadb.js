const mariadb = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

const pool = mariadb.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  port: 3306,
  waitForConnections: true, // 풀에 있는 연결이 모두 사용중일 때 대기
  connectionLimit: 10, //풀에 넣을 수 있는 최대 연결 수
  maxIdle: 10, // 최대 유휴 커넥션, default는 connectionLimit와 동일
  idleTimeout: 60000, // 유휴 커넥션 timeout(ms), default는 60000
  queueLimit: 0, //대기열에 넣을 수 있는 최대 요청 수
  enableKeepAlive: true, //TCP 연결에 keep-alive를 넣을지 결정
  keepAliveInitialDelay: 0, //keepAlive 패킷을 처음으로 보낼 때까지의 지연 시간
});
async function connectDB() {
  try {
    // 데이터베이스 연결 확인
    const DB = await pool.getConnection();

    return DB;
  } catch (err) {
    console.error("데이터베이스 연결 실패:", err.stack);
  }
}

// 데이터베이스 연결 시도
//connectDB();

// DB.connect((err) => {
//   if (err) {
//     console.error("데이터베이스 연결 실패:", err.stack);
//     return;
//   }
//   console.log("데이터베이스에 연결됨");
// });

module.exports = connectDB;
