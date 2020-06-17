import React from "react";
import { connect } from "react-redux";
import "../annotationsList.css";

const annotationsLink = props => {
  const { openSeries, activePort, aimsList } = props;
  const { seriesUID } = openSeries[activePort];
  let list = [];
  if (aimsList[seriesUID]) {
    const seriesAims = Object.values(aimsList[seriesUID]);
    list = seriesAims.map((aim, i) => {
      if (!props.imageAims[aim.id]) {
        return (
          <div
            key={aim.id}
            className="annotationsLink"
            data-id={aim.id}
            data-serie={seriesUID}
            onClick={props.jumpToAim}
          >
            {aim.name}
          </div>
        );
      }
    });
  }

  return <React.Fragment>{list}</React.Fragment>;
};

const mapStateToProps = state => {
  return {
    openSeries: state.annotationsListReducer.openSeries,
    activePort: state.annotationsListReducer.activePort,
    aimsList: state.annotationsListReducer.aimsList,
  };
};
export default connect(mapStateToProps)(annotationsLink);
