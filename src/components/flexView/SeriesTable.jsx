import React, { useState } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Draggable from "react-draggable";
import { FaRegCheckSquare } from "react-icons/fa";
import {
  addToGrid,
  getSingleSerie,
  getWholeData,
  updatePatient,
  clearSelection,
} from "../annotationsList/action";

const maxPort = parseInt(sessionStorage.getItem("maxPort"));
// connect to store
// is seriesUID in the openSeries checkbox clicked
const SeriesTable = (props) => {
  const { series, onClose, openSeries } = props;
  const [error, setError] = useState("");
  //   const [allSelected, setAllSelected] = useState(false);
  const [selectedSeries, setAllSelectedSeries] = useState({});
  const openSeriesUID = openSeries.map((el) => el.seriesUID);
  const disabledSeries = [];
  const button = document.getElementById("flexMenu-button");
  const { x, y } = button.getBoundingClientRect();

  const onAllChecked = (e) => {
    const { checked } = e.target;
    if (openSeries.length + series.length - disabledSeries.length > maxPort) {
      setError(
        `Only ${maxPort} series can be viewed at a time! ${openSeries.length} series are already open!`
      );
    } else {
      const newSelectedSeries = { ...selectedSeries };
      series.forEach((el, i) => {
        if (!disabledSeries.includes(i)) newSelectedSeries[i] = checked;
      });
      setAllSelectedSeries(newSelectedSeries);
    }
  };

  const dispatchSerieDisplay = (selected) => {
    const { patientID, studyUID } = selected;
    props.dispatch(addToGrid(selected));
    props
      .dispatch(getSingleSerie(selected))
      .then(() => { })
      .catch((err) => console.log(err));
    // -----> Delete after v1.0 <-----
    // if (!props.patients[selected.patientID]) {
    //   // props.dispatch(getWholeData(selected));
    //   getWholeData(selected);
    // } else {
    //   props.dispatch(
    //     updatePatient("serie", true, patientID, studyUID, selected.seriesUID)
    //   );
    // }
  };

  const onOpenSeries = () => {
    const indices = Object.keys(selectedSeries);
    const selection = Object.values(selectedSeries);
    selection.forEach((bool, i) => {
      if (bool) dispatchSerieDisplay(series[indices[i]]);
    });
    props.history.push("/display");
    onClose();
  };

  const onSingleSelect = (e, index) => {
    const newSelectedSeries = { ...selectedSeries };
    newSelectedSeries[index] = e.target.checked;
    setAllSelectedSeries(newSelectedSeries);
  };

  let allChecked = false;
  const values = Object.values(selectedSeries);
  if (
    !values.includes(false) &&
    values.length === series.length - disabledSeries.length
  )
    allChecked = true;
  if (
    !values.includes(true) &&
    values.length === series.length - disabledSeries.length
  )
    allChecked = false;

  const header = [
    <th className="series-table __header --cell" key="check-header">
      <input
        type="checkbox"
        name="all"
        onChange={onAllChecked}
        checked={allChecked}
      />
    </th>,
    <th className="series-table __header --cell" key="desc-header">
      Series Description
    </th>,
    <th
      className="series-table __header --cell"
      key="aims-header"
      id="seriesAim"
    >
      # of aims
    </th>,
    <th
      className="series-table __header --cell"
      key="imgs-header"
      id="seriesImg"
    >
      # of img
    </th>,
    <th
      className="series-table __header --cell"
      key="dexamesc-header"
      id="seriesType"
    >
      Exam
    </th>,
    <th className="series-table __header --cell" key="uid-header">
      Series UID
    </th>,
  ];
  const rows = [];
  series.forEach((item, index) => {
    const {
      seriesDescription,
      numberOfAnnotations,
      numberOfImages,
      examType,
      seriesUID,
    } = item;
    const desc = seriesDescription ? seriesDescription : "Unnamed series";
    let disabled = false;
    if (openSeriesUID.includes(seriesUID)) {
      disabled = true;
      disabledSeries.push(index);
    }
    const row = (
      <tr className="series-table __tbody --row" key={seriesUID}>
        <td className="series-table __tbody --cell" key="check-cell">
          {disabled ? (
            <FaRegCheckSquare style={{ fontSize: "1.1rem" }} />
          ) : (
            <input
              type="checkbox"
              value="all"
              onChange={(e) => onSingleSelect(e, index)}
              checked={selectedSeries[index]}
            />
          )}
        </td>
        <td className="series-table __tbody --cell" key="desc-cell">
          {desc}
        </td>
        <td className="series-table __tbody --cell" key="aims-cell">
          {numberOfAnnotations}
        </td>
        <td className="series-table __tbody --cell" key="imgs-cell">
          {numberOfImages}
        </td>
        <td className="series-table __tbody --cell" key="dexamesc-cell">
          {examType}
        </td>
        <td className="series-table __tbody --cell" key="uid-cell">
          {seriesUID}
        </td>
      </tr>
    );
    rows.push(row);
  });
  return (
    <Draggable defaultPosition={{ x, y }}>
      <div className="__dropdown">
        <table className="series-table">
          <thead className="series-table __header">
            <tr className="series-table __header --row">{header}</tr>
          </thead>
          <tbody className="series-table __tbody">{rows}</tbody>
        </table>
        {error && <div className="series-table __error">{error}</div>}
        <div className="series-table __buttonGroup">
          <button
            className="series-table __button"
            disabled={error}
            onClick={onOpenSeries}
          >
            Open series
          </button>
          <button className="series-table __button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </Draggable>
  );
};

const mapStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
  };
};

export default withRouter(connect(mapStateToProps)(SeriesTable));
