import React from "react";
import { FaCheck } from "react-icons/fa";

const manualUpdateForm = ({ requirements, treeData, path }) => {
  const { patientID, studyUID, seriesUID } = path;
  const fields = [];
  const series = treeData[patientID].studies[studyUID].series[seriesUID];
  const { tagRequired, data } = series;
  requirements.forEach((el, i) => {
    console.log(data);
    console.log(data.el);

    const missing = tagRequired.includes(el);
    fields.push(
      <div key={`${series.seriesUID}-${i}`} className="tagEditForm__el">
        <div className="--exp">{`${el}:`}</div>
        {missing ? (
          <input type="text" className="--text" />
        ) : (
          <input type="text" value={data.el} disabled className="--text" />
        )}
        {missing ? (
          <button className="--refresh" />
        ) : (
          <FaCheck className="--check" />
        )}
      </div>
    );
  });
  return <div className="tagEditForm">{fields}</div>;
};

export default manualUpdateForm;
