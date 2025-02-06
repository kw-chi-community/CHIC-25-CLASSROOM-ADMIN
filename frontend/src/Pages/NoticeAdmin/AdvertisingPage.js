import React, { useState } from "react";
import "../css/Pages.css";
import "./css/advertisingPage.css";
import Sidebar from "../../Components/NoticeAdmin/NoticeSidebar";
import AdvertisingRow from "../../Components/NoticeAdmin/AdvertisingRow";
import AdvertisingCreate from "../../Components/NoticeAdmin/AdvertisingCreate";
import AdvertisingDelete from "../../Components/NoticeAdmin/AdvertisingDelete";

const AdvertisingPage = () => {
  // 사이드바 상태 관리
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  // 등록 모달창 상태 관리
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const toggleCreateModal = () => setCreateModalOpen((prev) => !prev);

  // 삭제 모드 상태 관리
  const [isDeleteMode, setDeleteMode] = useState(false);
  const switchDeleteMode = () => setDeleteMode((prev) => !prev);

  // 공지글 데이터 (임시)
  const AdvertisingList = [
    {
      id: 1,
      date: "2025년 1월 6일",
      title: "2025년 신입생 특별영어과정",
      writer: "관리자",
      startdate: "2025년 1월 6일",
      enddate: "2025년 1월 13일",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
    {
      id: 2,
      date: "2025년 1월 7일",
      title: "자율전공학부 재학생 멘토 모집 안내",
      writer: "관리자",
      startdate: "2025년 1월 7일",
      enddate: "2025년 1월 13일",
      content:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
    },
    {
      id: 3,
      date: "2025년 1월 8일",
      title: "2025년 탄소 중립 실천 공모전",
      writer: "관리자",
      startdate: "2025년 1월 8일",
      enddate: "2025년 1월 13일",
      content: "ㅂㅈㄷㄱ쇼ㅕㅑㅐㅔㅁㄴㅇㄹ호ㅓㅏㅣㅋㅌㅊ퓨ㅜㅡ",
    },
  ];

  // 삭제 모드
  if (isDeleteMode) {
    return (
      <AdvertisingDelete
        advertising={AdvertisingList}
        submit={switchDeleteMode}
        onClose={switchDeleteMode}
      />
    );
  }

  return (
    <div className="div">
      <div className={`div ${isSidebarOpen ? "shifted" : ""}`}>
        <header className="advertising-page__header">
          <h1 className="advertising-page__title">홍보/광고</h1>
          <button
            className="advertising-page__action-button"
            onClick={toggleCreateModal}
          >
            홍보/광고글 생성
          </button>
          <button
            className="advertising-page__action-button"
            onClick={switchDeleteMode}
          >
            홍보/광고글 삭제
          </button>
        </header>

        <nav className="advertising-page__search-nav">
          <ul className="advertising-page__search-list">
            <li className="advertising-page__search-item">
              작성일
              <input
                type="date"
                className="advertising-page__search-input"
                placeholder="작성일 검색"
              />
            </li>
            <li className="advertising-page__search-item">
              제목
              <input
                type="text"
                className="advertising-page__search-input"
                placeholder="제목 검색"
              />
            </li>
            <li className="advertising-page__search-item">
              적용시작일
              <input
                type="date"
                className="advertising-page__search-input"
                placeholder="적용시작일 검색"
              />
            </li>
            <li className="advertising-page__search-item">
              적용종료일
              <input
                type="date"
                className="advertising-page__search-input"
                placeholder="적용종료일 검색"
              />
            </li>
            <li className="advertising-page__search-item">
              상태
              <select
                name="advertising-status"
                className="advertising-page__status-select"
              >
                <option value="exposure" selected>
                  적용됨
                </option>
                <option value="not-exposure">적용종료</option>
              </select>
            </li>
            <li className="advertising-page__search-item">
              작성자
              <input
                type="text"
                className="advertising-page__search-input"
                placeholder="작성자 검색"
              />
            </li>
          </ul>
        </nav>

        <main className="advertising-page__main">
          <table className="advertising-page__table">
            <tbody>
              {AdvertisingList.map((advertising, index) => (
                <AdvertisingRow key={index} advertising={advertising} />
              ))}
            </tbody>
          </table>
        </main>
      </div>

      {/* 사이드바 컴포넌트 */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* 등록 모달창 컴포넌트 */}
      {isCreateModalOpen && <AdvertisingCreate onClose={toggleCreateModal} />}
    </div>
  );
};

export default AdvertisingPage;
