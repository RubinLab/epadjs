export const widthUnit = 20;
export const DISP_MODALITIES = [
  "CT",
  "MR",
  "PT",
  "MG",
  "CR",
  "US",
  "DX",
  "OT",
  "XA",
  "OCT",
  "NM",
  "PX"
];

export const COMP_MODALITIES = { "rid10341": "PET-CT", "rid10342": "PET-MR", "rid49581": "US-RF" };

export const COMP_MODALITY_VALS = { "PET-CT": "RID10341", "PET-MR": "RID10342", "US-RF": "RID49581" };

export const formatDates = (timeStamp) => {
  //split it by space
  timeStamp = timeStamp + "";
  if (!timeStamp.includes(" ")) {
    return timeStamp;
  }
  if (timeStamp) {
    const dateArr = timeStamp.split(" ");
    let date = (date = dateArr[0]);
    //get the first 5 digit of the time
    let hour = dateArr[1].substring(0, 5);
    //if date has not '-', add it
    if (!dateArr[0].includes("-")) {
      let year = dateArr[0].substring(0, 4);
      let month = dateArr[0].substring(4, 6);
      let day = dateArr[0].substring(6, 8);
      date = `${year}-${month}-${day}`;
    }
    return date + " " + hour;
  }
};

export const teachingFileTempUid =
  "2.25.182468981370271895711046628549377576999";
export const teachingFileTempCode = "99EPAD_947";

export const keyMap = {
  'ctrl + y': 'Aim save',
  f: 'Arrow',
  r: 'Circle',
  x: 'Expand view',
  i: 'Invert',
  d: 'Length',
  p: 'Pan',
  o: 'Perpendicular',
  space: 'Reset',
  s: 'Select',
  w: 'Window-Level',
  z: 'Zoom',
}

export const reverseKeyMap = {
  'Aim save': 'ctrl + y',
  'Arrow': 'f',
  'Circle': 'r',
  'Expand view': 'x',
  'Invert': 'i',
  'Length': 'd',
  'Pan': 'p',
  'Perpendicular': 'o',
  'Reset': 'space',
  'Select': 's',
  'Window-Level': 'w',
  'Zoom': 'z',
}