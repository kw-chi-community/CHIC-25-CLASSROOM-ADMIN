import React, { useState } from "react";
import "./css/noticeRow.css";
import NoticeDetail from "./NoticeDetail";

const NoticeRow = ({ notice, onUpdate, formatDate }) => {
  const [showDetail, setShowDetail] = useState(false);

  return (
    <>
      {/* 공지 리스트 행 */}
      <div className="notice-page__row_div" onClick={() => setShowDetail(true)}>
        <table className="notice-page__table">
          <tbody>
            <tr className="notice-page__row">
              <td className="notice-page__table-cell" colSpan="2">
                <span
                  className={`notice-page__type-${
                    notice.type ? "pop-up" : "fix"
                  }`}
                >
                  {notice.type ? "팝업" : "고정"}
                </span>{" "}
                {notice.title}
              </td>
            </tr>
            <tr className="notice-page__row">
              <td className="notice-page__table-date">
                <span className="notice-page__label">등록일: </span>
                {formatDate ? formatDate(notice.created_at) : notice.created_at}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 상세보기 모달 */}
      {showDetail && (
        <NoticeDetail
          notice={notice}
          onClose={() => setShowDetail(false)}
          onUpdate={onUpdate}
          formatDate={formatDate}
        />
      )}
    </>
  );
};

export default NoticeRow;
