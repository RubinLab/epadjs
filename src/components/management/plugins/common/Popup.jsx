import React, { useState } from 'react';
import Draggable from 'react-draggable';
import '../css/plugin.css';
import '../../menuStyle.css';


export default function Popup({ children }) {
  const pluginWindowClickHandler = e => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Draggable
      //  handle="plugin_runtime_params_header"
      onClick={pluginWindowClickHandler}
      onMouseDown={pluginWindowClickHandler}
      onMouseMove={pluginWindowClickHandler}
    >
      <div
        id="plugin-common-popup"
        // className="pluginlogpopup"
        onClick={pluginWindowClickHandler}
        onMouseDown={pluginWindowClickHandler}
        onMouseMove={pluginWindowClickHandler}
      >
          {children}
      </div>
    </Draggable>
  );
}
