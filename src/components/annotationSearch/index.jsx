import React, { useState } from 'react';
import _ from 'lodash';
import { toast } from 'react-toastify';
import SearchLine from './SearchFieldsLine.jsx';
import './annotationSearch.css';

const AnnotationSearch = () => {
  const [searchData, setSearchData] = useState([{}]);
  const [openPar, setOpenPar] = useState(false);
  const [closePar, setClosePar] = useState(false);
  
  // new shape for closePar & openPar 
  // {count: 1, lastIndex:3} 
  // if counts are not equal make
  // when counts are equal set corresponding index 
  // if indexes would become equal after the click set both indexes to null

  const increaseCount = () => {
    setSearchData([...searchData, {}]);
  };

  const decreaseCount = row => {
    const newSearchData = [...searchData];
    newSearchData.splice(row - 1, 1);
    setSearchData(newSearchData);
  };

  const handleFormInput = (e, index) => {
    const { name, value } = e.target;
    console.log('name, value', name, value, index);
    const newSearchData = _.cloneDeep(searchData);
    const newItem = newSearchData[index - 1];
    if (name === 'openpar' || name === 'closepar') {
      const duplicateOpenPar =
        name === 'openpar' && !newItem.openpar && openPar;
      const duplicateClosePar =
        name === 'closepar' && !newItem.closepar && closePar;

      if (duplicateOpenPar || duplicateClosePar) {
        toast.error(
          "Can't have duplicate openning or closing parenthesis! Please close or remove the parenthesis."
        );
        return;
      } else if (name === 'openpar') {
        // openning parenthesis is not open for the line
        if (!newItem.openpar) { 
          // if there is already a closing parenthesis
          // means the cyle completed set both false
          if (closePar) {
            setOpenPar(false);
            setClosePar(false);
            // else set opening par true
          } else {
            setOpenPar(true);
          }
        } else {
          // if openining paranthesis already open for
          // the line means removing it
          // setClosePar(true);
          setOpenPar(false);
        }
        newItem.openpar = !newItem.openpar;
      } else if (name === 'closepar') {
        if (!newItem.closepar) {
          if (openPar) {
            setOpenPar(false);
            setClosePar(false);
          } else {
            setClosePar(true);
          }
        } else {
          setClosePar(false);
          // setOpenPar(true);
        }
        newItem.closepar = !newItem.closepar;
      }
      setSearchData(newSearchData);
    }
  };

  return (
    <div
      className="form-group annotationSearch-container"
      style={{ width: '-webkit-fill-available' }}
    >
      {searchData.map((el, i) => (
        <SearchLine
          onPlus={increaseCount}
          onMinus={decreaseCount}
          index={i + 1}
          count={searchData.length}
          item={searchData[i]}
          postFormInput={handleFormInput}
          key={`i-${i}`}
        />
      ))}
    </div>
  );
};

export default AnnotationSearch;
