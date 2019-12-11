import React from "react";
import {
  FaEye,
  FaDownload,
  FaUpload,
  FaTrashAlt,
  FaPlusCircle,
  FaLevelDownAlt,
  FaLevelUpAlt,
  FaClipboardList
} from "react-icons/fa";
import { FiMinimize2 } from "react-icons/fi";
import ReactTooltip from "react-tooltip";
import { BarLoader } from "react-spinners";
const mode = sessionStorage.getItem("mode");

const toolBar = props => {
  return (
    <div className="searchView-toolbar">
      <div className="searchView-toolbar__group">
        <div className="searchView-toolbar__icon" onClick={props.onView}>
          <div>
            <FaEye
              style={{ fontSize: "1.2rem" }}
              data-tip
              data-for="view-icon"
            />
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
            <span>Delete selection</span>
          </ReactTooltip>
        </div>
      </div>
      {mode !== "lite" && (
        <div className="searchView-toolbar__group">
          <div className="searchView-toolbar__icon" onClick={props.onExpand}>
            <div>
              <FaLevelDownAlt
                style={{ fontSize: "1.2rem" }}
                data-tip
                data-for="forward-icon"
              />
            </div>
            <ReactTooltip
              id="forward-icon"
              place="bottom"
              type="info"
              delayShow={1500}
            >
              <span>Expand to Next Level</span>
            </ReactTooltip>
          </div>
          <div className="searchView-toolbar__icon" onClick={props.onShrink}>
            <div>
              <FaLevelUpAlt
                style={{ fontSize: "1.2rem" }}
                data-tip
                data-for="back-icon"
              />
            </div>
            <ReactTooltip
              id="back-icon"
              place="bottom"
              type="info"
              delayShow={1500}
            >
              <span>Close One Level</span>
            </ReactTooltip>
          </div>
          <div className="searchView-toolbar__icon" onClick={props.onCloseAll}>
            <div>
              <FiMinimize2
                style={{ fontSize: "1.5rem", strokeWidth: "3px" }}
                data-tip
                data-for="minimize-icon"
              />
            </div>
            <ReactTooltip
              id="minimize-icon"
              place="bottom"
              type="info"
              delayShow={1500}
            >
              <span>Close All Levels</span>
            </ReactTooltip>
          </div>
        </div>
      )}
      {props.project && mode !== "lite" && (
        <div className="searchView-toolbar__group">
          <div
            className="searchView-toolbar__icon new-icon"
            onClick={props.onNew}
          >
            <div>
              <FaPlusCircle
                style={{ fontSize: "1.2rem" }}
                data-tip
                data-for="new-icon"
              />
            </div>
            <ReactTooltip
              id="new-icon"
              place="bottom"
              type="info"
              delayShow={1500}
            >
              <span>New</span>
            </ReactTooltip>
          </div>
          <div
            className="searchView-toolbar__icon worklist-icon"
            onClick={props.onWorklist}
          >
            <div>
              <FaClipboardList
                style={{ fontSize: "1.2rem" }}
                data-tip
                data-for="worklist-icon"
              />
            </div>
            <ReactTooltip
              id="worklist-icon"
              place="bottom"
              type="info"
              delayShow={1500}
            >
              <span>Add to worklist</span>
            </ReactTooltip>
          </div>
        </div>
      )}
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
