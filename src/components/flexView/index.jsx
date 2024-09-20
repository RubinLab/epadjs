import React from "react";
import { connect } from "react-redux";
import PropagateLoader from "react-spinners/PropagateLoader";
import ReactTable from "react-table-v6";
import treeTableHOC from "react-table-v6/lib/hoc/treeTable";
import _ from "lodash";
import { Button } from "react-bootstrap";
import WarningModal from "../common/warningModal";
import { getSeries } from "../../services/seriesServices";
import { getStudies } from "../../services/projectServices";
import ColumnSelect from "./ColumnSelect.jsx";
import StudyTable from "./StudyTable";
import SelectSerieModal from "../annotationsList/selectSerieModal";
import SeriesTable from "./SeriesTable";
import { isSupportedModality } from "../../Utils/aid.js";
import {
  addToGrid,
  getSingleSerie,
  clearSelection,
  setSeriesData,
  setLastLocation
} from "../annotationsList/action";
import "react-table-v6/react-table.css";
// import "../annotationSearch/annotationSearch.css";
// import "./flexView.css";

const TreeTable = treeTableHOC(ReactTable);
let mode;
let maxPort;

class FlexView extends React.Component {
  mode = sessionStorage.getItem("mode");
  maxPort = sessionStorage.getItem("maxPort");
  state = {
    columns: [],
    order:
      mode === "teaching" ? [1, 8, 16, 4, 6, 9, 13, 3] : [1, 4, 0, 10, 11, 6],
    expanded: {},
    seriesTableOpen: false,
    series: [],
    showWarning: false,
    loading: false
  };

  studyColumns = [
    "Exam",
    "Patient Name",
    "PatientID",
    "Sex",
    "Description",
    // "Insert Date",
    "Study Date",
    "Study Time",
    "Study UID",
    "# of Aims",
    "# Of Img",
    "# Of Series",
    "Created Time",
    "Birth Date",
    "Project ID",
    "Referring Physician Name",
    `Study Accession Number`,
    "Study ID",
  ];

  mountEvents = () => {
    let headers = Array.prototype.slice.call(
      document.querySelectorAll(".rt-th.rt-resizable-header")
    );
    headers.forEach((header, i) => {
      header.setAttribute("draggable", true);
      header.ondrag = (e) => e.stopPropagation();
      header.ondragend = (e) => e.stopPropagation();
      header.ondragover = (e) => e.preventDefault();

      header.ondragstart = (e) => {
        e.stopPropagation();
        this.draggedCol = i;
        // Firefox needs this to get draggin workin
        // See https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations
        e.dataTransfer.setData("text", "fix firefox dragevents");
      };

      header.ondrop = async (e) => {
        e.preventDefault();
        // Remove item from array and stick it in a new position.

        let newOrder = [...this.state.order];
        newOrder.splice(i, 0, newOrder.splice(this.draggedCol, 1)[0]);
        await this.setState({ order: newOrder });
        this.defineColumns();
        this.mountEvents();
      };
    });
  };

  displaySeries = async (projectID, patientID, studyUID) => {
    const { seriesData } = this.props;
    let series;
    const dataExists =
      seriesData[projectID] &&
      seriesData[projectID][patientID] &&
      seriesData[projectID][patientID][studyUID] &&
      seriesData[projectID][patientID][studyUID].list;

    const existingData = dataExists
      ? seriesData[projectID][patientID][studyUID].list
      : null;

    try {
      if (!dataExists) {
        this.setState({ loading: true });
        ({ data: series } = await getSeries(projectID, patientID, studyUID));
        this.setState({ loading: false });
        this.props.dispatch(
          setSeriesData(projectID, patientID, studyUID, series, true)
        );
      } else series = seriesData[projectID][patientID][studyUID].list;
    } catch (err) {
      console.log("Error getting series of the study", err);
    }
    if (this.props.openSeries.length === this.maxPort) {
      this.setState({ showSeriesTable: true, series });
      return;
    }
    //get only unopen series
    if (series.length > 0) series = this.excludeOpenSeries(series);
    // filter series that have displayable modality
    series = series.filter(isSupportedModality);
    if (series.length === 0) {
      this.setState({ showWarning: true });
    } else {
      //check if there is enough room
      if (series.length + this.props.openSeries.length > this.maxPort) {
        //if there is not bring the modal
        this.setState({ showSeriesTable: true, series });
        // TODO show toast
      } else {
        //if there is enough room
        //add serie to the grid
        const promiseArr = [];
        for (let i = 0; i < series.length; i++) {
          this.props.dispatch(addToGrid(series[i]));
          promiseArr.push(this.props.dispatch(getSingleSerie(series[i], null, null, existingData)));
        }
        //getsingleSerie
        Promise.all(promiseArr)
          .then(() => {
            this.props.history.push("/display");
          })
          .catch((err) => console.error(err));
      }
    }
  };

