import React from "react";
import { Modal } from "react-bootstrap";
import ListItem from "./listItem";

const responseList = ({ onOK, list, title }) => {
  return (
    <>
      {list.map(item => (
        <ListItem item={item} />
      ))}
    </>
  );
};

export default responseList;
