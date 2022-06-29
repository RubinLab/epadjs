import React from "react";
import { connect } from "react-redux";
import "../annotationsList.css";

const handleJumpToAim = aimId => {
  window.dispatchEvent(
    new CustomEvent("jumpToAimImage", { detail: aimId })
  );
};

const annotationsLink = (props) => {
  const { openSeries, activePort, aimsList } = props;
  const { seriesUID } = openSeries[activePort];
  let list = [];
  let header = [];



  if (aimsList[seriesUID]) {
    const seriesAims = Object.values(aimsList[seriesUID]);
    header = [
      <th
        className="annsLink-table __header --cell"
        key="anns-header"
        id="annsHeader"
      >
        Other Image Annotations in Series
      </th>,
      // <th
      //   className="annsLink-table __header --cell"
      //   key="slide-header"
      //   id="annsImgSlide"
      // >
      //   Slice#
      // </th>,
    ];

    list = seriesAims.map((aim, i) => {
      if (!props.imageAims[aim.id]) {
        return (
          <tr key={aim.id} className="annsLink-table __tbody --row">
            <td
              data-id={aim.id}
              data-serie={seriesUID}
              onClick={(e) => handleJumpToAim(aim.id)}
              className="annsLink-table __tbody --cell"
            >
              {aim.name}
            </td>
            {/* <td className="annsLink-table __tbody --cell2">{slideNo}</td> */}
          </tr>
        );
      }
    });
  }

  return (
    <React.Fragment>
      {aimsList[seriesUID] && (
        <table className="annsLink-table">
          <thead className="annsLink-table __header">
            <tr className="annsLink-table __header --row" >{header}</tr>
          </thead>
          <tbody className="annsLink-table __tbody" style={{ backgroundColor: '#333' }}>{list}</tbody>
        </table>
      )}
    </React.Fragment>
  );
};

const mapStateToProps = (state) => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort,
    aimsList: state.annotationsListReducer.aimsList,
  };
};
export default connect(mapStateToProps)(annotationsLink);
