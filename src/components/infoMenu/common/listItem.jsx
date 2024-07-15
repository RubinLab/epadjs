import React from "react";
import { downloadAnnotationsWithLink } from "../../../services/annotationServices";
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
  const triggerBrowserDownload = (blob, fileName) => {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    document.body.appendChild(link);
    link.style = "display: none";
    link.href = url;
    link.download = `${fileName}.zip`;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const onDownload = () => {
    const urlLastPart = message.split('://');
    const { href } = window.location;
    const urlFirstPart = href.split('://');
    const url = urlFirstPart[0] + '://' + urlLastPart[1];
    downloadAnnotationsWithLink(url)
    .then(result => {
      let blob = new Blob([result.data], { type: "application/zip" });
      triggerBrowserDownload(blob, "Annotations");
    })
    .catch(err => {
      console.error(err);
    });
  }

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
            <a target="_self" className="info-about__link" onClick={onDownload} >
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
