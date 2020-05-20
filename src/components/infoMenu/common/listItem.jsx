import React from "react";
import { FaCheckCircle, FaBell, FaExclamationCircle } from "react-icons/fa";

const checkStyle = {
  color: "#62c462",
  textShadow: "1px 1px 1px #ccc",
  fontSize: "1.5em"
};

const exclamationStyle = {
  color: "orangered",
  textShadow: "1px 1px 1px #ccc",
  fontSize: "1.5em"
};

const responseList = ({ item }) => {
  const { seen, error, action, message, time } = item;
  const className = seen ? "response-item" : "response-item newNotification";
  return (
    <li className={className}>
      <div className="response-item__icon">
        {!seen ? (
          <FaBell style={error ? exclamationStyle : checkStyle} />
        ) : error ? (
          <FaExclamationCircle style={exclamationStyle} />
        ) : (
          <FaCheckCircle style={checkStyle} />
        )}
      </div>
      <div className="response-item__wrap">
        <div className="response-item__msg">{action}</div>
        <div className="response-item__msg">{message}</div>
        <div className="response-item__time">{time}</div>
      </div>
    </li>
  );
};

export default responseList;
