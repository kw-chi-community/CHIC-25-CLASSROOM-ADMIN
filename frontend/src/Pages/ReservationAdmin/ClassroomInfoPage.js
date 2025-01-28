import React, { useState } from "react";
import "../css/Pages.css";
import "./css/classroomInfoUpdatePage.css";
import Sidebar from "../../Components/ReservationAdmin/ReservationSidebar";
import ClassroomRow from "../../Components/ReservationAdmin/ClassroomRow";
import ClassroomCreate from "../../Components/ReservationAdmin/ClassroomCreate";

const ClassroomInfoPage = () => {
  // 사이드바 상태 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // 등록 모달창 상태 관리
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const CreateModal = () => setCreateModalOpen((prev) => !prev);

  // 삭제 모달창 상태 관리
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const DeleteModal = () => setDeleteModalOpen((prev) => !prev);

  // 강의실 정보 데이터 (임시)
  const classroomInfo = [
    {
      number: "103 호",
      name: "정보융합학부실습실1",
      explanation: "정보융합학부 실습실입니다. 일반 PC가 구비되어 있습니다.",
    },
    {
      number: "104 호",
      name: "정보융합학부실습실2",
      explanation: "iMAC 프로 PC 40대가 구비된 실습실 입니다.",
    },
    {
      number: "205 호",
      name: "강의실",
      explanation:
        "SW융합대학의 강의가 이루어지는 곳입니다. 녹화강의복습시스템이 구비되어 있습니다.",
    },
    {
      number: "705 호",
      name: "정보융합학부 대학원 강의실",
      explanation: "정보융합학부 대학원 강의실 입니다.",
    },
  ];

  return (
    <div className="div">
      <div className={`div ${isSidebarOpen ? "shifted" : ""}`}>
        <header className="classroom-info-update__header">
          <h1 className="classroom-info-update__title">강의실 정보 업데이트</h1>

          <button
            className="student-info-update__action-button"
            onClick={CreateModal}
          >
            등록
          </button>
          <button
            className="student-info-update__action-button"
            onClick={DeleteModal}
          >
            삭제
          </button>
        </header>

        <main className="classroom-info-update__main">
          <table className="classroom-info-update__table">
            <tbody>
              {classroomInfo.map((classroom, index) => (
                <ClassroomRow key={index} classroom={classroom} />
              ))}
            </tbody>
          </table>
        </main>
      </div>

      {/* 사이드바 컴포넌트 */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* 등록 모달창 컴포넌트 */}
      {isCreateModalOpen && <ClassroomCreate onClose={CreateModal} />}

      {/* 삭제 모달창 컴포넌트 */}
      {}
    </div>
  );
};

export default ClassroomInfoPage;
