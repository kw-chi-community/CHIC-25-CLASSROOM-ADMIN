import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/reservationModal.css";
import Book from "../../../image/Book.svg";

const ClassCreate = ({ onClose, onCreate, semester }) => {
  // 백앤드 주소
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // 모달 열릴 때 스크롤 금지되도록 설정
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // 강의 입력값 상태 관리
  const [classData, setClassData] = useState({
    class_idx: "",
    classroom_idx: "",
    class_name: "",
    prof_name: "",
    class_credit: "",
    class_daytime: "",
    semester: semester || "", // 기본값 == prop로 받은 값
  });

  // 강의 입력값 변경 핸들러
  const handleChange = (e) => {
    setClassData({ ...classData, [e.target.name]: e.target.value });
  };

  // 강의 등록 요청
  const handleSubmit = async () => {
    // 모든 항목이 채워지지 않았을 경우 예외처리
    if (
      !classData.class_idx ||
      !classData.classroom_idx ||
      !classData.class_name ||
      !classData.prof_name ||
      !classData.class_credit ||
      !classData.class_daytime ||
      !classData.semester
    ) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/class/${semester}`,
        classData
      );
      alert("강의 등록이 완료되었습니다.");

      console.log("강의 등록 성공:", response.data);

      if (onCreate) {
        onCreate(response.data.class);
      }
      handleClose();
    } catch (error) {
      console.error("강의실 등록 오류:", error);
      alert("강의 등록에 실패했습니다.");
    }
  };

  const handleClose = () => {
    setClassData({
      class_idx: "",
      classroom_idx: "",
      class_name: "",
      prof_name: "",
      class_credit: "",
      class_daytime: "",
    });
    onClose();
  };

  // 엔터키 눌러도 등록 완료되게 하기
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header>
          <button className="modal-close" onClick={onClose}>
            ✖
          </button>
          <h1 className="class-create__title">
            <img className="book-image" src={Book} alt="📖" />
            강의 등록
            <span className="class-create__submit_span">
              <button className="class-create__submit" onClick={handleSubmit}>
                등록
              </button>
            </span>
          </h1>
        </header>

        <main className="class-create__main">
          <ul className="class-create__list">
            <li className="class-create__item">
              <strong className="class-create__label">▪️ 학기 </strong>
              <input
                type="text"
                name="semester"
                className="class-create__input"
                placeholder="학기를 입력하세요. (ex. 2025-1)"
                value={classData.semester}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
            </li>

            <li className="class-create__item">
              <strong className="class-create__label">▪️ 학정번호 </strong>
              <input
                type="text"
                name="class_idx"
                className="class-create__input"
                placeholder="강좌 학정번호를 입력하세요."
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              ></input>
            </li>
            <li className="class-create__item">
              <strong className="class-create__label">▪️ 호수 </strong>
              <input
                type="text"
                name="classroom_idx"
                className="class-create__input"
                placeholder="강의실 호수를 입력하세요. (ex.103)"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              ></input>
            </li>
            <li className="class-create__item">
              <strong className="class-create__label">▪️ 강좌명 </strong>
              <input
                type="text"
                name="class_name"
                className="class-create__input"
                placeholder="강좌명을 입력하세요."
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              ></input>
            </li>
            <li className="class-create__item">
              <strong className="class-create__label">▪️ 교수명 </strong>
              <input
                type="text"
                name="prof_name"
                className="class-create__input"
                placeholder="교수명을 입력하세요."
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              ></input>
            </li>
            <li className="class-create__item">
              <strong className="class-create__label">▪️ 학점 </strong>
              <input
                type="int"
                name="class_credit"
                className="class-create__input"
                placeholder="취득 학점을 입력하세요. (ex. 3)"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              ></input>
            </li>
            <li className="class-create__item">
              <strong className="class-create__label">▪️ 강의시간 </strong>
              <input
                type="text"
                name="class_daytime"
                className="class-create__input"
                placeholder="강의 시간을 입력하세요. (ex. 월1,수2 형식으로 입력하세요.)"
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              ></input>
            </li>
          </ul>
        </main>
      </div>
    </div>
  );
};

export default ClassCreate;
