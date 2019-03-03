import React from 'react';
import { FaWindowClose } from 'react-icons/fa'

const managementHeader = ({selection, onClose}) => {
  return (
    <div className="mng-header">
      <div className="mang-header__title">{selection}</div>
      <div  className="mng-header__close"> 
        <FaWindowClose onClick={onClose}/>    
      </div> 
    </div>
  );
} 

export default managementHeader;