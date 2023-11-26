import React, { useEffect, useState, useCallback } from "react";
import { useTable, useExpanded } from "react-table";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import PropagateLoader from "react-spinners/PropagateLoader";
import SelectSeriesModal from "../annotationsList/selectSerieModal";
import { getStudies } from "../../services/studyServices";
import Series from "./Series";
import { formatDate } from "../flexView/helperMethods";
import { getSeries } from "../../services/seriesServices";
import { clearCarets, isSupportedModality } from "../../Utils/aid.js";
import {
  getSingleSerie,
  selectStudy,
  clearSelection,
  startLoading,
  loadCompleted,
  annotationsLoadingError,
  addToGrid,
  getWholeData,
  alertViewPortFull,
  updatePatient,
  selectSerie,
  selectAnnotation,
  setSeriesData,
} from "../annotationsList/action";

function Table({
  columns,
  data,
  getTreeData,
  expandLevel,
  patientIndex,
  getTreeExpandAll,
  getTreeExpandSingle,
  treeExpand,
  update,
}) {
  const {
    rows,
    prepareRow,
    toggleAllRowsExpanded,
    state: { expanded },
  } = useTable(
    {
      columns,
      data,
    },
    useExpanded // Use the useExpanded plugin hook
  );

  useEffect(() => {
    const obj = { patient: patientIndex, study: data.length };
    if (expandLevel === 2) {
      toggleAllRowsExpanded(true);
      getTreeExpandAll(obj, true, expandLevel);
    }
    if (expandLevel === 1) {
      toggleAllRowsExpanded(false);
      getTreeExpandAll(obj, false, expandLevel);
    }
  }, [expandLevel]);

  return (
    <>
      {data.length > 0 && (
        <>
          {rows.map((row, i) => {
            prepareRow(row);
            const isExpandedFromToolbar = treeExpand[patientIndex]
              ? treeExpand[patientIndex][row.index]
              : false;
            const expandRow = row.isExpanded || isExpandedFromToolbar;
            const style = { height: "2.5rem", background: "#272b30" };
            return (
              <>
                <tr {...row.getRowProps()} key={`study-row${i}`} style={style}>
                  {row.cells.map((cell, k) => {
                    return (
                      <td
                        key={`study-d${k}`}
                        {...cell.getCellProps({
                          className: cell.column.className,
                        })}
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
                {expandRow && (
                  <Series
                    pid={row.original.projectID}
                    subjectID={row.original.patientID}
                    studyUID={row.original.studyUID}
                    getTreeData={getTreeData}
                    studyDescription={row.original.studyDescription}
                    expandLevel={expandLevel}
                    patientIndex={patientIndex}
                    getTreeExpandAll={getTreeExpandAll}
                    treeExpand={treeExpand}
                    studyIndex={row.index}
                    getTreeExpandSingle={getTreeExpandSingle}
                    update={update}
                  />
                )}
              </>
            );
          })}
        </>
      )}
    </>
  );
}

function Studies(props) {
  const widthUnit = 20;

  const [data, setData] = useState([]);
  let [loading, setLoading] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(false);
  const [selectedCount, setSelectedCount] = useState(false);
  const [isSerieSelectionOpen, setIsSerieSelectionOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState([]);
  const [studyName, setStudyName] = useState("");
  const [update, setUpdate] = useState(0);

  useEffect(() => {
    const { selectedPatients, selectedSeries, selectedAnnotations } = props;
    const patients = Object.values(selectedPatients);
    const series = Object.values(selectedSeries);
    const annotations = Object.values(selectedAnnotations);

    if (patients.length) {
      setSelectedLevel("patients");
      setSelectedCount(patients.length);
    } else if (series.length) {
      setSelectedLevel("series");
      setSelectedCount(series.length);
    } else if (annotations.length) {
      setSelectedLevel("annotations");
      setSelectedCount(annotations.length);
    } else {
      setSelectedLevel("");
    }
  }, [props.selectedStudies, props.selectedSeries, props.selectedAnnotations]);

  const deselectChildLevels = (patientID, studyUID) => {
    if (selectedLevel === "series") {
      const series = Object.values(props.selectedSeries);
      const seriesToDeselect = series.reduce((all, item, i) => {
        if (item.patientID === patientID && item.studyUID === studyUID)
          all.push(item);
        return all;
      }, []);
      seriesToDeselect.forEach((el) => props.dispatch(selectSerie(el)));
    } else if (selectedLevel === "annotations") {
      const annotations = Object.values(props.selectedAnnotations);
      const annotationsToDeselect = annotations.reduce((all, item, i) => {
        if (item.patientID === patientID && item.studyUID === studyUID)
          all.push(item);
        return all;
      }, []);
      annotationsToDeselect.forEach((el) =>
        props.dispatch(
          selectAnnotation(el, el.studyDescription, el.seriesDescription)
        )
      );
    }
  };

  const excludeOpenSeries = (allSeriesArr) => {
    const result = [];
    //get all series number in an array
    const idArr = props.openSeries.reduce((all, item, index) => {
      all.push(item.seriesUID);
      return all;
    }, []);
    //if array doesnot include that serie number
    allSeriesArr.forEach((serie) => {
      if (!idArr.includes(serie.seriesUID)) {
        //push that serie in the result arr
        result.push(serie);
      }
    });
    return result;
  };

  const getSeriesData = async (selected) => {
    const { seriesData } = this.props;
    props.dispatch(startLoading());
    const { projectID, patientID, studyUID } = selected;
    const dataExists =
      seriesData[projectID] &&
      seriesData[projectID][patientID] &&
      seriesData[projectID][patientID][studyUID];
    try {
      if (!dataExists) {
        const { data: series } = await getSeries(
          projectID,
          patientID,
          studyUID
        );
        props.dispatch(loadCompleted());
        this.props.dispatch(
          setSeriesData(projectID, patientID, studyUID, series)
        );
        return series;
      } else return seriesData[projectID][patientID][studyUID];
    } catch (err) {
      props.dispatch(annotationsLoadingError(err));
    }
  };

  const displaySeries = async (selected) => {
    const maxPort = parseInt(sessionStorage.getItem("maxPort"));
    const { patientID, studyUID } = selected;
    let seriesArr = await getSeriesData(selected);
    //check if the patient is there (create a patient exist flag)
    // const patientExists = props.patients[patientID];
    //if there is patient iterate over the series object of the study (form an array of series)
    // if (patientExists) {
    //   seriesArr = Object.values(
    //     props.patients[patientID].studies[studyUID].series
    //   );
    //   //if there is not a patient get series data of the study and (form an array of series)
    // } else {

    // }
    // filter the nondisplayable modalities
    seriesArr = seriesArr.filter(isSupportedModality);
    //get extraction of the series (extract unopen series)
    // if (seriesArr.length > 0) seriesArr = excludeOpenSeries(seriesArr);
    //check if there is enough room
    if (seriesArr.length + props.openSeries.length > maxPort) {
      //if there is not bring the modal
      // await setState({
      //   isSerieSelectionOpen: true,
      //   selectedStudy: [seriesArr],
      //   studyName: selected.studyDescription
      // });
      setIsSerieSelectionOpen(true);
      setSelectedStudy([seriesArr]);
      setStudyName(selected.studyDescription);
    } else {
      //if there is enough room
      //add serie to the grid
      const promiseArr = [];
      for (let serie of seriesArr) {
        props.dispatch(addToGrid(serie));
        promiseArr.push(props.dispatch(getSingleSerie(serie)));
      }
      //getsingleSerie
      Promise.all(promiseArr)
        .then(() => {})
        .catch((err) => console.error(err));

      //if patient doesnot exist get patient
      // -----> Delete after v1.0 <-----
      // if (!patientExists) {
      //   // props.dispatch(getWholeData(null, selected));
      //   getWholeData(null, selected);
      // } else {
      //   //check if study exist
      //   props.dispatch(updatePatient('study', true, patientID, studyUID));
      // }
      props.history.push("/display");
    }
    props.dispatch(clearSelection());
  };

  const columns = React.useMemo(
    () => [
      {
        id: "studies-expander", // Make sure it has an ID
        width: 35,
        Cell: ({ row, toggleRowExpanded }) => {
          const style = {
            display: "flex",
            width: "fit-content",
            paddingLeft: "10px",
          };

          return (
            <div style={style}>
              <div>
                <input
                  type="checkbox"
                  style={{ marginRight: "5px" }}
                  disabled={selectedLevel}
                  onClick={() => {
                    props.dispatch(clearSelection("study"));
                    props.dispatch(selectStudy(row.original));
                  }}
                />
              </div>
              <span
                {...row.getToggleRowExpandedProps({
                  style: {
                    cursor: "pointer",
                    fontSize: 10,
                    textAlign: "center",
                    userSelect: "none",
                    color: "#fafafa",
                    verticalAlign: "middle",
                  },
                })}
                onClick={() => {
                  const expandStatus = row.isExpanded ? false : true;
                  const obj = {
                    patient: props.patientIndex,
                    study: { [row.index]: expandStatus ? {} : false },
                  };
                  toggleRowExpanded(row.id, expandStatus);
                  props.getTreeExpandSingle(obj);
                  if (selectedLevel) {
                    deselectChildLevels(
                      row.original.patientID,
                      row.original.studyUID
                    );
                  }
                }}
              >
                {row.isExpanded ||
                (props.treeExpand &&
                  props.treeExpand[props.patientIndex] &&
                  props.treeExpand[props.patientIndex][row.index]) ? (
                  <span>&#x25BC;</span>
                ) : (
                  <span>&#x25B6;</span>
                )}
              </span>
            </div>
          );
        },
      },
      {
        width: widthUnit * 12,
        id: "study-desc",
        Cell: ({ row }) => {
          let desc = clearCarets(row.original.studyDescription);
          desc = desc || "Unnamed Study";
          const id = "desc" + row.original.studyUID;
          return (
            <>
              <span
                data-tip
                data-for={id}
                // className="searchView-row__desc"
                className="searchView-table__cell"
                style={{ paddingLeft: "10px" }}
                onDoubleClick={() => displaySeries(row.original)}
              >
                {desc}
              </span>
              <ReactTooltip
                id={id}
                place="right"
                type="info"
                delayShow={500}
                clickable={true}
              >
                <span>{desc}</span>
              </ReactTooltip>
            </>
          );
        },
      },
      {
        width: widthUnit * 2,
        id: "numberOfAnnotations",
        Cell: ({ row }) => (
          <div className="searchView-table__cell">
            {row.original.numberOfAnnotations === 0 ? (
              ""
            ) : (
              <span
                // className="badge badge-secondary"
                className="searchView-table__cell"
              >
                {row.original.numberOfAnnotations}
              </span>
            )}
          </div>
        ),
      },
      {
        width: widthUnit * 3,
        id: "numberOfSeries",
        className: "searchView-table__cell",
        Cell: ({ row }) => (
          <div className="searchView-table__cell">
            {row.original.numberOfSeries === 0 ? (
              ""
            ) : (
              <span
                // className="badge badge-secondary"
                className="searchView-table__cell"
              >
                {row.original.numberOfSeries}
              </span>
            )}
          </div>
        ),
      },
      {
        width: widthUnit * 3,
        accessor: "numberOfImages" || "",
        className: "searchView-table__cell",
      },
      {
        width: widthUnit * 5,
        id: "study-examtype",
        className: "searchView-table__cell",
        Cell: ({ row }) => (
          <span className="searchView-table__cell">
            {row.original.examTypes.join("/")}
          </span>
        ),
      },
      {
        width: widthUnit * 7,
        id: "study-insert-time",
        className: "searchView-table__cell",
        Cell: ({ row }) => (
          <span className="searchView-table__cell">
            {formatDate(row.original.insertDate)}
          </span>
        ),
      },
      {
        width: widthUnit * 7,
        id: "study-created-time",
        className: "searchView-table__cell",

        Cell: ({ row }) => (
          <span className="searchView-table__cell">
            {formatDate(row.original.createdTime)}
          </span>
        ),
      },
      {
        width: widthUnit * 6,
        id: "studyAccessionNumber",
        className: "searchView-table__cell",
        Cell: ({ row }) => (
          <>
            <span
              className="searchView-table__cell"
              data-tip
              data-for={row.original.studyAccessionNumber}
            >
              {row.original.studyAccessionNumber || ""}
            </span>
            <ReactTooltip
              id={row.original.studyAccessionNumber}
              place="right"
              type="info"
              delayShow={500}
              clickable={true}
            >
              <span>{row.original.studyAccessionNumber}</span>
            </ReactTooltip>
          </>
        ),
      },
      {
        id: "studyUID",
        className: "searchView-table__cell",
        Cell: ({ row }) => (
          <>
            <span data-tip data-for={row.original.studyUID}>
              {row.original.studyUID}
            </span>{" "}
            <ReactTooltip
              id={row.original.studyUID}
              place="top"
              type="info"
              delayShow={500}
              clickable={true}
            >
              <span>{row.original.studyUID}</span>
            </ReactTooltip>
          </>
        ),
      },
    ],
    [selectedLevel, selectedCount, props.update, isSerieSelectionOpen]
  );

  const getDataFromStorage = (projectID, subjectID) => {
    const treeData = JSON.parse(localStorage.getItem("treeData"));
    const studiesArray =
      treeData[projectID] && treeData[projectID][subjectID]
        ? Object.values(treeData[projectID][subjectID].studies).map(
            (el) => el.data
          )
        : [];

    return studiesArray;
  };

  useEffect(() => {
    const { pid, subjectID, getTreeData } = props;
    const dataFromStorage = getDataFromStorage(pid, subjectID);
    let data = [];
    if (pid && pid !== "null" && subjectID) {
      if (dataFromStorage?.length > 0) {
        data = dataFromStorage;
        setData(data);
      } else {
        setLoading(true);
        getStudies(pid, subjectID)
          .then((res) => {
            setLoading(false);
            getTreeData(pid, "studies", res.data);
            setData(res.data);
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  }, [props.update]);

  // useEffect(() => {
  //   setUpdate(update + 1);
  // }, [props.update]);

  return (
    <>
      {loading && (
        <tr style={{ width: "fit-content", margin: "auto", marginTop: "10%" }}>
          <PropagateLoader color={"#7A8288"} loading={loading} margin={8} />
        </tr>
      )}
      <Table
        columns={columns}
        data={data}
        getTreeData={props.getTreeData}
        expandLevel={props.expandLevel}
        patientIndex={props.patientIndex}
        getTreeExpandAll={props.getTreeExpandAll}
        treeExpand={props.treeExpand}
        getTreeExpandSingle={props.getTreeExpandSingle}
        update={props.update}
      />
      {isSerieSelectionOpen && (
        <SelectSeriesModal
          seriesPassed={selectedStudy}
          onCancel={() => setIsSerieSelectionOpen(false)}
          studyName={studyName}
        />
      )}
    </>
  );
}

const mapStateToProps = (state) => {
  return {
    selectedPatients: state.annotationsListReducer.selectedPatients,
    selectedStudies: state.annotationsListReducer.selectedStudies,
    selectedSeries: state.annotationsListReducer.selectedSeries,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    seriesData: state.annotationsListReducer.seriesData,
  };
};

export default withRouter(connect(mapStateToProps)(Studies));
