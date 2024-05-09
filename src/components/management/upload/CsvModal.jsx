import React, { useState } from "react";
import { connect } from "react-redux";
import "./csvModal.css";

const CsvModal = (props) => {
    const [uploadSpreadsheet, setUploadSpreadsheet] = useState(false);
    const [uploadAimFile, setUploadAimFile] = useState(false);

    console.log(" ----> here")
    return (
        <div className="csv-modal-body">   
            <div className="overlay-dk">
                <div id="series-window-bk">
                    <div className="series-header">Bootstrap/Bulk Upload Window <i className="bi bi-x-circle" onClick={props.onCancel}></i></div>
                    <div className="series-body filter-control">
                        STELLA uses AIM files (Annotation and Image Markup) as the basis for each Teaching File. <br />
                        To batch create AIM files from a spreadsheet and upload them to STELLA, select from the following options:
                    </div>
                    <div className="series-body">
                        <div className="container upload-option">
                            <a dataBs-toggle="collapse" href="#collapseDescription" role="button" aria-expanded="false"
                                aria-controls="collapseDescription">
                            <input className="form-radio-input" type="radio" value="" id="flexCheckDefault" onChange={() => {setUploadSpreadsheet(true); setUploadAimFile(false)}} checked={uploadSpreadsheet} />
                                </a> 
                                I have a spreadsheet of cases and I want to batch create AIM files.
                            {uploadSpreadsheet && <div className="top-margin" id="collapseDescription">
                                <p className="indent">Your file has to be in comma separated value (csv) format and contain the critical
                                information and identical header titles needed to create a valid teaching file. <br />A sample csv file can
                                be downloaded <a href="#">here</a>.</p>
                                <div className="container">
                                <label htmlFor="formFile" className="form-label">Upload CSV file to bootstrap teaching files in bulk:</label>
                                <input className="form-control" type="file" id="formFile" />
                            </div>
                            </div>}
                        </div>
                        <div className="container upload-option">
                        <a data-bs-toggle="collapse" href="#collapseUpload" role="button" aria-expanded="false"
                            aria-controls="collapseUpload">
                            <input className="form-radio-input" type="radio" value="" id="flexCheckDefault" onChange={() => { setUploadAimFile(true); setUploadSpreadsheet(false)}} checked={uploadAimFile} /></a> I have or just created AIM
                            files and want to upload them to STELLA!.
                        {uploadAimFile && <div className="container top-margin" id="collapseUpload">
                            <label htmlFor="formFile" className="form-label">Upload JSON files:</label>
                            <input className="form-control" type="file" id="formFileMultiple" multiple />
                        </div>}
                        </div>
                        <div className="series-selection-buttons">
                        <button className="btn btn-sm btn-secondary btn-selection"> Submit</button>
                        <button className="btn btn-sm btn-secondary btn-selection" onClick={props.onCancel}> Cancel </button>
                        </div>
                    </div>
                




                </div>
            </div>
        </div>
    );
}

export default CsvModal;
