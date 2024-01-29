import React, { useEffect, useState, useCallback, useRef } from "react";
import { connect } from "react-redux";
import ReactTooltip from "react-tooltip";
import Modal from "react-bootstrap/Modal";
import {
  useTable,
  usePagination,
  useRowSelect,
  useSortBy,
  useControlledState,
} from "react-table";
import { clearCarets, convertDateFormat } from "../../Utils/aid.js";
import {
  changeActivePort,
  jumpToAim,
  addToGrid,
  getSingleSerie,
  startLoading,
  loadCompleted,
  annotationsLoadingError,
  updateSearchTableIndex,
  setSeriesData,
} from "../annotationsList/action";
import { formatDate } from "../flexView/helperMethods";
import { getSeries, getSignificantSeries } from "../../services/seriesServices";
import SelectSerieModal from "../annotationsList/selectSerieModal";
import { isSupportedModality } from "../../Utils/aid.js";
import { COMP_MODALITIES as compModality, teachingFileTempCode } from "../../constants.js";
const defaultPageSize = 200;

let maxPort;
let mode;

const IndeterminateCheckbox = React.forwardRef(
  ({ indeterminate, ...rest }, ref) => {
    const defaultRef = React.useRef();
    const resolvedRef = ref || defaultRef;

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate;
    }, [resolvedRef, indeterminate]);
    return (
      <>
        <input
          type="checkbox"
          ref={resolvedRef}
          {...rest}
          checked={rest.selected}
          onClick={() => rest.updateSelectedAims(rest.data)}
        />
      </>
    );
  }
);

function Table({
  columns,
  data,
  selected,
  updateSelectedAims,
  pageCount,
  noOfRows,
  fetchData,
  controlledPageIndex,
  handlePageIndex,
  // listOfSelecteds,
  handleSort,
  handleFilter,
}) {
  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    canNextPage,
    selectedFlatRows,
    canPreviousPage,
    nextPage,
    previousPage,
    setPageSize,
    toggleAllRowsExpanded,
    state: { selectedRowIds, expanded, pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageSize: defaultPageSize,
      },
      autoResetPage: false,
      manualPagination: true,
      pageCount,
      useControlledState: (state) => {
        return React.useMemo(
          () => ({
            ...state,
            pageIndex: controlledPageIndex,
          }),
          [state, controlledPageIndex]
        );
      },
    },
    useSortBy,
    usePagination,
    useRowSelect
    // hooks => {
    //   hooks.visibleColumns.push(columns => [
    //     // Let's make a column for selection
    //     {
    //       id: 'selection',
    //       Cell: ({ row }) => (
    //         <div>
    //           <IndeterminateCheckbox
    //             {...row.getToggleRowSelectedProps()}
    //             data={row.original}
    //             updateSelectedAims={updateSelectedAims}
    //             selected={listOfSelecteds.includes(row.original.aimID)}
    //             // onChange={() => updateSelectedAims(row.original)}
    //           />
    //         </div>
    //       )
    //     },
    //     ...columns
    //   ]);
    // }
  );

  React.useEffect(() => {
    fetchData({ pageIndex, pageSize });
  }, [fetchData, pageIndex, pageSize]);
  return (
    <>
      {mode !== "teaching" && (
        <>
          {/* <table {...getTableProps()} style={{ width: '100%' }}>
        <thead
          style={{
            color: 'aliceblue',
            fontSize: '1.1rem',
            background: '#575C62'
          }}
        >
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th
                  // {...column.getHeaderProps(column.getSortByToggleProps(() => alert("togged")))}
                  // style={{ padding: '0.5rem' }} onClick={() => { handleSort(column) }}
                  style={{ padding: '0.5rem' }}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead> */}
          {/* <tbody {...getTableBodyProps()}> */}
        </>
      )}
      {rows.map((row, i) => {
        prepareRow(row);
        return (
          <tr {...row.getRowProps()}>
            {row.cells.map((cell) => {
              if (cell.column.id === "select")
                return (
                  <td {...cell.getCellProps()} className="select_row">
                    {cell.render("Cell")}
                  </td>
                );
              else
                return (
                  <td
                    {...cell.getCellProps()}
                    // style={{
                    //   margin: '0',
                    //   padding: '0.8rem 0.4rem',
                    //   borderBottom: '0.2px solid #6c757d'
                    // }}
                  >
                    {cell.render("Cell")}
                  </td>
                );
            })}
          </tr>
        );
      })}
      {noOfRows / defaultPageSize > 1 && (
        <tr>
          <td colSpan="10000">
            Showing {defaultPageSize * pageIndex}-
            {defaultPageSize * (pageIndex + 1)} of ~{pageCount * pageSize}{" "}
            results
          </td>
        </tr>
      )}
      {mode !== "teaching" && (
        <>
          {/* </tbody>
      </table> */}
        </>
      )}
      {pageCount > 1 && (
        <div className="pagination-search">
          <button
            onClick={() => {
              handlePageIndex("prev");
            }}
            disabled={!canPreviousPage}
            className={!canPreviousPage ? "disabled" : ""}
          >
            {"<"}
          </button>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
            }}
          >
            {[defaultPageSize].map((pageSize, i) => (
              <option key={`${pageSize}-${i}`} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <button
            onClick={() => {
              handlePageIndex("next");
            }}
            disabled={!canNextPage}
          >
            {">"}
          </button>
        </div>
      )}
    </>
  );
}

