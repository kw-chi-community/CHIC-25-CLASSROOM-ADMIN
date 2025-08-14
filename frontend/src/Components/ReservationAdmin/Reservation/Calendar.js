import React, { useMemo, useState } from "react";
import ReservationDetail from "./ReservationDetail";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import koLocale from "@fullcalendar/core/locales/ko";

/**
 * 캘린더 컴포넌트 (학기 전체 rows 렌더)
 * - props:
 *   - semester: "YYYY-N"
 *   - date: 상단 제목용 YYYY-MM-DD
 *   - startDate/endDate: 학기 기간(YYYY-MM-DD) → validRange로 사용
 *   - rows: 백엔드가 내려준 학기 전체 이벤트 배열
 *   - isLoading: 로딩 상태
 *   - hasServerError: 서버 에러 상태
 *   - onDateChange: 가시 범위 시작일을 상위로 전달
 */
const Calendar = ({
  semester,
  date,
  startDate,
  endDate,
  rows = [],
  isLoading = false,
  hasServerError = false,
  onDateChange,
}) => {
  // 모달 상태 + 선택 이벤트 데이터
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedRowData, setSelectedRowData] = useState(null);

  // 날짜 문자열 → "YYYY년 M월 D일"
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const [year, month, day] = dateString.split("-");
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  };

  // 서버 rows -> FullCalendar 이벤트 매핑 (메모이제)
  const events = useMemo(() => {
    return (rows || [])
      .map((r, idx) => {
        const isClass = r.tag === "class";
        const startTime = isClass ? r.start_time : r.reserve_start_time;
        const endTime = isClass ? r.end_time : r.reserve_end_time;
        if (!r.date || !startTime || !endTime) return null;

        const startISO = `${r.date}T${startTime}`;
        const endISO = `${r.date}T${endTime}`;
        const titleMain = isClass ? r.class_name || "" : r.purpose || "";
        const sub = isClass ? r.prof_name : r.name;
        const bg = isClass ? "#1663fc" : "#fc9935";

        return {
          id: r._id || `${r.building}-${r.room}-${startISO}-${idx}`,
          title: `[${r.building} ${r.room}] ${titleMain}${sub ? ` - ${sub}` : ""}`,
          start: startISO,
          end: endISO,
          backgroundColor: bg,
          borderColor: bg,
          extendedProps: {
            tag: r.tag,
            raw: r,
            building: r.building,
            roomId: r.room,
            startTime,
            endTime,
            timeRange: `${startTime} - ${endTime}`,
          },
        };
      })
      .filter(Boolean);
  }, [rows]);

  // 상세 모달 열기 이벤트
  const handleEventClick = (clickInfo) => {
    const { event } = clickInfo;
    const { extendedProps } = event;
    const r = extendedProps?.raw || {};
    const startTime = extendedProps?.startTime;
    const endTime = extendedProps?.endTime;

    const rowData = {
      ...r,
      tag: extendedProps?.tag,
      building: extendedProps?.building,
      roomId: extendedProps?.roomId,
      timeRange: `${startTime} - ${endTime}`,
    };

    setSelectedRowData(rowData);
    setDetailModalOpen(true);
  };

  // FullCalendar validRange.end는 exclusive. 마지막 날 포함하려고 +1일
  const endExclusive = useMemo(() => {
    if (!endDate) return undefined;
    const d = new Date(endDate);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, [endDate]);

  return (
    <div className="timetable-div">
      {/* 제목 */}
      <span className="table-title">
        {formatDate(date)} <strong>[전체 강의실]</strong> 이용 현황
      </span>

      {/* 로딩/에러/빈 데이터 처리 */}
      {isLoading ? (
        <div className="no-result" style={{ padding: 24, textAlign: "center" }}>
          데이터를 불러오는 중입니다…
        </div>
      ) : hasServerError ? (
        <div className="no-result" style={{ padding: 24, textAlign: "center" }}>
          서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.
        </div>
      ) : events.length === 0 ? (
        <div className="no-result" style={{ padding: 24, textAlign: "center" }}>
          등록된 일정이 없습니다.
        </div>
      ) : null}

      {/* FullCalendar 본문 */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 12 }}>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="dayGridMonth" // ✅ 디폴트: 월 뷰
          initialDate={startDate || date} // 학기 시작일이 있으면 거기로
          locales={[koLocale]}
          locale="ko"
          // ✅ 학기 범위로 탐색 제한
          validRange={
            startDate && endExclusive
              ? { start: startDate, end: endExclusive }
              : undefined
          }
          // ✅ 정적 배열로 이벤트 렌더 (range API 호출 없음)
          events={events}
          // ✅ 캘린더 내비게이션/뷰 전환 시 상단 제목용 날짜를 부모에 전달
          datesSet={(arg) => {
            if (typeof onDateChange === "function") {
              const d = arg.start;
              const y = d.getFullYear();
              const m = String(d.getMonth() + 1).padStart(2, "0");
              const dd = String(d.getDate()).padStart(2, "0");
              onDateChange(`${y}-${m}-${dd}`);
            }
          }}
          eventClick={handleEventClick}
          // 시간축(운영 시간에 맞게 조정) — 주/일 뷰에서만 의미
          slotMinTime="08:00:00"
          slotMaxTime="22:00:00"
          allDaySlot={false}
          nowIndicator={true}
          stickyHeaderDates={true}
          height="auto"
          // 일정 렌더링 커스터마이즈 (배지/신청자 추가 등)
          eventContent={(arg) => {
            const { tag, raw, building, roomId } =
              arg.event.extendedProps || {};
            const isClass = tag === "class";
            const timeText = arg.timeText; // "10:00 - 12:00" 등
            const titleMain = isClass
              ? raw?.class_name || ""
              : raw?.purpose || "";
            const sub = isClass ? raw?.prof_name : raw?.name;

            return (
              <div style={{ fontSize: 12, lineHeight: 1.2 }}>
                <div style={{ fontWeight: 600 }}>
                  {timeText} {titleMain}
                </div>
                <div style={{ opacity: 0.85 }}>
                  {isClass ? "강의" : "예약"} · [{building} {roomId}]
                  {sub ? ` · ${sub}` : ""}
                </div>
              </div>
            );
          }}
          // 상태별 클래스 (원하면 CSS 오버라이드로 색 커스텀)
          eventClassNames={(arg) => {
            const { tag, raw } = arg.event.extendedProps || {};
            const cls = [];
            if (tag === "class") cls.push("is-class");
            if (tag === "reserve") cls.push("is-reserve");
            if (raw?.status === "pending") cls.push("is-pending");
            if (raw?.status === "rejected") cls.push("is-rejected");
            return cls;
          }}
        />
      </div>

      {/* 디테일 모달 */}
      {isDetailModalOpen && (
        <ReservationDetail
          onClose={() => {
            setSelectedRowData(null);
            setDetailModalOpen(false);
          }}
          rowData={selectedRowData}
        />
      )}
    </div>
  );
};

export default Calendar;
