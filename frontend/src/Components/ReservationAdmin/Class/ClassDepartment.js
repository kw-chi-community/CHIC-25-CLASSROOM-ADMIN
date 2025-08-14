import React, { useState } from "react";
import "../css/classroomBuilding.css";
import ClassName from "./ClassName";
import Keyboard_arrow_down from "../../../image/Keyboard_arrow_down.svg";
import Keyboard_arrow_up from "../../../image/Keyboard_arrow_up.svg";
import Book from "../../../image/Book.svg";

const ClassDepartment = ({ classes, onUpdate, semester }) => {
  const [openDepartments, setOpenDepartments] = useState({});

  // 단과대별 그룹핑
  const groupByDepartment = (classes) => {
    return classes.reduce((acc, classItem) => {
      const department = classItem.department || "기타";
      if (!acc[department]) acc[department] = [];
      acc[department].push(classItem);
      return acc;
    }, {});
  };

  const grouped = groupByDepartment(classes);

  const toggleDepartment = (department) => {
    setOpenDepartments((prev) => ({
      ...prev,
      [department]: !prev[department],
    }));
  };

  return (
    <>
      {Object.entries(grouped).map(([department, departmentNames]) => (
        <div key={department} className="classroom-info-update__building-block">
          <div
            className="classroom-info__building-header"
            onClick={() => toggleDepartment(department)}
          >
            <h2 className="building-name">
              <img src={Book} alt="📖" /> {department}
            </h2>
            <button
              className="toggle-button"
              onClick={(e) => {
                e.stopPropagation();
                toggleDepartment(department);
              }}
            >
              <img
                src={
                  openDepartments[department]
                    ? Keyboard_arrow_up
                    : Keyboard_arrow_down
                }
                alt="Toggle Arrow"
                className="toggle-arrow"
              />
            </button>
          </div>

          {openDepartments[department] && (
            <table className="classroom-info-update__table">
              <tbody>
                {departmentNames.map((classItem) => (
                  <ClassName
                    key={classItem.departmentName}
                    classes={classItem}
                    onUpdate={onUpdate}
                    semester={semester}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </>
  );
};

export default ClassDepartment;
