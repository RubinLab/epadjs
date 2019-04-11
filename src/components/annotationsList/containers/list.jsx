import React from "react";
import ListItem from "./listItem";

const list = ({ series, selectedSerie }) => {
  const seriesMenu = [];
  series.forEach(serie => {
    seriesMenu.push(
      <ListItem
        serie={serie}
        selected={selectedSerie === serie.seriesUID}
        key={serie.seriesUID}
      />
    );
  });
  return <div>{seriesMenu}</div>;
};

export default list;
