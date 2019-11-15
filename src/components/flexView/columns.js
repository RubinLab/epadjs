// birthdate: "19441101";
// createdTime: "";
// firstSeriesDateAcquired: "";
// firstSeriesUID: "";
// physicianName: "";
// referringPhysicianName: "UNKNOWN";
// studyAccessionNumber: "0";

export const studyColumns = [
  {
    Header: "Exam Types",
    accessor: "examTypes",
    sortable: false,
    show: true
    // Cell: row => <div>{row.original.examTypes.join(" ,")}</div>
  },
  { Header: "Patient", accessor: "patientName", sortable: true, show: true },
  { Header: "PatientID", accessor: "patientID", sortable: true, show: true },
  { Header: "Sex", accessor: "sex", sortable: true, show: true },
  {
    Header: "Description",
    accessor: "seriesDescription" || "studyDescription",
    sortable: true,
    show: true
  },
  { Header: "Insert Date", accessor: "insertDate", sortable: true, show: true },
  { Header: "Study Date", accessor: "studyDate", sortable: true, show: true },
  { Header: "Study Time", accessor: "studyTime", sortable: true, show: true },
  {
    Header: "UID",
    accessor: "seriesUID" || "studyUID",
    sortable: true,
    show: true
  },
  {
    Header: "# of Aims",
    accessor: "numberOfAnnotations",
    sortable: true,
    show: true
  },
  {
    Header: "# Of Img",
    accessor: "numberOfImages",
    sortable: true,
    show: true
  },
  {
    Header: "# Of Series",
    accessor: "numberOfSeries",
    sortable: true,
    show: true
  },
  {
    Header: "created Time",
    accessor: "createdTime",
    sortable: true,
    show: true
  },
  {
    Header: "insert Date",
    accessor: "insertDate",
    sortable: true,
    show: true
  },
  {
    Header: "birth date",
    accessor: "birthdate",
    sortable: true,
    show: true
  }
];
