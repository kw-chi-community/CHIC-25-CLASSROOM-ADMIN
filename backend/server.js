const express = require("express"); // Express 모듈 불러오기
const mongoose = require("mongoose"); // Mongoose 모듈 불러오기
const dotenv = require("dotenv"); // dotenv 모듈 불러오기
const connectDB = require("./db/mongoConnection"); // MongoDB 연결 함수 불러오기
const cors = require("cors"); // CORS 모듈 불러오기

dotenv.config(); // .env 파일의 내용을 로드

const app = express(); // Express 애플리케이션 생성
const port = 8000; // 서버 포트 설정

// CORS 설정
app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

// JSON 데이터 처리를 위한 미들웨어
app.use(express.json());

// 기본 라우트 설정
app.get("/", (req, res) => {
  res.send("서버가 정상적으로 실행 중입니다.");
});

// const studentRoutes = require("./routes/student"); // student 라우트 불러오기
// app.use("/api/students", studentRoutes); // API 경로 등록

// const classroomRoutes = require("./routes/classroom");
// app.use("/api/classrooms", classroomRoutes);

// const classRoutes = require("./routes/class");
// app.use("/api/class", classRoutes);

// const boardRoutes = require("./routes/board");
// app.use("/api/board", boardRoutes);

// MongoDB 연결 실행
connectDB().then(() => {
  // 라우트 등록 (MongoDB 연결 이후에 실행해야 함)
  const studentRoutes = require("./routes/student");
  app.use("/api/students", studentRoutes);

  const classroomRoutes = require("./routes/classroom");
  app.use("/api/classrooms", classroomRoutes);

  const classRoutes = require("./routes/class");
  app.use("/api/class", classRoutes);

  const boardRoutes = require("./routes/board");
  app.use("/api/board", boardRoutes);

  const loginRoutes = require("./routes/login");
  app.use("/api/login", loginRoutes);

  // 서버 실행
  app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
  });
});
