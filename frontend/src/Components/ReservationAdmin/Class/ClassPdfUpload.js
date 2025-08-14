import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../css/reservationModal.css";
import Calendar from "./Calendar";
import Book from "../../../image/Book.svg";

const ClassPdfUpload = ({ onClose }) => {
  // 백앤드 주소
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  // 개강, 종강 날짜 상태 관리
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // 모달 열릴 때 스크롤 금지되도록 설정
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // 입력 상태 관리
  const [semester, setSemester] = useState("");
  const [file, setPdfFile] = useState(null);

  // 로딩 상태 관리
  const [isUploading, setIsUploading] = useState(false);

  // PDF 파일 형식이 아닐 경우 예외처리
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type !== "application/pdf") {
      alert("PDF 파일만 업로드할 수 있습니다.");
      return;
    }
    setPdfFile(file);
  };

  const handleSubmit = async () => {
    // 입력 칸 공백 검사
    if (!semester || !file || !startDate || !endDate) {
      alert("학기, 개강일, 종강일, PDF 파일을 모두 입력해주세요.");
      return;
    }

    // 학기 형식 검사
    const semesterFormat = /^\d{4}-(1|2|여름|겨울)$/;
    if (!semesterFormat.test(semester)) {
      alert(
        "학기 형식이 올바르지 않습니다.\n'2025-1', '2025-2', '2025-여름', '2025-겨울' 형식으로 입력해주세요."
      );
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("pdf", file);
      formData.append("semester", semester);
      formData.append("start_date", startDate);
      formData.append("end_date", endDate);

      const uploadResponse = await axios.post(
        `${BACKEND_URL}/api/upload`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const result = uploadResponse.data;

      // 서버에서 success 필드가 true로 왔는지 확인
      if (result && result.success) {
        alert(`${semester} 시간표 등록이 완료되었습니다.`);
        handleClose();
      } else if (result && result.message) {
        alert(
          `시간표 파일이 서버에 전송 되었지만, 프로그램 문제로 시간표 등록이 정상적으로 되지 않을 수 있습니다. 관리자에게 문의하세요. :\n${result.message}`
        );
      } else {
        alert("서버 응답이 정상적이지 않습니다. 서버 관리자에게 문의하세요.");
      }
    } catch (error) {
      console.error(`${semester} 시간표 등록 오류:`, error);

      // 서버에서 오류 응답을 보냈을 경우 메시지 추출
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        alert(`시간표 등록에 실패했습니다:\n${error.response.data.message}`);
      } else {
        alert(`${semester} 시간표 등록에 실패했습니다. 다시 시도해주세요.`);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // 입력값 초기화 후 모달창 닫기
  const handleClose = () => {
    setSemester("");
    setPdfFile(null);
    onClose();
  };

  // 엔터키 눌러도 등록 완료 되게
  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="class-create__header">
          <button className="modal-close" onClick={onClose}>
            ✖
          </button>
          <h1 className="class-create__title">
            <img className="book-image" src={Book} alt="📖" />
            시간표 PDF 파일 업로드
            <span className="classroompage-detail">
              : 업로드한 시간표가 페이지에 반영되기까지 최소 5시간 이상
              소요됩니다.
            </span>
            <span className="class-create__submit_span">
              <button
                className={`class-create__submit ${
                  isUploading ? "disabled" : ""
                }`}
                onClick={handleSubmit}
                disabled={isUploading}
              >
                등록
              </button>
            </span>
          </h1>
        </header>

        <main className="class-create__main">
          <ul className="class-create__list">
            <li className="class-create__item">
              <strong className="class-create-pdf_label">▪️ 년도-학기 </strong>
              <input
                type="text"
                placeholder=" '2025-1', '2025-2', '2025-여름', '2025-겨울' 형식으로 입력하세요."
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                onKeyDown={handleKeyDown}
                className="class-create__input"
              />
            </li>

            <li className="class-create__item">
              <strong className="class-create-pdf_label">
                ▪️ 개강 - 종강일
              </strong>
              <div className="date-range-row">
                <Calendar
                  onChange={setStartDate}
                  selectedDate={startDate}
                  onDateChange={(formattedDate) => {
                    console.log(formattedDate);
                  }}
                />
                <span>-</span>
                <Calendar
                  onChange={setEndDate}
                  selectedDate={endDate}
                  onDateChange={(formattedDate) => {
                    console.log(formattedDate);
                  }}
                />
              </div>
            </li>

            <li className="class-create__item">
              <strong className="class-create-pdf_label">
                ▪️ 강의 계획서 (.pdf)
              </strong>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                className="class-create__input"
              />
            </li>
          </ul>
        </main>

        {isUploading && (
          <div className="uploading-text">강의 데이터 등록 중...</div>
        )}
      </div>
    </div>
  );
};

export default ClassPdfUpload;
