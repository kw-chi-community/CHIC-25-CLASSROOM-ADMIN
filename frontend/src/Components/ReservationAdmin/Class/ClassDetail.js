import React, { useState, useEffect } from "react";
import "../css/reservationModal.css";
import ClassUpdate from "./ClassUpdate";
import Book from "../../../image/Book.svg";

const DetailModal = ({ classes, onClose, onUpdate, semester }) => {
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

  if (!classes) return null;

  // 데이터 없으면 '정보없음' 띄우기
  const displayValue = (value) => {
    if (value === null || value === undefined || value === "" || value === 0) {
      return "정보없음";
    }
    return value;
  };

  // 강의 삭제 요청 api
  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `${displayValue(classes.class_name)} 강의를 삭제하시겠습니까?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${BACKEND_URL}/api/class/${semester}/${encodeURIComponent(
          classes.class_idx
        )}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (response.ok) {
        alert("강의실 정보가 삭제되었습니다.");
        onUpdate(null, [classes.class_idx]);
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
        <header className="class-details__header">
          <button className="modal-close" onClick={onClose}>
            ✖
          </button>
          <h1 className="class-details__title">
            <img className="book-image" src={Book} alt="📖" />
            {displayValue(classes.class_name)} ({classes.prof_name})
            <span className="class-details__actions">
              <button
                className="class-details__update"
                onClick={switchUpdateMode}
              >
                강의 수정
              </button>
              <button
                className="classroom-details__delete"
                onClick={handleDelete}
              >
                강의 삭제
              </button>
            </span>
          </h1>
        </header>

        <main className="class-details__main">
          <ul className="class-details__list">
            <li className="class-details__item">
              <strong className="class-details__label">▪️ 학정번호 </strong>
              <div className="class-details__content">
                {displayValue(classes.class_idx)}
              </div>
            </li>
            <li className="class-details__item">
              <strong className="class-details__label">▪️ 강의실 </strong>
              <div className="class-details__content">
                {displayValue(classes.classroom_idx)}
              </div>
            </li>
            <li className="class-details__item">
              <strong className="class-details__label">▪️ 교수명 </strong>
              <div className="class-details__content">
                {displayValue(classes.prof_name)}
              </div>
            </li>
            <li className="class-details__item">
              <strong className="class-details__label">▪️ 취득학점 </strong>
              <div className="class-details__content">
                {displayValue(classes.class_credit)}학점
              </div>
            </li>
            <li className="class-details__item">
              <strong className="class-details__label">▪️ 강의시간 </strong>
              <div className="class-details__content">
                {displayValue(classes.class_daytime)}
              </div>
            </li>
          </ul>
        </main>
      </div>

      {isUpdateMode && (
        <ClassUpdate
          classes={classes}
          submit={switchUpdateMode}
          onClose={switchUpdateMode}
          onUpdate={onUpdate}
          semester={semester}
        />
      )}
    </div>
  );
};

export default DetailModal;
