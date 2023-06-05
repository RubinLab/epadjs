import React from 'react';
import {
  FaEye,
  FaDownload,
  FaUpload,
  FaTrashAlt,
  FaPlusCircle,
  FaLevelDownAlt,
  FaLevelUpAlt,
  FaClipboardList,
  FaEdit,
  FaProjectDiagram
} from 'react-icons/fa';
import { FiMinimize2 } from 'react-icons/fi';
import ReactTooltip from 'react-tooltip';
import { BarLoader } from 'react-spinners';
import Worklists from './addWorklist';
import Projects from './addToProject';

let mode;

const toolBar = props => {
  mode = sessionStorage.getItem('mode');
  const { project } = props;
  const noUpload = project === 'all' || project === 'nonassigned';
  const disabledStyle = {
    cursor: 'not-allowed',
    color: '#5c5c5c',
    margin: '0.5rem'
  };
  return (
    <div className="searchView-toolbar">
      <div className="searchView-toolbar__group">
        <div
          className={
            props.hideEyeIcon ? 'hide-delete' : 'searchView-toolbar__icon'
          }
          onClick={props.onView}
        >
          <div>
            <FaEye
              style={{ fontSize: '1.2rem' }}
              data-tip
              data-for="view-icon"
            />
          </div>
          <ReactTooltip
            id="view-icon"
            place="bottom"
            type="info"
            delayShow={1000}
          >
            <span>Open selections</span>
          </ReactTooltip>
        </div>
        <div className="searchView-toolbar__icon" onClick={props.onDownload}>
          <div>
            <FaDownload
              style={{ fontSize: '1.2rem' }}
              data-tip
              data-for="download-icon"
            />
          </div>
          <ReactTooltip
            id="download-icon"
            place="bottom"
            type="info"
            delayShow={1000}
          >
            <span>Download selections</span>
          </ReactTooltip>
        </div>
        <div
          className={noUpload ? 'hide-delete' : 'searchView-toolbar__icon'}
          onClick={noUpload ? null : props.onUpload}
        >
          <div>
            <FaUpload
              style={{ fontSize: '1.2rem' }}
              data-tip
              data-for="upload-icon"
            />
          </div>
          <ReactTooltip
            id="upload-icon"
            place="bottom"
            type="info"
            delayShow={1000}
          >
            <span>Upload file</span>
          </ReactTooltip>
        </div>
        {/* {!isLite && ( */}

        <div
          onClick={props.showDelete ? props.onDelete : null}
          className={
            props.showDelete ? 'searchView-toolbar__icon' : 'hide-delete'
          }
        >
          <div>
            <FaTrashAlt
              style={{ fontSize: '1.2rem' }}
              data-tip
              data-for="delete-icon"
            />
          </div>
          <ReactTooltip
            id="delete-icon"
            place="bottom"
            type="info"
            delayShow={1000}
          >
            <span>Delete selection</span>
          </ReactTooltip>
        </div>
      </div>
      {/* {mode !== "lite" && ( */}
      {/* <div className="searchView-toolbar__group"> */}
      {/* {props.expanding ? (
        <Spinner loading={props.expanding} unit="rem" size={2} />
      ) : ( */}
      <div className="searchView-toolbar__icon" onClick={props.onExpand}>
        <div>
          <FaLevelDownAlt
            style={{ fontSize: '1.2rem' }}
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
      {/* )} */}
      <div className="searchView-toolbar__icon" onClick={props.onShrink}>
        <div>
          <FaLevelUpAlt
            style={
              props.expandLevel === 0 ? disabledStyle : { fontSize: '1.2rem' }
            }
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
            style={
              props.expandLevel === 0
                ? disabledStyle
                : { fontSize: '1.5rem', strokeWidth: '3px' }
            }
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
      {/* </div>
      )} */}
      <Worklists parent="patientList" showAddTo={props.showAddTo} project={props.project} refresh={props.refresh} />
      {mode !== 'lite' && <Projects parent="patientList" showAddTo={props.showAddTo} onSave={props.onSaveToProject} />}
      {/* <div
        className={
          props.showAddTo && project !== 'all'
            ? 'searchView-toolbar__icon worklist-icon'
            : 'hide-delete'
        }
        onClick={props.showAddTo && project !== 'all' ? props.onWorklist : null}
      >
        <div>
          <FaClipboardList
            style={{ fontSize: '1.2rem' }}
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
      </div> */}

      {/* {mode !== 'lite' && (
        <div
          className={
            props.showAddTo
              ? 'searchView-toolbar__icon project-icon'
              : 'hide-delete'
          }
          onClick={props.showAddTo ? props.onAddProject : null}
        >
          <div>
            <FaProjectDiagram
              style={{ fontSize: '1.2rem' }}
              data-tip
              data-for="project-icon"
            />
          </div>
          <ReactTooltip
            id="project-icon"
            place="bottom"
            type="info"
            delayShow={1500}
          >
            <span>Add to project</span>
          </ReactTooltip>
        </div>
      )} */}
      {/* <div className="searchView-toolbar__icon">
        <div>
          <TiPencil
            style={{ fontSize: "1.2rem" }}
            data-tip
            data-for="ann-icon"
          />
        </div>
      </div>
      <ReactTooltip id="ann-icon" place="bottom" type="info" delayShow={1000}>
        <span>Add annotation</span>
      </ReactTooltip> */}
      {props.project && mode !== 'lite' && (
        <div className="searchView-toolbar__group">
          {props.admin && (
            <div
              className={
                props.showTagEditor ? 'searchView-toolbar__icon' : 'hide-delete'
              }
              onClick={props.showTagEditor ? props.onUploadWizard : null}
            >
              <div style={{ fontSize: '1.2rem' }}>
                <FaEdit data-tip data-for="editor-icon" />
              </div>

              <ReactTooltip
                id="editor-icon"
                place="right"
                type="info"
                delayShow={1000}
              >
                <span className="filter-label">Epad tag editor</span>
              </ReactTooltip>
            </div>
          )}
          <div
            className="searchView-toolbar__icon new-icon"
            onClick={props.onNew}
          >
            <div>
              <FaPlusCircle
                style={{ fontSize: '1.2rem' }}
                data-tip
                data-for="new-icon"
              />
            </div>
            <ReactTooltip
              id="new-icon"
              place="bottom"
              type="info"
              delayShow={1000}
            >
              <span>New</span>
            </ReactTooltip>
          </div>
        </div>
      )}
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
