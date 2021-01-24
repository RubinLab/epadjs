import React, { useState } from 'react';
import SearchLine from './SearchFieldsLine.jsx';
import './annotationSearch.css';

const AnnotationSearch = () => {
  const [searchData, setSearchData] = useState([{}]);
  const increaseCount = () => {
    setSearchData([...searchData, {}]);
  };

  const decreaseCount = row => {
    const newSearchData = [...searchData];
    newSearchData.splice(row - 1, 1);
    setSearchData(newSearchData);
  };

  return (
    <div
      class="form-group annotationSearch-container"
      style={{ width: '-webkit-fill-available' }}
    >
      {searchData.map((el, i) => (
        <SearchLine
          onPlus={increaseCount}
          onMinus={decreaseCount}
          count={i + 1}
        />
      ))}
    </div>
  );
};

export default AnnotationSearch;
