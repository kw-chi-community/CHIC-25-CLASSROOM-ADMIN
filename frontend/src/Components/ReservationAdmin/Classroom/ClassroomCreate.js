import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/reservationModal.css";
import School from "../../../image/School.svg";

const ClassroomCreate = ({ onClose, onCreate }) => {
  // 백앤드 주소
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // 모달 열릴 때 스크롤 금지되도록 설정
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // 강의실 입력값 상태 관리
  const [classroomData, setClassroomData] = useState({
    building: "",
    room: "",
    equipment: "",
    minNumberOfUsers: "",
    contactDepartment: "",
    contactLocation: "",
    contactNumber: "",
  });

  // 강의실 입력값 변경 핸들러
  const handleChange = (e) => {
    setClassroomData({ ...classroomData, [e.target.name]: e.target.value });
  };

  // 강의실 등록 요청
  const handleSubmit = async () => {
    const { building, room, contactNumber } = classroomData;

    // 필수 입력값 검사
    if (!building || !room) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    // 전화번호 형식 검사
    const phoneRegex = /^02-940-\d{4}$/;
    if (contactNumber && !phoneRegex.test(contactNumber)) {
      alert("전화번호 형식이 올바르지 않습니다. 예: 02-940-1234");
      return;
    }

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/classroom`,
        classroomData
      );
      alert("강의실 등록이 완료되었습니다.");

      if (onCreate) {
        onCreate(response.data.data);
      }

      handleClose();
    } catch (error) {
      console.error("강의실 등록 오류:", error);
      alert("강의실 등록에 실패했습니다.");
    }
  };

  const handleClose = () => {
    setClassroomData({
      building: "",
      room: "",
      equipment: "",
      minNumberOfUsers: "",
      contactDepartment: "",
      contactLocation: "",
      contactNumber: "",
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <header>
          <button className="modal-close" onClick={onClose}>
            ✖
          </button>
          <h1 className="classroom-create__title">
            <img className="book-image" src={School} alt="📖" />
            강의실 등록
            <span className="classroom-create__submit_span">
              <button
                className="classroom-create__submit"
                onClick={handleSubmit}
              >
                완료
              </button>
            </span>
          </h1>
        </header>

        {/* 강의실 정보 입력 */}
        <main className="classroom-create__main">
          <ul className="classroom-create__list">
            <li className="classroom-create__item">
              <strong className="classroom-create__label">▪️ 건물명 </strong>
              <input
                type="text"
                name="building"
                className="classroom-create__input"
                placeholder="건물명을 입력해주세요. ( 예: 비마관 )"
                value={classroomData.building}
                onChange={handleChange}
              ></input>
            </li>
            <li className="classroom-create__item">
              <strong className="classroom-create__label">▪️ 호수 </strong>
              <input
                type="text"
                name="room"
                className="classroom-create__input"
                placeholder="강의실 호수를 입력하세요. (
                예:103
                )"
                value={classroomData.room}
                onChange={handleChange}
              ></input>
            </li>
            <li className="classroom-create__item">
              <strong className="classroom-create__label">
                ▪️ 관리부서 / 학과{" "}
              </strong>
              <input
                type="text"
                name="contactDepartment"
                className="classroom-create__input"
                placeholder="강의실 관리부서 또는 학과를 입력하세요. ( 예: 정보융합학부, 전자공학과, MOOC센터... )"
                value={classroomData.contactDepartment}
                onChange={handleChange}
              ></input>
            </li>
            <li className="classroom-create__item">
              <strong className="classroom-create__label">▪️ 수용인원 </strong>
              <input
                type="number"
                name="minNumberOfUsers"
                className="classroom-create__input"
                placeholder="강의실의 최소 수용인원을 입력하세요. (예: 50)"
                value={classroomData.minNumberOfUsers}
                onChange={handleChange}
              ></input>
            </li>
            <li className="classroom-create__item">
              <strong className="classroom-create__label">▪️ 장비 </strong>
              <input
                type="text"
                name="equipment"
                className="classroom-create__input"
                placeholder="강의실에 구비되어 있는 장비를 입력하세요."
                value={classroomData.equipment}
                onChange={handleChange}
              ></input>
            </li>
            <li className="classroom-create__item">
              <strong className="classroom-create__label">▪️ 전화번호 </strong>
              <input
                type="text"
                name="contactNumber"
                className="classroom-create__input"
                placeholder="강의실 전화번호를 입력하세요. ( 예: 02-940-xxxx 형식으로 입력 )"
                value={classroomData.contactNumber}
                onChange={handleChange}
              ></input>
            </li>
          </ul>
        </main>
      </div>
    </div>
  );
};

export default ClassroomCreate;
