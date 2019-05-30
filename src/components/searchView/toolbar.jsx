import React from "react";
import { FaEye, FaDownload, FaUpload, FaTrashAlt } from "react-icons/fa";
import { css, jsx } from "@emotion/core";
import { TiPencil } from "react-icons/ti";
import ReactTooltip from "react-tooltip";
import Spinner from "../common/barLoader";
import { BarLoader } from "react-spinners";

const toolBar = props => {
  return (
    <div className="searchView-toolbar">
      <div className="searchView-toolbar__icon" onClick={props.onView}>
        <div>
          <FaEye style={{ fontSize: "1.2rem" }} data-tip data-for="view-icon" />
        </div>
        <ReactTooltip
          id="view-icon"
          place="bottom"
          type="info"
          delayShow={1500}
        >
          <span>Open selections</span>
        </ReactTooltip>
      </div>
      <div className="searchView-toolbar__icon" onClick={props.onDownload}>
        <div>
          <FaDownload
            style={{ fontSize: "1.2rem" }}
            data-tip
            data-for="download-icon"
          />
        </div>
        <ReactTooltip
          id="download-icon"
          place="bottom"
          type="info"
          delayShow={1500}
        >
          <span>Download selections</span>
        </ReactTooltip>
      </div>
      <div className="searchView-toolbar__icon" onClick={props.onUpload}>
        <div>
          <FaUpload
            style={{ fontSize: "1.2rem" }}
            data-tip
            data-for="upload-icon"
          />
        </div>
        <ReactTooltip
          id="upload-icon"
          place="bottom"
          type="info"
          delayShow={1500}
        >
          <span>Upload file</span>
        </ReactTooltip>
      </div>
      <div
        onClick={props.onDelete}
        className={
          props.showDelete ? "searchView-toolbar__icon" : "hide-delete"
        }
      >
        <div>
          <FaTrashAlt
            style={{ fontSize: "1.2rem" }}
            data-tip
            data-for="delete-icon"
          />
        </div>
        <ReactTooltip
          id="delete-icon"
          place="bottom"
          type="info"
          delayShow={1500}
        >
          <span>Delete study</span>
        </ReactTooltip>
      </div>
      {/* <div className="searchView-toolbar__icon">
        <div>
          <TiPencil
            style={{ fontSize: "1.2rem" }}
            data-tip
            data-for="ann-icon"
          />
        </div>
      </div>
      <ReactTooltip id="ann-icon" place="bottom" type="info" delayShow={1500}>
        <span>Add annotation</span>
      </ReactTooltip> */}
      <div className="spinner-toolbar__container">
        {props.status && (
          <>
            <div className="toolbar-status">{props.status}</div>
            <BarLoader loading={true} height={10} width={120} />
          </>
        )}
      </div>
    </div>
  );
};

export default toolBar;
