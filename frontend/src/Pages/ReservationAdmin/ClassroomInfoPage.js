import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../css/Pages.css";
import "./css/classroomInfoUpdatePage.css";
import Sidebar from "../../components/Sidebar";
import ClassroomBuilding from "../../components/ReservationAdmin/Classroom/ClassroomBuilding";
import ClassroomCreate from "../../components/ReservationAdmin/Classroom/ClassroomCreate";
import LogoutButton from "../../components/LogoutButton";
import KW_logo from "../../image/KW_logo.svg";

const ClassroomInfoPage = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // 페이지 이동 네비게이션
  const navigate = useNavigate();

  // 강의실 정보 상태 관리
  const [classroomInfo, setClassroomInfo] = useState([]);

  // 사이드바 상태 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // 등록 모달창 상태 관리
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const toggleCreateModal = () => setCreateModalOpen((prev) => !prev);

  // 검색값 상태 관리
  const [searchIdx, setIdx] = useState("");
  const [searchBuilding, setBuilding] = useState("");

  // 검색창에 값 입력하면 상태 변환
  const onChangeIdx = (e) => setIdx(e.target.value);
  const onChangeBuilding = (e) => {
    setBuilding(e.target.value);
    setIdx(""); // 건물 변경 시 호수 초기화
  };

  // JWT 토큰 확인 및 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다."); // 토큰이 없으면 알림창을 띄움
      navigate("/"); // 로그인 페이지로 리다이렉트
    }

    // 강의실 정보 데이터 요청
    const fetchClassrooms = async () => {
      try {
        const response = await axios.get(`${BACKEND_URL}/api/classroom`);
        setClassroomInfo(response.data);
      } catch (error) {
        console.error("강의실 데이터를 가져오는 중 오류 발생:", error);
      }
    };

    fetchClassrooms();
  }, [navigate]);

  // 건물 목록 (중복 제거)
  const buildingList = [...new Set(classroomInfo.map((c) => c.building))];

  // 선택된 건물에 맞는 호수 목록
  const roomList = searchBuilding
    ? classroomInfo
        .filter((c) => c.building === searchBuilding)
        .map((c) => c.room)
        .filter((room, idx, self) => self.indexOf(room) === idx) // 중복 제거
        .sort((a, b) => a - b) // 정렬 (옵션)
    : [];

  // 검색 결과 화면에 반영
  const filteredClassrooms = classroomInfo.filter((classroom) => {
    return (
      (searchIdx === "" || classroom.room?.toString() === searchIdx) &&
      (searchBuilding === "" || classroom.building?.includes(searchBuilding))
    );
  });

  // 수정,삭제 결과 새로고침 없이 화면에 바로 반영
  const handleClassroomUpdate = (updatedClassroom, building, room) => {
    if (updatedClassroom === null) {
      setClassroomInfo((prevInfo) =>
        prevInfo.filter(
          (classroom) =>
            classroom.building !== building || classroom.room !== room
        )
      );
    } else {
      setClassroomInfo((prevInfo) =>
        prevInfo.map((classroom) =>
          classroom.building === updatedClassroom.building &&
          classroom.room === updatedClassroom.room
            ? updatedClassroom
            : classroom
        )
      );
    }
  };

  // 강의실 등록 새로고침 없이 화면에 바로 반영
  const handleClassroomCreate = (newClassroom) => {
    setClassroomInfo((prevInfo) => [...prevInfo, newClassroom]);
    setIdx("");
    setBuilding("");
  };

  return (
    <div className="div">
      {/* 헤더 */}
      <div className="classroom-info-update__header">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <h1 className="classroom-info-update__title">
          <img src={KW_logo} alt="🏫" />
          KW 강의실 정보 관리
        </h1>
        <p className="classroompage-detail">
          : 예약 가능한 강의실 정보를 열람하는 페이지 입니다.
        </p>
        <div className="classroom-info-update__nav">
          <button
            className="classroom-info-update__action-create"
            onClick={toggleCreateModal}
          >
            강의실 등록
          </button>
          <LogoutButton />
        </div>
      </div>

      {/* 강의실 검색바 */}
      <div className="classroom-info__search">
        <ul className="classroom-info__search-list">
          {/* 건물명 선택 */}
          <li className="classroom-info__search-item">
            <label className="classroom-info__search-label">건물명</label>
            <select
              className="classroom-info__search-input"
              value={searchBuilding}
              onChange={onChangeBuilding}
            >
              <option value="">전체</option>
              {buildingList.map((building) => (
                <option key={building} value={building}>
                  {building}
                </option>
              ))}
            </select>
          </li>

          {/* 호수 선택 */}
          <li className="classroom-info__search-item">
            <label className="classroom-info__search-label">호수</label>
            <select
              className="classroom-info__search-input"
              value={searchIdx}
              onChange={onChangeIdx}
              disabled={!searchBuilding} // 건물 먼저 선택해야 활성화
            >
              {!searchBuilding ? (
                <option value="">건물명을 먼저 선택해주세요</option>
              ) : (
                <>
                  <option value="">전체</option>
                  {roomList.map((room) => (
                    <option key={room} value={room}>
                      {room}
                    </option>
                  ))}
                </>
              )}
            </select>
          </li>
        </ul>
      </div>

      {/* 강의실 정보 리스트 */}
      <div className="classroom-info-update__main">
        <ClassroomBuilding
          classrooms={filteredClassrooms}
          onUpdate={handleClassroomUpdate}
        />
      </div>

      {/* 사이드바가 열릴 때 표시되는 오버레이 */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* 등록 모달창 */}
      {isCreateModalOpen && (
        <ClassroomCreate
          onClose={toggleCreateModal}
          onCreate={handleClassroomCreate}
        />
      )}
    </div>
  );
};

export default ClassroomInfoPage;
