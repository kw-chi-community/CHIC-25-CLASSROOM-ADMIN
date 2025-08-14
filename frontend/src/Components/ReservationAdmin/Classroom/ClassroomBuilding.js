import React from "react";
import ClassroomRooms from "./ClassroomRooms";
import "../css/classroomBuilding.css";
import School from "../../../image/School.svg";

const ClassroomBuilding = ({ classrooms, onUpdate }) => {
  // 건물별 그룹핑
  const groupByBuilding = (classrooms) => {
    return classrooms.reduce((acc, classroom) => {
      const building = classroom.building || "기타";
      if (!acc[building]) acc[building] = [];
      acc[building].push(classroom);
      return acc;
    }, {});
  };

  const grouped = groupByBuilding(classrooms);

  // 건물명 (비마관, 새빛관 ...)
  return (
    <>
      {Object.entries(grouped).map(([building, rooms]) => (
        <div key={building} className="classroom-info-update__building-block">
          <h2 className="classroom-info__building-name">
            <img className="school-image" src={School} alt="🏫" /> {building}
          </h2>
          <table className="classroom-info-update__table">
            <tbody>
              {rooms.map((room) => (
                <ClassroomRooms
                  key={room.room}
                  classroom={room}
                  onUpdate={onUpdate}
                />
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </>
  );
};

export default ClassroomBuilding;
