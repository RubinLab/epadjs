import React, { Component } from "react";
import Draggable from "react-draggable";
import "./FuseSelector.css";

const HotKeysList = (props) => {
    

        return (
            <Draggable>
                <div className="hotkeys-selector">
                    <span className="hotkeys-title">Hot keys for tools</span>
                    <hr />
                    <div className="close-fuse-selector" onClick={props.onClose}>
                        <a href="#">X</a>
                    </div>
                    <ul>{props.list}</ul>
                </div>
            </Draggable>
        );
    }


export default HotKeysList;
