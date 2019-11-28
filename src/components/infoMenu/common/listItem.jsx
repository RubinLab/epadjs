import React from "react";
import { FaCheck, FaBell } from "react-icons/fa";

const responseList = ({ item }) => {
  const className = item.seen
    ? "response-item"
    : "response-item newNotification";
  return (
    <li className={className}>
      <div className="response-item__icon">
        {item.seen ? <FaCheck /> : <FaBell />}
      </div>
      <div className="response-item__wrap">
        {item.error ? (
          <div className="response-item__msg">Error: {item.action}</div>
        ) : null}
        <div className="response-item__msg">{item.message}</div>
        <div className="response-item__time">{item.time}</div>
      </div>
    </li>
  );
};

export default responseList;
