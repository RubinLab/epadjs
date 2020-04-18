import React from 'react';
import {
  FaCheck,
  FaExclamationTriangle,
  FaArrowAltCircleLeft,
} from 'react-icons/fa';
import { TiArrowLeftOutline } from 'react-icons/ti';
import { makeDeIdentifiedValue, clearCarets } from '../../Utils/aid';
import './tagEditor.css';
import TagEditorButton from './tagEditorButton';

const manualUpdateForm = ({ requirements, treeData, onTagInput, onClose }) => {
  try {
    const { seriesUID, missingTags, data } = treeData[0];
    const fields = [];
    // const series = treeData[patientID].studies[studyUID].series[seriesUID];

    requirements.forEach((el, i) => {
      const tag = el.substring(0, el.length - 2);
      const vr = el.substring(el.length - 2);
      const missing = missingTags.includes(tag);
      const value = missing ? makeDeIdentifiedValue(null, vr) : data[tag];
      // if (missing) onTagInput(null, tag, value);
      fields.push(
        <div key={`${seriesUID}-${i}`} className="tagCopyForm__el">
          
            <div className={!missing ? "--copy" : "--hide" } onClick={() => onTagInput(null, tag, value)}>
              <FaArrowAltCircleLeft />
            </div>
          <input
            onMouseDown={e => e.stopPropagation()}
            type="text"
            className={missing ? '--textFilled' : '--text'}
            defaultValue={missing ? '' : clearCarets(value)}
            name={tag}
            onChange={onTagInput}
          />
          {missing ? (
            <FaExclamationTriangle className="--warnning" />
          ) : (
            <FaCheck className="--check" />
          )}
        </div>
      );
    });
    return (
      <div className="tagCopyForm-wrapper">
        <div className="tagCopyForm">{fields}</div>
        <TagEditorButton
          name="tagCopy"
          onClick={onClose}
          disabled={false}
          value="Back to Series Browse"
        />
        {/* <input
          className="tagCopyForm-save"
          onClick={onSave}
          value="Back to Series Browse"
          type="button"
        /> */}
      </div>
    );
  } catch (err) {
    console.log(err);
    return (
      <div style={{ fontSize: '1.4rem', color: '#5bc0de', textAlign: 'left' }}>
        Select requirements and series to edit tags
      </div>
    );
  }
};

export default manualUpdateForm;
