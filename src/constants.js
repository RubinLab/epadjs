export const MAX_PORT = 4;
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
];

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
      DISP_MODALITIES;
    }
    return date + " " + hour;
  }
};
