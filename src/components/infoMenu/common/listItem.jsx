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
        <div className="response-item__msg">
          {action && action.includes("Download ready") ? (
            <a href={message} download="annotations.zip" target="_self" className="info-about__link">
              Click here to download files!
            </a>
          ) : (
            message
          )}
        </div>
        <div className="response-item__time">{time}</div>
      </div>
    </li>
  );
};

export default responseList;
