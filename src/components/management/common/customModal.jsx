import React from 'react';
import ResizeAndDrag from './resizeAndDrag';

const customModal = props => {
  return (
    <div>
      <div className="modal-overlay-div" />
      <div className="modal-content-div">
        <ResizeAndDrag>
          <div className="modal-dialog-div">{props.children}</div>
        </ResizeAndDrag>
      </div>
    </div>
  );
};

export default customModal;
