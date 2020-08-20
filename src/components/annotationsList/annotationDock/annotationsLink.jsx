import React from "react";
import { connect } from "react-redux";
import "../annotationsList.css";

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
        Description
      </th>,
      <th
        className="annsLink-table __header --cell"
        key="slide-header"
        id="annsImgSlide"
      >
        img
      </th>,
    ];

    list = seriesAims.map((aim, i) => {
      if (!props.imageAims[aim.id]) {
        console.log("Aim json", aim.json);
        let slideNo;
        let { comment } = aim.json;
        if (comment) {
          comment = Object.values(comment);
          console.log("Comment", comment);
          slideNo = comment.length > 0 ? comment[0].split("/")[2] : "";
        }
        return (
          <tr key={aim.id} className="annsLink-table __tbody --row">
            <td
              data-id={aim.id}
              data-serie={seriesUID}
              onClick={(e) => props.jumpToAim(slideNo, seriesUID)}
              className="annsLink-table __tbody --cell"
            >
              {aim.name}
            </td>
            <td className="annsLink-table __tbody --cell2">{slideNo}</td>
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
            <tr className="annsLink-table __header --row">{header}</tr>
          </thead>
          <tbody className="annsLink-table __tbody">{list}</tbody>
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
