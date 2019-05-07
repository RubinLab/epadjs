var dcmDesignator = "DCM";
var lexVersion = "20121129";
//from the link below
//http://dicom.nema.org/medical/dicom/current/output/chtml/part16/sect_CID_29.html
//http://www.dicomlibrary.com/dicom/sop/

//Default Values=> codeValue:99EPADM0 codeMaeaning:NA codingSchemeDesignator:99EPAD

export var modalities = {
  "1.2.840.10008.5.1.4.1.1.2": {
    codeValue: "CT",
    codeMeaning: "Computed Tomography",
    codingSchemeDesignator: dcmDesignator,
    codingSchemeVersion: lexVersion
  },
  "1.2.840.10008.5.1.4.1.1.1": {
    codeValue: "CR",
    codeMeaning: "Computed Radiography",
    codingSchemeDesignator: dcmDesignator,
    codingSchemeVersion: lexVersion
  },
  "1.2.840.10008.5.1.4.1.1.128": {
    codeValue: "PT",
    codeMeaning: "Positron emission tomography",
    codingSchemeDesignator: dcmDesignator,
    codingSchemeVersion: lexVersion
  },
  "1.2.840.10008.5.1.4.1.1.4": {
    codeValue: "MR",
    codeMeaning: "Magnetic Resonance",
    codingSchemeDesignator: dcmDesignator,
    codingSchemeVersion: lexVersion
  },
  "1.2.840.10008.5.1.4.1.1.6.1": {
    codeValue: "US",
    codeMeaning: "Ultrasound",
    codingSchemeDesignator: dcmDesignator,
    codingSchemeVersion: lexVersion
  },
  "1.2.840.10008.5.1.4.1.1.1.2": {
    codeValue: "MG",
    codeMeaning: "Mammography",
    codingSchemeDesignator: dcmDesignator,
    codingSchemeVersion: lexVersion
  },
  "1.2.840.10008.5.1.4.1.1.1.2.1": {
    codeValue: "MG",
    codeMeaning: "Mammography",
    codingSchemeDesignator: dcmDesignator,
    codingSchemeVersion: lexVersion
  },
  CT: {
    codeValue: "CT",
    codeMeaning: "Computed Tomography",
    codingSchemeDesignator: dcmDesignator,
    codingSchemeVersion: lexVersion
  },
  CR: {
    codeValue: "CR",
    codeMeaning: "Computed Radiography",
    codingSchemeDesignator: dcmDesignator,
    codingSchemeVersion: lexVersion
  },
  PT: {
    codeValue: "PT",
    codeMeaning: "Positron emission tomography",
    codingSchemeDesignator: dcmDesignator,
    codingSchemeVersion: lexVersion
  },
  MR: {
    codeValue: "MR",
    codeMeaning: "Magnetic Resonance",
    codingSchemeDesignator: dcmDesignator,
    codingSchemeVersion: lexVersion
  },
  US: {
    codeValue: "US",
    codeMeaning: "Ultrasound",
    codingSchemeDesignator: dcmDesignator,
    codingSchemeVersion: lexVersion
  },
  MG: {
    codeValue: "MG",
    codeMeaning: "Mammography",
    codingSchemeDesignator: dcmDesignator,
    codingSchemeVersion: lexVersion
  }
};
