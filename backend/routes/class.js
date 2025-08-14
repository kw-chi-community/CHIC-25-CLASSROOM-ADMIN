const express = require("express");
const router = express.Router();
const { getClassModel, classDB } = require("../db/class");
const parseClassDaytime = require("../utils/classTimeParser");
const Schedule = require("../db/schedule"); // ⛳️ 학기 기간 메타 조회를 위해 추가

// 유효한 학기 형식 확인 (예: 2025-1)
function isValidSemester(semester) {
  return /^\d{4}-\d$/.test(semester);
}

// 날짜를 "YYYY-MM-DD" 문자열로 변환 (Date 또는 date-like string)
function toYMD(dateLike) {
  if (!dateLike) return null;
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (Number.isNaN(d.getTime())) return null;
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// GET /api/class/collections → 유효한 collection 리스트만 반환
router.get("/collections", async (req, res) => {
  try {
    // 기존 로직: 컬렉션 이름 중 YYYY-N 형식만 필터
    const collections = await classDB.db.listCollections().toArray();
    const semesters = collections
      .map((col) => col.name)
      .filter((name) => /^\d{4}-\d$/.test(name));

    // Schedule에 저장된 학기 기간 메타(start_time, end_time)를 함께 내려주기
    // ex) "2025-2" → { year: 2025, semester: "2" }
    const parsed = semesters.map((code) => {
      const [yearStr, semStr] = code.split("-");
      return { code, year: parseInt(yearStr, 10), semStr };
    });

    // 한 번의 쿼리로 모두 조회
    const orQuery = parsed.map(({ year, semStr }) => ({
      year,
      semester: semStr,
    }));
    let metaMap = new Map();
    if (orQuery.length > 0) {
      const metas = await Schedule.find({ $or: orQuery }).lean();
      // key: `${year}-${semester}`  (semester는 문자열 "1"/"2"/"여름"/"겨울" 등)
      metaMap = new Map(metas.map((m) => [`${m.year}-${m.semester}`, m]));
    }

    // 응답: 학기 코드 + (있다면) 기간 정보
    const result = parsed.map(({ code, year, semStr }) => {
      const meta = metaMap.get(`${year}-${semStr}`);
      return {
        semester: code, // "2025-2"
        start_date: meta ? toYMD(meta.start_time) : null, // "YYYY-MM-DD" 또는 null
        end_date: meta ? toYMD(meta.end_time) : null, // "YYYY-MM-DD" 또는 null
      };
    });

    res.json({ message: "컬렉션 목록 조회 성공", collections: result });
  } catch (err) {
    res
      .status(500)
      .json({ error: "컬렉션 목록 조회 실패", detail: err.message });
  }
});

// POST /api/class/:semester
// /api/class/2025-1
// classroom_idx , class_daytime 은 필수에서 제외
router.post("/:semester", async (req, res) => {
  const { semester } = req.params;
  if (!isValidSemester(semester)) {
    return res.status(400).json({ error: "학기 형식이 올바르지 않습니다." });
  }

  try {
    const Class = getClassModel(semester);
    const {
      class_idx,
      classroom_idx = "",
      class_name,
      prof_name,
      class_credit,
      class_daytime = "",
    } = req.body;

    // 필수 입력값 검사 (classroom_idx, class_daytime 제외)
    if (!class_idx || !class_name || !prof_name || !class_credit) {
      return res.status(400).json({
        error:
          "필수 항목(class_idx, class_name, prof_name, class_credit)을 모두 입력해주세요.",
      });
    }

    // 중복 확인
    const exists = await Class.findOne({ class_idx });
    if (exists) {
      return res.status(400).json({ error: "이미 존재하는 강의입니다." });
    }

    // 시간 파싱 (class_daytime 있을 경우에만)
    let timeData = {};
    if (class_daytime) {
      timeData = parseClassDaytime(class_daytime);
    }

    const newClass = new Class({
      class_idx,
      classroom_idx,
      class_name,
      prof_name,
      class_credit,
      class_daytime,
      ...timeData,
    });

    await newClass.save();

    // 필요 없는 필드 필터링
    const filtered = newClass.toObject();
    Object.keys(filtered).forEach((key) => {
      if (filtered[key] === "" || filtered[key] === false) delete filtered[key];
    });

    res.status(201).json({ message: "강의 등록 완료", class: filtered });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "강의 등록 실패", detail: err.message });
  }
});

// GET /api/class/:semester
// GET /api/class/:semester?classroom=새빛103&week=week_mon
router.get("/:semester", async (req, res) => {
  const { semester } = req.params;
  if (!isValidSemester(semester))
    return res.status(400).json({ error: "학기 형식이 올바르지 않습니다." });

  try {
    const Class = getClassModel(semester);
    const { classroom, week } = req.query;

    let query = {};
    if (classroom && week) {
      query = { classroom_idx: classroom, [week]: true };
    }

    const result = await Class.find(query);
    res.json({ message: "강의 조회 성공", classes: result });
  } catch (err) {
    res.status(500).json({ error: "조회 실패", detail: err.message });
  }
});

// PUT /api/class/:semester/:class_idx
router.put("/:semester/:class_idx", async (req, res) => {
  const { semester, class_idx } = req.params;
  if (!isValidSemester(semester)) {
    return res.status(400).json({ error: "학기 형식이 올바르지 않습니다." });
  }

  try {
    const Class = getClassModel(semester);
    const existing = await Class.findOne({ class_idx });

    if (!existing) {
      return res.status(404).json({ error: "해당 강의를 찾을 수 없습니다." });
    }

    const updateData = req.body;

    // class_daytime이 있을 경우 시간 필드 업데이트 포함
    if (updateData.class_daytime) {
      const timeData = parseClassDaytime(updateData.class_daytime);
      Object.assign(updateData, timeData);
    }

    // 데이터 업데이트
    Object.assign(existing, updateData);
    await existing.save();

    // 응답에서 빈 필드 제거
    const cleaned = existing.toObject();
    Object.keys(cleaned).forEach((key) => {
      if (cleaned[key] === "" || cleaned[key] === false) delete cleaned[key];
    });

    res.json({ message: "강의 수정 완료", class: cleaned });
  } catch (err) {
    console.error("강의 수정 오류:", err);
    res.status(500).json({ error: "강의 수정 실패", detail: err.message });
  }
});

// DELETE /api/class/:semester/:class_idx
router.delete("/:semester/:class_idx", async (req, res) => {
  const { semester, class_idx } = req.params;
  if (!isValidSemester(semester))
    return res.status(400).json({ error: "학기 형식이 올바르지 않습니다." });

  try {
    const Class = getClassModel(semester);
    const deleted = await Class.findOneAndDelete({ class_idx });
    if (!deleted) return res.status(404).json({ error: "삭제할 강의 없음" });

    res.json({ message: "삭제 성공", class: deleted });
  } catch (err) {
    res.status(500).json({ error: "삭제 실패", detail: err.message });
  }
});

module.exports = router;