// const formatDate = dateString => {
//   try {
//     const dateArr = dateString.split('-');
//     dateArr[0] = dateArr[0].substring(2);
//     dateArr[1] = dateArr[1][0] === '0' ? dateArr[1][1] : dateArr[1];
//     dateArr[2] = dateArr[2][0] === '0' ? dateArr[2][1] : dateArr[2];
//     return dateArr[1] + '/' + dateArr[2] + '/' + dateArr[0];
//   } catch (err) {
//     console.error(err);
//   }
// };

function AnnotationTable(props) {
  maxPort = parseInt(sessionStorage.getItem("maxPort"));
  mode = sessionStorage.getItem("mode");
  const [pageCount, setPageCount] = useState(0);
  const [data, setData] = useState([]);
  const [showSelectSeriesModal, setShowSelectSeriesModal] = useState(false);
  const [selected, setSelected] = useState({});
  // const [listOfSelecteds, setListOfSelecteds] = useState({});
  const [showNarrative, setShowNarrative] = useState(false);
  const [narrative, setNarrative] = useState("");
  // const [aimMap, setAimMap] = useState({})

  const handlePageIndex = (act) => {
    let newIndex =
      act === "prev" ? props.searchTableIndex - 1 : props.searchTableIndex + 1;
    props.dispatch(updateSearchTableIndex(newIndex));
  };

  // Render the UI for your table
  const preparePageData = (
    rawData,
    pageSize = defaultPageSize,
    pageIndex = 0
  ) => {
    let pageData = [];
    setPageCount(Math.ceil(props.noOfRows / pageSize));
    const startIndex = pageSize * pageIndex;
    const endIndex = pageSize * (pageIndex + 1);
    const map = {};
    rawData.forEach((el, i) => {
      if (i >= startIndex && i < endIndex) {
        const aim = el.data ? el.data : el;
        pageData.push(aim);
        const {
          aimID,
          seriesUID,
          studyUID,
          subjectID,
          projectID,
          patientName,
          name,
        } = aim;
        map[aimID] = {
          aimID,
          seriesUID,
          studyUID,
          subjectID,
          projectID,
          patientName,
          name,
        };
      }
    });
    // instead of writing 200 aims to storage, i can write a function
    // for each click if false remove data, if true add the data
    sessionStorage.aimMap = JSON.stringify(map);
    setData(pageData);
  };

  // useEffect(() => {
  //   const selectedList = Object.keys(props.selectedAnnotations);

  //   if (props.allSelected === false && selectedList.length === 0) {
  //     setListOfSelecteds({});
  //   }

  //   const newList = {};
  //   if (props.allSelected) {
  //     data.forEach(el => {
  //       newList[el.aimID] = true;
  //     });
  //     setListOfSelecteds(newList);
  //   }

  // }, [props.allSelected]);

  // const updateListOfSelected = (item) => {
  //   const newList = { ...listOfSelecteds }
  //   if (newList[item.aimID]) delete newList[item.aimID];
  //   else newList[item.aimID] = true;
  //   setListOfSelecteds(newList);
  // }

  useEffect(() => {
    preparePageData(props.data, defaultPageSize, props.searchTableIndex);
  }, [props.pid, props.data]);

  useEffect(() => {
    if (props.data.length <= defaultPageSize * props.searchTableIndex) {
      preparePageData(props.data, defaultPageSize, props.searchTableIndex);
    }
  }, [props.noOfRows, props.data, props.searchTableIndex]);

  // TODO: spinner doesn't appear anymore check the logic
  const getSeriesData = async (selected, force) => {
    props.dispatch(startLoading());
    const { seriesData } = props;
    const { projectID, studyUID } = selected;
    let { patientID, subjectID } = selected;
    patientID = patientID ? patientID : subjectID;
    
    try {
      const dataExists =
      seriesData[projectID] &&
      seriesData[projectID][patientID] &&
      seriesData[projectID][patientID][studyUID];
      if (!dataExists) {
        const { data: series } = await getSeries(
          projectID,
          patientID,
          studyUID, 
          force
          );
        props.dispatch(setSeriesData(projectID, patientID, studyUID, series));
        props.dispatch(loadCompleted());
        return series;
      } else return seriesData[projectID][patientID][studyUID];
    } catch (err) {
      props.dispatch(annotationsLoadingError(err));
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

  const checkIfSerieOpen = (obj, openSeries) => {
    let isOpen = false;
    let index;
    const { seriesUID, projectID } = obj;
    openSeries.forEach((serie, i) => {
      if (serie.seriesUID === seriesUID && projectID === serie.projectID) {
        isOpen = true;
        index = i;
      }
    });
    return { isOpen, index };
  };

  const getExistingData = (selected) => {
    const { seriesData } = props;
    const { subjectID: patientID, studyUID, aimID, projectID, template } = selected;
    const dataExists =
    seriesData[projectID] &&
    seriesData[projectID][patientID] &&
    seriesData[projectID][patientID][studyUID];

    let existingData = dataExists
    ? seriesData[projectID][patientID][studyUID]
    : null;
    return existingData;
  }

  // CHECK
  const openAnnotation = async (selected) => {
    try {
      const { seriesUID, aimID } = selected;
      const { openSeries, seriesData } = props;

      const existingData = getExistingData(selected);

      setSelected(selected);
      // const serieObj = { projectID, patientID, studyUID, seriesUID, aimID };
      //check if there is enough space in the grid
      let isGridFull = openSeries.length === maxPort;
      //check if the serie is already open
      if (checkIfSerieOpen(selected, props.openSeries).isOpen) {
        const { index } = checkIfSerieOpen(selected, props.openSeries);
        props.dispatch(changeActivePort(index));
        // if series has not multiframes continue with the old logic
        props.dispatch(jumpToAim(seriesUID, aimID, index));
        // if there is a multiframe fire the event
        props.switchToDisplay();
      } else {
        if (isGridFull) {
          setShowSelectSeriesModal(true);
        } else {
          if (!selected.examType) {
            selected.examType = selected.modality;
          }
          props.dispatch(addToGrid(selected, aimID));
          props.dispatch(getSingleSerie(selected, aimID, null, existingData));
          //if grid is NOT full check if patient data exists
          // -----> Delete after v1.0 <-----
          // if (!props.patients[patientID]) {
          //   // this.props.dispatch(getWholeData(null, null, selected.original));
          //   getWholeData(null, null, selected);
          // } else {
          //   props.dispatch(
          //     updatePatient(
          //       'annotation',
          //       true,
          //       patientID,
          //       studyUID,
          //       seriesUID,
          //       aimID
          //     )
          //   );
          // }
          props.switchToDisplay();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getSignificantSeriesData = async (selected) => {
    try {
      const { subjectID: patientID, studyUID, projectID } = selected;
      const { data: seriesArr } = await getSignificantSeries(projectID, patientID, studyUID);
      return seriesArr;
    } catch (err) {
      console.error(err);
    }
  }

  // CHECK
  const displaySeries = async (selected) => {
    const { subjectID: patientID, studyUID, aimID, projectID, template } = selected;
    let isTeachingFile = teachingFileTempCode === template;
    let seriesArr;

    let existingData = getExistingData(selected);

    if (isTeachingFile) {
      seriesArr =  await getSignificantSeriesData(selected);
      if (seriesArr.length > 0){
        seriesArr = seriesArr.map( el => ({...el, patientID, studyUID, projectID, template }));}
      else if (existingData && existingData.length <= maxPort) {
        seriesArr = existingData;
      } else if (existingData && existingData.length > maxPort) {
        seriesArr = existingData.slice(0,maxPort);
        // setSelected(seriesArr);
        // setShowSelectSeriesModal(true);
      } else {
        seriesArr = await getSeriesData(selected, true);
        seriesArr = seriesArr.slice(0,maxPort);
      }
    } else {
      seriesArr = await getSeriesData(selected);
    }

    setSelected(seriesArr);
    if (props.openSeries.length === maxPort) {
      setShowSelectSeriesModal(true);
      return;
    }
    //get extraction of the series (extract unopen series)
    if (seriesArr && seriesArr.length > 0) seriesArr = excludeOpenSeries(seriesArr);

    // filter the series according to displayable modalities
    seriesArr = seriesArr.filter(isSupportedModality);

    //check if there is enough room
    if (seriesArr.length + props.openSeries.length > maxPort) {
      //if there is not bring the modal
      setShowSelectSeriesModal(true);
      // TODO show toast
    } else {
      //if there is enough room
      //add serie to the grid
      const promiseArr = [];

      existingData = getExistingData(selected);
      for (let i = 0; i < seriesArr.length; i++) {
        props.dispatch(addToGrid(seriesArr[i], aimID));
        promiseArr.push(props.dispatch(getSingleSerie(seriesArr[i], aimID, null, existingData)));
      }
    
      //getsingleSerie
      Promise.all(promiseArr)
        .then(() => {
          props.switchToDisplay();
        })
        .catch((err) => console.error(err));
    }
  };

  const { patientName } = props.filters;

  // TODOOOOOO: instead of creating the column array according to mode, mode attribute should be
  // added to columns and filtered that way

  let columns = [];
  if (mode === "teaching") {
    columns = React.useMemo(
      () => [
        {
          Header: "Select",
          id: "select",
          class: "select_row",
          Cell: ({ row }) => {
            return (
              <input
                type="checkbox"
                className="form-check-input __search-checkbox"
                id={row.original.aimID}
                // onClick={() => { props.updateSelectedAims(row.original); updateListOfSelected(row.original) }}
                // checked={listOfSelecteds[row.original.aimID]}
                // checked={props.allSelected}
              />
            );
          },
        },
        {
          Header: "Patient Name",
          accessor: "patientName",
          Cell: ({ row }) => {
            return (
              <div
                onClick={() => {
                  if (
                    row.original.seriesUID === "noseries" ||
                    !row.original.seriesUID
                  ) {
                    // study aim opening
                    displaySeries(row.original);
                  } else {
                    // series opening
                    openAnnotation(row.original);
                  }
                }}
                style={{ textDecoration: "underline", cursor: props.teachingLoading ? "wait" : "pointer" }}
              >
                {clearCarets(row.original.patientName)}
              </div>
            );
          },
        },
        {
          Header: "MRN",
          accessor: "subjectID",
        },
        {
          Header: "Acc No",
          accessor: "accessionNumber",
        },
        {
          accessor: "name",
        },
        {
          Header: "Age",
          accessor: "age",
        },
        {
          Header: "Sex",
          accessor: "sex",
        },
        {
          Header: "Modality",
          accessor: "modality",
          Cell: ({
            row: {
              original: { modality },
            },
          }) => {
            if (modality && compModality[modality])
              return (
                <div className={"modality-capital"}>
                  {compModality[modality]}
                </div>
              );
            else return <div className={"modality-capital"}>{modality}</div>;
          },
        },
        {
          Header: "Study Date",
          accessor: "studyDate",
          Cell: ({ row }) => {
            if (!row.original.studyDate) return <div></div>;
            const studyDateArr = convertDateFormat(
              row.original.studyDate,
              "studyDate"
            ).split(" ");
            return <div>{formatDate(studyDateArr[0])}</div>;
          },
        },
        {
          Header: "Anatomy",
          accessor: "anatomy",
          Cell: ({ row }) => {
            return (
              <div>
                {Array.isArray(row.original.anatomy)
                  ? row.original.anatomy.join(", ")
                  : row.original.anatomy}
              </div>
            );
          },
        },
        {
          Header: "Observation",
          accessor: "observation",
          style: { whiteSpace: "nowrap" },
          Cell: ({ row }) => {
            return (
              <div>
                {Array.isArray(row.original.observation)
                  ? row.original.observation.join(", ")
                  : row.original.observation}
              </div>
            );
          },
        },
        {
          Header: "Created",
          id: "date",
          accessor: "date",
          Cell: ({ row }) => {
            const studyDateArr = convertDateFormat(
              row.original.date,
              "date"
            ).split(" ");
            return <div>{formatDate(studyDateArr[0])}</div>;
          },
        },
        {
          Header: "Template",
          accessor: "templateType",
        },
        {
          Header: "User",
          accessor: "fullName",
          style: { whiteSpace: "normal" },
        },
        {
          Header: "Narrative",
          // accessor: 'userComment',
          Cell: ({ row }) => {
            const text = row.original.userComment;
            const subText =
              text || text?.length >= 100 ? text.substring(0, 100) + "..." : "";
            return (
              <>
                <div data-tip data-for="narrative">
                  {subText}
                </div>
                <ReactTooltip
                  id="narrative"
                  place="left"
                  type="info"
                  delayShow={500}
                >
                  <span className="filter-label">
                    Please open aim to see the narrative!
                  </span>
                </ReactTooltip>
              </>
            );
          },
        },
      ],
      // [data, listOfSelecteds, props.selectedAnnotations]
      [data]
    );
  } else {
    columns = React.useMemo(
      () => [
        {
          Header: "Select",
          id: "select",
          class: "select_row",
          Cell: ({ row }) => {
            return (
              <input
                type="checkbox"
                className="form-check-input __search-checkbox"
                id={row.original.aimID}
                // onClick={() => { props.updateSelectedAims(row.original); updateListOfSelected(row.original) }}
                // checked={props.allSelected || listOfSelecteds[row.original.aimID]}
              />
            );
          },
        },
        {
          Header: "Patient Name",
          accessor: "patientName",
          Cell: ({ row }) => {
            return (
              <div
                onClick={() => {
                  if (
                    row.original.seriesUID === "noseries" ||
                    !row.original.seriesUID
                  ) {
                    // study aim opening
                    displaySeries(row.original);
                  } else {
                    // series opening
                    openAnnotation(row.original);
                  }
                }}
                style={{ textDecoration: "underline", cursor: "pointer" }}
              >
                {clearCarets(row.original.patientName)}
              </div>
            );
          },
        },
        {
          Header: "Patient Id",
          accessor: "subjectID",
        },
        {
          Header: "Annotation Name",
          accessor: "name",
        },
        {
          Header: "Age",
          accessor: "age",
        },
        {
          Header: "Sex",
          accessor: "sex",
        },
        {
          Header: "Modality",
          accessor: "modality",
        },
        {
          Header: "Study Date",
          sortable: true,
          accessor: "studyDate",
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["date"] }),
          filterAll: true,
          Cell: ({ row }) => {
            if (!row.original.studyDate) return <div></div>;
            const studyDateArr = convertDateFormat(
              row.original.studyDate,
              "studyDate"
            ).split(" ");
            return <div>{formatDate(studyDateArr[0])}</div>;
          },
        },
        {
          Header: "Created",
          sortable: true,
          id: "date",
          accessor: "date",
          filterMethod: (filter, rows) =>
            matchSorter(rows, filter.value, { keys: ["date"] }),
          filterAll: true,
          Cell: ({ row }) => {
            const studyDateArr = convertDateFormat(
              row.original.date,
              "date"
            ).split(" ");
            return <div>{formatDate(studyDateArr[0])}</div>;
          },
        },
        {
          Header: "Template",
          accessor: "template",
        },
        {
          Header: "User",
          accessor: "fullName",
          style: { whiteSpace: "normal" },
        },
        {
          Header: "Comment",
          accessor: "userComment",
        },
      ],
      // [data, listOfSelecteds, props.selectedAnnotations]
      [data]
    );
  }

  const fetchData = useCallback(
    ({ pageIndex }) => {
      if (props.data.length <= pageIndex * defaultPageSize) {
        props.getNewData(pageIndex);
      } else {
        preparePageData(props.data, defaultPageSize, props.searchTableIndex);
      }
    },
    [props.bookmark, props.searchTableIndex]
  );

  return (
    <>
      <Table
        columns={columns}
        data={data}
        selected={props.selected}
        pageCount={pageCount}
        noOfRows={props.noOfRows}
        fetchData={fetchData}
        updateSelectedAims={props.updateSelectedAims}
        controlledPageIndex={props.searchTableIndex}
        handlePageIndex={handlePageIndex}
        // listOfSelecteds={listOfSelecteds}
        handleSort={props.handleSort}
        handleFilter={props.handleFilter}
      />
      {showSelectSeriesModal && (
        <SelectSerieModal
          seriesPassed={Array.isArray(selected) ? [selected] : [[selected]]}
          onCancel={() => {
            setShowSelectSeriesModal(false);
            setSelected({});
          }}
          // studyName={serie.studyDescription}
        />
      )}
    </>
  );
}

const mapsStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    patients: state.annotationsListReducer.patients,
    uploadedPid: state.annotationsListReducer.uploadedPid,
    lastEventId: state.annotationsListReducer.lastEventId,
    refresh: state.annotationsListReducer.refresh,
    projectMap: state.annotationsListReducer.projectMap,
    selectedAnnotations: state.annotationsListReducer.selectedAnnotations,
    searchTableIndex: state.annotationsListReducer.searchTableIndex,
    seriesData: state.annotationsListReducer.seriesData,
  };
};

export default connect(mapsStateToProps)(AnnotationTable);
