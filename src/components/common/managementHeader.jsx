import React from 'react';
import { FaWindowClose } from 'react-icons/fa'

const managementHeader = ({selection, onClose}) => {
  return (
    <div className="mng-header">
      <h3 class="mang-header__title">{selection}</h3>
      <FaWindowClose class="mng-header__close" onClick={onClose}/>     
    </div>
  );
} 

export default managementHeader;