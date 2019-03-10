import React from 'react';
import ResizeAndDrag from './resizeAndDrag';

class CustomModal extends React.Component {
  // listenKeyboard = event => {
  //   if (event.key === 'Escape' || event.keyCode === 27) {
  //     this.props.onClose();
  //   }
  // };

  // componentDidMount = () => {
  //   if (this.props.onClose) {
  //     window.addEventListener('keydown', this.listenKeyboard, true);
  //   }
  // };

  // componentWillUnmount = () => {
  //   if (this.props.onClose) {
  //     window.removeEventListener('keydown', this.listenKeyboard, true);
  //   }
  // };

  // onDialogClick = event => {
  //   event.stopPropagation();
  // };

  render() {
    return (
      <div>
        <div className="modal-overlay-div" />
        <div className="modal-content-div">
          <input type="text" />
          <ResizeAndDrag>
            <div className="modal-dialog-div" onClick={this.onDialogClick}>
              {this.props.children}
            </div>
          </ResizeAndDrag>
        </div>
      </div>
    );
  }
}

export default CustomModal;
