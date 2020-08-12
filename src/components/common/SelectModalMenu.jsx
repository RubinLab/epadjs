import React, { useState, useEffect } from 'react';

const SelectModalMenu = ({ list, onClick }) => {
  const [location, setLocation] = useState({ x: 0, y: 0 });
  const [options, setOptions] = useState([]);

  const getLocation = () => {
    const element = document
      .getElementById('navbarReports')
      .getBoundingClientRect();
    return element;
  };

  useEffect(() => {
    let { right, bottom } = getLocation();
    setLocation({ x: right - 10, y: bottom + 3 });
  }, []);

  useEffect(() => {
    const options = list.reduce((all, item, i) => {
      all.push(
        <div
          className={'selectModalMenu__option'}
          data-opt={item.name}
          onClick={onClick}
          key={`${item.name}-${i}`}
        >
          {item.name}
        </div>
      );
      return all;
    }, []);
    setOptions(options);
  }, []);

  return (
    <div>
      <div
        className="selectModalMenu"
        style={{ left: location.x, top: location.y }}
      >
        {options}
      </div>
    </div>
  );
};

export default SelectModalMenu;

// setWrapperRef = node => {
//   this.wrapperRef = node;
// };

// componentDidMount() {
//   document.addEventListener("mousedown", this.handleClickOutside);
//   document.addEventListener("keydown", this.handleClickOutside);
// }

// componentWillUnmount() {
//   document.removeEventListener("mousedown", this.handleClickOutside);
//   document.removeEventListener("keydown", this.handleClickOutside);
// }

// handleClickOutside = event => {
//   if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
//     this.props.onClose();
//   }
// };
