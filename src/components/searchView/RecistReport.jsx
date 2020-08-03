import React, { useState } from 'react';
import { renderTable } from './recist';

const data1 = {
  stTimepoints: [0],
  studyDates: ['20140714'],
  tLesionNames: ['recist - Lesion1'],
  tRRBaseline: [0],
  tRRMin: [0],
  tResponseCats: ['BL'],
  tSums: [6.02393102645874],
  tTable: [['recist - Lesion1', 'target', 'liver', '6.02393102645874']],
  tTimepoints: [0],
  tUIDs: [
    [
      {
        studyUID: '1.2.840.113745.101000.1184000.41818.7169.14026319',
        aimUID: '2.25.296225463876943997338555721896862073871',
        location: 'liver',
        modality: 'MR',
        seriesUID: '1.2.840.113619.2.176.6945.3933072.10874.1405340255.478',
        studyUID: '1.2.840.113745.101000.1184000.41818.7169.14026319',
        timepoint: 0,
        type: 'target',
      },
    ],
  ],
};

const RecistReport = () => {
  console.log('trying');
  renderTable();
  return <div id="recisttbl"> HERE!!!!!!</div>;

 
};

export default RecistReport;

// export function renderTable(
//   serverUrl,
//   id,
//   patId,
//   projectId,
//   report,
//   template,
//   data
// ) 