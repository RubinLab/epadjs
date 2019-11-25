import React from "react";
import { Modal } from "react-bootstrap";

const responseList = ({ item }) => {
  return (
    <div className="response-item">
      <div className="response-item__msg">{item.message}</div>
      <div className="response-item__time">{item.time}</div>
    </div>
  );
};

export default responseList;
