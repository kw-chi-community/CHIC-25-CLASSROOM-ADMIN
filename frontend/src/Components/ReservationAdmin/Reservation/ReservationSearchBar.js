import React from "react";

/**
 * 예약 현황 검색바 (학기만 선택)
 * - 날짜 / 건물 / 호수 UI 제거 (캘린더 가시범위로 대체)
 */
const ReservationSearchBar = ({
  semester,
  semesterList = [], // undefined 방지
  handleSemesterChange,
  hasSemesterError,
}) => {
  const isEmpty = !hasSemesterError && semesterList.length === 0;

  return (
    <div className="reservation-status__search">
      {/* 학기 (날짜 입력 UI 제거) */}
      <ul className="reservation-status__search-list row">
        <li className="reservation-status__search-item">
          <label
            htmlFor="semester-select"
            className="reservation-status__search-label"
          >
            학기
          </label>
          <select
            id="semester-select"
            className="reservation-status__search-input"
            value={semester}
            onChange={handleSemesterChange}
            disabled={hasSemesterError || isEmpty}
            aria-invalid={hasSemesterError ? "true" : "false"}
          >
            {hasSemesterError ? (
              <option>학기 정보를 불러올 수 없습니다</option>
            ) : isEmpty ? (
              <option>학기 목록을 불러오는 중...</option>
            ) : (
              semesterList.map((sem, idx) => (
                <option key={idx} value={sem}>
                  {sem}
                </option>
              ))
            )}
          </select>
        </li>
      </ul>
    </div>
  );
};

export default ReservationSearchBar;
