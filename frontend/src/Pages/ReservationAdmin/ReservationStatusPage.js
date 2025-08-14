import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Calendar from "../../components/ReservationAdmin/Reservation/Calendar";
import "../css/Pages.css";
import "./css/roomReservationStatus.css";
import Sidebar from "../../components/Sidebar";
import NewReservation from "../../components/ReservationAdmin/Reservation/NewReservation";
import LogoutButton from "../../components/LogoutButton";
import KW_logo from "../../image/KW_logo.svg";
import moment from "moment";
import ReservationSearchBar from "../../components/ReservationAdmin/Reservation/ReservationSearchBar";

const RoomReservationStatusPage = () => {
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // 페이지 이동 네비게이션
  const navigate = useNavigate();

  // 오늘 날짜 (문자열) 가져오기
  const today = moment().format("YYYY-MM-DD");

  // 필터링을 위해 선택된 학기, 학기 리스트 상태 관리
  const [semester, setSemester] = useState("2025-2");
  // 서버에서 내려온 전체 객체 배열 보관: [{ semester, start_date, end_date }, ...]
  const [semesterOptions, setSemesterOptions] = useState([]);
  // 화면 상단 제목 표기를 위해 캘린더 가시범위 시작일 보관
  const [titleDate, setTitleDate] = useState(today);

  // 에러 값 상태 관리
  const [hasSemesterError, setHasSemesterError] = useState(false);
  const [hasServerError, setHasServerError] = useState(false);

  // 사이드바 상태 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // 새 예약 모달 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // 새 예약 상태
  const [newReservations, setNewReservations] = useState([]);

  // 캘린더에 전달할 학기 전체 이벤트 rows (백엔드 원본 그대로)
  const [rows, setRows] = useState([]);
  const [isLoadingRows, setIsLoadingRows] = useState(false);

  // 학기 정렬 (ex. ["2025-겨울", "2025-2", "2025-여름", "2025-1", "2024-겨울", "2024-2"])
  // collections가 이제 문자열이 아니라 객체이므로 semester 필드 기준으로 정렬
  const sortSemesterList = (list) => {
    const semesterOrder = { 겨울: 4, 2: 3, 여름: 2, 1: 1 };
    return [...list].sort((a, b) => {
      const [aYear, aSem] = a.semester.split("-");
      const [bYear, bSem] = b.semester.split("-");
      if (parseInt(aYear) !== parseInt(bYear)) {
        return parseInt(bYear) - parseInt(aYear);
      }
      return (semesterOrder[bSem] || 0) - (semesterOrder[aSem] || 0);
    });
  };

  // 학기 데이터 요청
  const fetchSemester = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/class/collections`);
      const data = response.data;

      console.log("학기 API 전체 응답 데이터:", data);

      const raw = Array.isArray(data.collections) ? data.collections : [];
      if (raw.length === 0) {
        setHasSemesterError(true);
        return;
      }

      // 정렬
      const sorted = sortSemesterList(raw);

      setSemesterOptions(sorted);
      setSemester(sorted[0].semester); // 기본 선택

      // 초기 제목 날짜: 오늘이 학기 범위 밖이면 학기 시작일로 보정
      const start = sorted[0].start_date;
      const end = sorted[0].end_date;
      if (start && end) {
        if (today < start || today > end) {
          setTitleDate(start);
        } else {
          setTitleDate(today);
        }
      } else {
        setTitleDate(today);
      }

      setHasSemesterError(false);
    } catch (error) {
      console.error("학기 목록을 가져오는 중 오류 발생:", error);
      setHasSemesterError(true);
    }
  };

  // 학기 전체 이벤트 요청 (백엔드 단일 엔드포인트 사용)
  const fetchSemesterRows = async (sem) => {
    if (!sem) return;
    try {
      setIsLoadingRows(true);
      setHasServerError(false);

      const url = `${BACKEND_URL}/api/appointment-status/${encodeURIComponent(
        sem
      )}`;
      const res = await axios.get(url);
      const resultRows = Array.isArray(res.data?.results)
        ? res.data.results
        : [];

      // ⛳️ 응답 전체 확인
      console.log(
        `📌 ${sem} 학기 전체 이벤트 rows (${resultRows.length}건):`,
        resultRows
      );

      setRows(resultRows);
    } catch (err) {
      console.error("학기 전체 이벤트 불러오기 실패:", err);
      setHasServerError(true);
      setRows([]);
    } finally {
      setIsLoadingRows(false);
    }
  };

  // JWT 토큰 확인 및 리다이렉트
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/");
      return;
    }
    fetchSemester();
    fetchNewReservations();
  }, [navigate]);

  // 학기 변경 시 학기 전체 이벤트 재요청
  useEffect(() => {
    if (!semester) return;
    fetchSemesterRows(semester);
  }, [semester]);

  // 예약 리스트 가져오기 (새 예약 알림용)
  const fetchNewReservations = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/api/reserve/check`);
      const data = response.data?.data || [];
      setNewReservations(data);
    } catch (error) {
      console.error("새 예약 불러오기 실패:", error);
    }
  };

  // 새 예약 확인 (읽음 처리)
  const markAsChecked = async (reservationId) => {
    try {
      await axios.post(`${BACKEND_URL}/api/reserve/${reservationId}/check`);
      setNewReservations((prev) =>
        prev.map((r) =>
          r._id === reservationId ? { ...r, status: "checked" } : r
        )
      );
    } catch (error) {
      console.error("예약 확인 처리 실패:", error);
    }
  };

  // 현재 선택된 학기의 기간 메타 찾기
  const currentMeta = semesterOptions.find((s) => s.semester === semester);
  const startDate = currentMeta?.start_date || null;
  const endDate = currentMeta?.end_date || null;

  // 학기 변경 핸들러
  const handleSemesterChange = (e) => {
    const next = e.target.value;
    setSemester(next);

    const meta = semesterOptions.find((s) => s.semester === next);
    if (meta?.start_date && meta?.end_date) {
      // 오늘이 범위 밖이면 학기 시작일로, 아니면 오늘 유지
      if (today < meta.start_date || today > meta.end_date) {
        setTitleDate(meta.start_date);
      } else {
        setTitleDate(today);
      }
    }
  };

  return (
    <div className="div">
      {/* 헤더 */}
      <div className="reservation-status__header">
        <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <h1 className="reservation-status__title">
          <img src={KW_logo} alt="⏰" />
          KW 강의실 사용현황
        </h1>
        <p className="reservationpage-detail">
          : 현재 강의실 예약현황을 확인할 수 있는 페이지 입니다.
        </p>
        <div className="reservation-status__nav">
          <button onClick={openModal}>
            새 예약{" "}
            <span>
              {newReservations.filter((item) => item.status === "new").length}
            </span>
          </button>
          <LogoutButton />
        </div>
      </div>

      {/* 검색바 */}
      <ReservationSearchBar
        semester={semester}
        // 기존 컴포넌트는 문자열 배열을 기대하므로 코드만 전달
        semesterList={semesterOptions.map((s) => s.semester)}
        handleSemesterChange={handleSemesterChange}
        hasSemesterError={hasSemesterError}
      />

      {/* 예약 현황 캘린더 */}
      <div className="reservation-status__main">
        <Calendar
          semester={semester} // 학기 코드 (표시용/로그용)
          date={titleDate} // 상단 제목 표기용 날짜
          startDate={startDate} // 학기 시작 (YYYY-MM-DD | null)
          endDate={endDate} // 학기 종료 (YYYY-MM-DD | null)
          rows={rows} // 백엔드가 내려준 학기 전체 이벤트
          isLoading={isLoadingRows} // 로딩 상태 표시용
          hasServerError={hasServerError} // 에러 메시지 표시용
          onDateChange={(newISO) => setTitleDate(newISO)} // 캘린더 가시범위 시작일 반영
        />
      </div>

      {/* 사이드바가 열릴 때 표시되는 오버레이 */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {isModalOpen && (
        <NewReservation
          onClose={closeModal}
          onCheck={markAsChecked}
          reservation={newReservations}
          fetchNewReservations={fetchNewReservations}
        />
      )}
    </div>
  );
};

export default RoomReservationStatusPage;