  excludeOpenSeries = (allSeriesArr) => {
    const result = [];
    //get all series number in an array
    const idArr = this.props.openSeries.reduce((all, item, index) => {
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

  closeSeriesTable = () => {
    this.setState({ showSeriesTable: false, series: [] });
  };

  componentDidMount = async () => {
    const order = JSON.parse(sessionStorage.getItem("studyListColumns"));
    const lastLocation = this.props.location && this.props.location.pathname ? this.props.location.pathname : '/'
    this.props.dispatch(setLastLocation(lastLocation));
    this.props.dispatch(clearSelection());
    if (order && order.length) this.setState({ order });
    try {
      if (this.props.pid) {
        await this.getData(this.props.pid);
        await this.defineColumns();
        this.mountEvents();
      }
    } catch (err) {
      console.error(err);
    }
  };

  componentDidUpdate = async (prevProps) => {
    const { lastEventId, refresh } = this.props;

    try {
      if (prevProps.pid !== this.props.pid) {
        await this.getData(this.props.pid);
        await this.defineColumns();
      }

      if (prevProps.lastEventId !== lastEventId && refresh) {
        await this.getData(this.props.pid);
        await this.defineColumns();
      }
    } catch (err) {
      console.log(err);
    }
  };
  getData = async (pid) => {
    const { data: studies } = await getStudies(pid);
    this.setState({ data: studies });
  };

  componentWillUnmount = () => {
    sessionStorage.setItem(
      "studyListColumns",
      JSON.stringify(this.state.order)
    );
  };

  defineColumns = () => {
    const { order } = this.state;
    const tableColumns = [];
    for (let item of order) {
      tableColumns.push(this.studyColumns[item]);
    }
    this.setState({ columns: tableColumns });
  };

  // selectDropdown = (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   this.setState((state) => ({ dropdownSelected: !state.dropdownSelected }));
  // };

  toggleColumn = async (e) => {
    const index = this.state.order.findIndex(
      (i) => i === parseInt(e.target.value)
    );
    let newOrder;
    if (index >= 0) {
      newOrder = this.state.order
        .slice(0, index)
        .concat(this.state.order.slice(index + 1));
    } else {
      newOrder = [...this.state.order];
      newOrder.push(parseInt(e.target.value));
    }
    await this.setState({ order: newOrder });
    this.defineColumns();
    this.mountEvents();
  };

  handleExpand = (newExpanded, index, event) => {
    this.setState({ expanded: newExpanded });
  };
  render = () => {
    const { order, data, series, showSeriesTable } = this.state;
    return (
      <>
        <div className="flexView" style={{ fontSize: "12px" }}>
          {showSeriesTable && (
            // <SeriesTable series={series} onClose={this.closeSeriesTable} />
            <SelectSerieModal
              seriesPassed={[series]}
              onCancel={this.closeSeriesTable}
            />
          )}
          <ColumnSelect
            order={order}
            onChecked={this.toggleColumn}
            studyColumns={this.studyColumns}
            onClose={this.selectDropdown}
          />
          { this.state.loading && ( <div style={{height: "20px", marginLeft: "20px", width:"100px"}}>
            <PropagateLoader
              color={"#7A8288"}
              loading={this.state.loading}
              margin={"20"}
              />
          </div>)}
          {this.state.data && (
            <StudyTable
              data={data}
              order={order}
              displaySeries={this.displaySeries}
            />
          )}
        </div>
        {this.state.showWarning && (
          <WarningModal
            onOK={() => this.setState({ showWarning: false })}
            title={"No series to display"}
            message={"There is no Series to display in the Study"}
          />
        )}
      </>
    );
  };
}

const mapStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    lastEventId: state.annotationsListReducer.lastEventId,
    refresh: state.annotationsListReducer.refresh,
    seriesData: state.annotationsListReducer.seriesData,
  };
};

export default connect(mapStateToProps)(FlexView);
