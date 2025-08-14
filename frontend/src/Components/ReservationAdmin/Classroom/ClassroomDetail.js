import React, { useState, useEffect } from "react";
import "../css/reservationModal.css";
import ClassroomUpdate from "./ClassroomUpdate";
import School from "../../../image/School.svg";

const DetailModal = ({ classroom, onClose, onUpdate }) => {
  // 백앤드 주소
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // 모달 열릴 때 스크롤 금지되도록 설정
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // 수정 모달 상태 관리
  const [isUpdateMode, setUpdateMode] = useState(false);
  const switchUpdateMode = () => setUpdateMode((prev) => !prev);

  if (!classroom) return null;

  // 데이터 없으면 '정보없음' 띄우기
  const displayValue = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === "" ||
      value === 0 ||
      (Array.isArray(value) && value.length === 0)
    ) {
      return "정보없음";
    }
    return value;
  };

  // 강의실 삭제 요청 api
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `${displayValue(classroom.building)} ${displayValue(
        classroom.room
      )} 강의실을 삭제하시겠습니까?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/classroom/${encodeURIComponent(
          classroom.building
        )}/${encodeURIComponent(classroom.room)}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("강의실 정보가 삭제되었습니다.");
        onUpdate(null, classroom.building, classroom.room);
        onClose();
      } else {
        alert(`삭제 실패: ${result.message}`);
      }
    } catch (error) {
      console.error("삭제 중 오류 발생:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="classroom-details__header">
          <button className="modal-close" onClick={onClose}>
            ✖
          </button>
          <h1 className="classroom-details__title">
            <img className="school_image" src={School} alt="🏢" />{" "}
            {displayValue(classroom.building)} {displayValue(classroom.room)}
            <span className="classroom-details__actions">
              <button
                className="classroom-details__update"
                onClick={switchUpdateMode}
              >
                강의실 수정
              </button>
              <button
                className="classroom-details__delete"
                onClick={handleDelete}
              >
                강의실 삭제
              </button>
            </span>
          </h1>
        </header>

        <main className="classroom-details__main">
          <ul className="classroom-details__list">
            <li className="classroom-details__item">
              <strong className="classroom-details__label">
                ▪️ 관리부서 / 학과{" "}
              </strong>
              <div className="classroom-details__content">
                {displayValue(classroom.contactDepartment)}
              </div>
            </li>
            <li className="classroom-details__item">
              <strong className="classroom-details__label">▪️ 수용인원 </strong>
              <div className="classroom-details__content">
                {displayValue(classroom.minNumberOfUsers)}
              </div>
            </li>
            <li className="classroom-details__item">
              <strong className="classroom-details__label">▪️ 장비 </strong>
              <div className="classroom-details__content">
                {displayValue(classroom.equipment)}
              </div>
            </li>
            <li className="classroom-details__item">
              <strong className="classroom-details__label">▪️ 전화번호 </strong>
              <div className="classroom-details__content">
                {displayValue(classroom.contactNumber)}
              </div>
            </li>
          </ul>
        </main>
      </div>

      {isUpdateMode && (
        <ClassroomUpdate
          classroom={classroom}
          submit={switchUpdateMode}
          onClose={switchUpdateMode}
          onUpdate={(updatedData) => {
            onUpdate(updatedData.data);
            onClose();
          }}
        />
      )}
    </div>
  );
};

export default DetailModal;
