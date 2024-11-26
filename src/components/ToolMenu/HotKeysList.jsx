import React, { Component } from "react";
import Draggable from "react-draggable";
import "./FuseSelector.css";

const HotKeysList = (props) => {
        const formList = () => {

        }

        return (
            <Draggable>
                <div className="hotkeys-selector">
                    <span className="hotkeys-title">Hot keys for tools</span>
                    <hr />
                    <div className="close-fuse-selector" onClick={props.onClose}>
                        <a href="#">X</a>
                    </div>
                    {props.list}
                </div>
            </Draggable>
        );
    }


export default HotKeysList;
