// 예약 현황
// GET /api/appointment-status/:semester
// 학기 전체 기간(start_time ~ end_time)에 해당하는 전체 예약 반환

const express = require("express");
const router = express.Router();
const { getClassModel, classDB } = require("../db/class");
const mongoose = require("mongoose");
const moment = require("moment"); // (필요시 사용)
const dotenv = require("dotenv");
dotenv.config();

const Schedule = require("../db/schedule");

// 학생 정보 DB 연결 (이름 조회용)
const studentDB = mongoose.createConnection(process.env.MONGO_URI_STUDENT);
const studentSchema = new mongoose.Schema(
  { studentId: String, name: String },
  { collection: "students", versionKey: false }
);
const Student = studentDB.model("student", studentSchema);

// 요일 매핑
const dayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

/* =========================
 * 유틸: 날짜/범위 처리
 * ========================= */

// Date -> 해당 날짜의 UTC 00:00
function toDayStartUTCFromDate(d) {
  const dt = new Date(d);
  return new Date(
    Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate())
  );
}

// 일수 더하기
function addDays(date, days) {
  return new Date(date.getTime() + days * 86400000);
}

/* =========================
 * 학기 Schedule 조회
 *  - Schedule 문서: { year, semester, start_time(Date), end_time(Date) }
 *  - end(종료일 포함)를 위해 end_day+1 00:00을 사용 ($lt 비교)
 * ========================= */
async function getSemesterBounds(semesterCode) {
  const [yearStr, semStr] = semesterCode.split("-");
  const year = parseInt(yearStr, 10);
  if (!year || !semStr) throw new Error("잘못된 학기 코드 형식입니다.");

  const doc = await Schedule.findOne({ year, semester: semStr }).lean();
  if (!doc || !doc.start_time || !doc.end_time) {
    throw new Error(
      "해당 학기의 기간 Schedule가 없습니다(start_time/end_time)."
    );
  }

  const startDay = toDayStartUTCFromDate(doc.start_time);
  const endDay = toDayStartUTCFromDate(doc.end_time);
  const start = startDay;
  const end = addDays(endDay, 1); // 종료일 포함을 위해 다음날 00:00 사용 ($lt)

  return { start, end };
}

/* =========================
 * 강의(요일 반복) → 날짜별 단건 이벤트로 전개
 *  - rangeStart ~ rangeEnd 구간을 하루씩 순회
 *  - 해당 요일 플래그가 true인 수업만 해당 날짜 이벤트로 push
 * ========================= */
async function expandClassesToDates(ClassModel, rangeStart, rangeEnd) {
  const classDocs = await ClassModel.find({
    $or: dayMap.map((d) => ({ [`week_${d}`]: true })),
  }).select(
    "building room class_name prof_name " +
      dayMap.map((d) => `${d}_start_time ${d}_end_time`).join(" ")
  );

  const out = [];
  for (let d = new Date(rangeStart); d < rangeEnd; d = addDays(d, 1)) {
    const wIdx = d.getUTCDay();
    const w = dayMap[wIdx];
    const startField = `${w}_start_time`;
    const endField = `${w}_end_time`;
    const flag = `week_${w}`;

    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    const isoDate = `${y}-${m}-${dd}`;

    for (const c of classDocs) {
      if (!c[flag]) continue;
      const st = c[startField];
      const et = c[endField];
      if (!st || !et) continue;

      out.push({
        tag: "class",
        building: c.building,
        room: c.room,
        class_name: c.class_name,
        prof_name: c.prof_name,
        start_time: st,
        end_time: et,
        date: isoDate,
      });
    }
  }
  return out;
}

/* =========================
 * 예약 조회 + Schedule 조인
 *  - reserve_date 범위 조회 ($gte/$lt)
 *  - classroom_info 조인(building/room)
 *  - 학생 이름 조인
 * ========================= */
async function fetchReserves(rangeStart, rangeEnd) {
  const reserves = await classDB
    .collection("reserve")
    .find({ reserve_date: { $gte: rangeStart, $lt: rangeEnd } })
    .toArray();

  const infoIds = reserves.map((r) => r.classroom_info_id).filter(Boolean);
  const classroomInfos = infoIds.length
    ? await classDB
        .collection("classroom_info")
        .find({ _id: { $in: infoIds } })
        .project({ building: 1, room: 1 })
        .toArray()
    : [];
  const infoMap = new Map(classroomInfos.map((ci) => [String(ci._id), ci]));

  const studentIds = [
    ...new Set(reserves.map((r) => r.student_id).filter(Boolean)),
  ];
  const students = studentIds.length
    ? await Student.find({ studentId: { $in: studentIds } }).lean()
    : [];
  const studentMap = new Map(students.map((s) => [s.studentId, s.name]));

  return reserves.map((r) => {
    const ci = infoMap.get(String(r.classroom_info_id));
    const y = r.reserve_date.getUTCFullYear();
    const m = String(r.reserve_date.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(r.reserve_date.getUTCDate()).padStart(2, "0");
    const isoDate = `${y}-${m}-${dd}`;

    return {
      tag: "reserve",
      building: ci?.building || "미상",
      room: ci?.room || "미상",
      purpose: r.purpose,
      name: studentMap.get(r.student_id) || "이름없음",
      reserve_start_time: r.reserve_start_time,
      reserve_end_time: r.reserve_end_time,
      date: isoDate,
    };
  });
}

/* =========================
 * 정렬: 날짜 → 시작시간 → 건물 → 호수
 * ========================= */
function sortEvents(a, b) {
  const aStart = a.start_time || a.reserve_start_time || "";
  const bStart = b.start_time || b.reserve_start_time || "";
  return (
    a.date.localeCompare(b.date) ||
    aStart.localeCompare(bStart) ||
    (a.building || "").localeCompare(b.building || "") ||
    (a.room || "").localeCompare(b.room || "")
  );
}

/* ============================================================
 * 각 학기에 해당하는 예약 전체 조회
 * GET /api/appointment-status/:semester
 * 학기 전체 기간에 해당하는 예약 반환 (응답이 클 수 있음)
 * ============================================================ */
router.get("/:semester", async (req, res) => {
  try {
    const { semester } = req.params;

    // 학기 기간 조회(필수: Schedule에 start_time/end_time이 저장되어 있어야 함)
    const { start, end } = await getSemesterBounds(semester);

    // ✅ 강의 제거: 예약(Schedule 조인)만 조회
    const reserveEvents = await fetchReserves(start, end);

    // 정렬(날짜 → 시작시간 → 건물 → 호수)
    const sorted = reserveEvents.sort(sortEvents);

    res.json({ message: "조회 성공", results: sorted });
  } catch (err) {
    console.error("예약 현황(학기 전체) 조회 실패:", err);
    res.status(500).json({ error: "서버 오류", detail: err.message });
  }
});

module.exports = router;
