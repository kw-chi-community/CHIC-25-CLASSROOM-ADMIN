import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../css/reservationModal.css";
import Calender from "../../../image/Calender.svg";
import DeleteInfo from "./DeleteInfo";

const ReservationDetail = ({ rowData, onClose, fetchNewReservations }) => {
  useEffect(() => {
    console.log("ReservationDetail 컴포넌트에 전달된 rowData:", rowData);
  }, [rowData]);

  // 백앤드 주소
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // 모달 열릴 때 스크롤 금지
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // 예약 삭제 버튼 hover 상태 관리
  const [isHoveringDeleteArea, setIsHoveringDeleteArea] = useState(false);
  const hoverTimer = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(hoverTimer.current);
    setIsHoveringDeleteArea(true);
  };

  const handleMouseLeave = () => {
    hoverTimer.current = setTimeout(() => {
      setIsHoveringDeleteArea(false); // 3. 딜레이 후 false
    }, 200); // 💡 200ms 후 사라지게 설정 (필요 시 조절)
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // 삭제 요청 API
  const handleDelete = async () => {
    if (window.confirm("정말로 예약을 취소하시겠습니까?")) {
      try {
        await axios.delete(`${BACKEND_URL}/api/reserve/${rowData._id}`);
        alert("예약이 성공적으로 삭제되었습니다.");
        onClose(); // 모달 닫기

        // 최신 상태로 UI 업데이트
        if (fetchNewReservations) {
          fetchNewReservations();
        }
      } catch (error) {
        console.error("예약 삭제 실패:", error);
        alert("예약 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const isClass = rowData.tag === "class";
  const isReserve = rowData.tag === "reserve";

  // 공통 필드 예외처리
  const title = isClass
    ? (rowData.class_name ?? "정보없음")
    : `${rowData.building ?? ""} ${
        rowData.room ?? rowData.roomId ?? ""
      } 예약`.trim() || "정보없음";

  const subTitle = isClass
    ? (rowData.professor ?? `(${rowData.prof_name})` ?? "정보없음")
    : "";

  // 강의실
  const building = rowData.building ?? "";
  const room = rowData.room ?? rowData.roomId ?? "";
  const classroom = building && room ? `${building} ${room}` : "정보없음";

  // 예약 시간
  const reserveTime =
    rowData.reserve_date &&
    rowData.reserve_start_time &&
    rowData.reserve_end_time
      ? `${rowData.reserve_date}, ${rowData.reserve_start_time} - ${rowData.reserve_end_time}시`
      : "정보없음";

  // 기타 필드
  const purpose = rowData.purpose ?? "정보없음";
  const studentName = rowData.student_name ?? "정보없음";
  const studentId = rowData.student_id ?? "정보없음";
  const professor = rowData.professor ?? rowData.prof_name ?? "정보없음";
  const participantCount = rowData.participant_count ?? "정보없음";
  const phone = rowData.student_phone_number ?? "정보없음";
  const timeRange = rowData.timeRange ?? "정보없음";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="reservation-details__header">
          <button className="modal-close" onClick={onClose}>
            ✖
          </button>
          <h1 className="reservation-details__title">
            <div className="reservation-details__title-left">
              <img className="calender-image" src={Calender} alt="📅" />
              {title} {subTitle}
            </div>

            {isReserve && (
              <div
                className="delete-button-wrapper"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  className="reservation-details__delete"
                  onClick={handleDelete}
                >
                  예약 삭제
                </button>

                {isHoveringDeleteArea && (
                  <DeleteInfo phone={phone} studentName={studentName} />
                )}
              </div>
            )}
          </h1>
        </header>

        <main className="reservation-details__main">
          <ul className="reservation-details__list">
            {/* 강의인 경우 */}
            {isClass && (
              <>
                <li className="reservation-details__item">
                  <strong className="reservation-details__label">
                    ▪️ 이용 시간
                  </strong>
                  <div className="reservation-details__content">
                    {timeRange}
                  </div>
                </li>
                <li className="reservation-details__item">
                  <strong className="reservation-details__label">
                    ▪️ 강의실
                  </strong>
                  <div className="reservation-details__content">
                    {classroom}
                  </div>
                </li>
                <li className="reservation-details__item">
                  <strong className="reservation-details__label">
                    ▪️ 강의명
                  </strong>
                  <div className="reservation-details__content">
                    {rowData.class_name ?? "정보없음"}
                  </div>
                </li>
                <li className="reservation-details__item">
                  <strong className="reservation-details__label">
                    ▪️ 교수명
                  </strong>
                  <div className="reservation-details__content">
                    {professor}
                  </div>
                </li>
              </>
            )}

            {/* 예약인 경우 */}
            {isReserve && (
              <>
                <li className="reservation-details__item">
                  <strong className="reservation-details__label">
                    ▪️ 이용 시간
                  </strong>
                  <div className="reservation-details__content">
                    {reserveTime}
                  </div>
                </li>

                <li className="reservation-details__item">
                  <strong className="reservation-details__label">
                    ▪️ 이용 강의실
                  </strong>
                  <div className="reservation-details__content">
                    {classroom}
                  </div>
                </li>

                <li className="reservation-details__item">
                  <strong className="reservation-details__label">
                    ▪️ 예약목적
                  </strong>
                  <div className="reservation-details__content">{purpose}</div>
                </li>
                <li className="reservation-details__item">
                  <strong className="reservation-details__label">
                    ▪️ 예약자명
                  </strong>
                  <div className="reservation-details__content">
                    {studentName} (학번: {studentId})
                  </div>
                </li>
                <li className="reservation-details__item">
                  <strong className="reservation-details__label">
                    ▪️ 예약자 연락처
                  </strong>
                  <div className="reservation-details__content">{phone}</div>
                </li>
                <li className="reservation-details__item">
                  <strong className="reservation-details__label">
                    ▪️ 담당교수
                  </strong>
                  <div className="reservation-details__content">
                    {professor}
                  </div>
                </li>
                <li className="reservation-details__item">
                  <strong className="reservation-details__label">
                    ▪️ 총 사용자 수
                  </strong>
                  <div className="reservation-details__content">
                    {participantCount}
                  </div>
                </li>
              </>
            )}
          </ul>
        </main>
      </div>
    </div>
  );
};

export default ReservationDetail;
