import React from "react";
import { FaEye, FaDownload, FaUpload } from "react-icons/fa";
import { TiPencil } from "react-icons/ti";
import ReactTooltip from "react-tooltip";

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
      <div className="searchView-toolbar__icon">
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
      </ReactTooltip>
    </div>
  );
};

export default toolBar;

{
  /* <p data-tip='' data-for='test'></p>
<ReactTooltip id='test'>{}</ReactTooltip> */
}
{
  /* <FaRegTrashAlt
className="tool-icon"
onClick={onDelete}
data-tip
data-for="trash-icon"
/>
<ReactTooltip
id="trash-icon"
place="bottom"
type="info"
delayShow={1500}
>
<span>Delete selections</span>
</ReactTooltip> */
}
