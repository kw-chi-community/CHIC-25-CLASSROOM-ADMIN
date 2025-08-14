import React, { useState } from "react";
import "../css/deleteInfo.css";
import Copy from "../../../image/Copy.svg";
import CopySubmit from "../../../image/CopySubmit.svg";

const DeleteInfo = ({ phone, studentName }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!phone) return;
    navigator.clipboard.writeText(phone).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // 1.5초 후 원래대로
    });
  };

  return (
    <div className="delete-info-tooltip">
      <p className="delete-info-text">! 예약 삭제 시 복구할 수 없습니다.</p>
      {phone && (
        <div className="delete-info-contact">
          <span className="contact-label">예약자 [{studentName}] 연락처</span>
          <span className="contact-number" onClick={handleCopy}>
            {phone}{" "}
            <img
              src={copied ? CopySubmit : Copy}
              alt={copied ? "복사 완료" : "복사"}
              className="copy-icon"
            />
          </span>

          <span className="contact-label">
            로 예약이 취소되었다는 안내 메세지를 보내주세요.
          </span>
        </div>
      )}
    </div>
  );
};

export default DeleteInfo;
