import React from "react";
import ListItem from "./listItem";

//series array will be passed
const list = ({ series }) => {
  const seriesMenu = [];
  series.forEach(serie => {
    seriesMenu.push(<ListItem serie={serie} key={serie.seriesUID} />);
  });
  return <div>{seriesMenu}</div>;
};

export default list;
