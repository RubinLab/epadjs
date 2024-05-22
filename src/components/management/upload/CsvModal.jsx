import React, { useState } from "react";
import { toast } from 'react-toastify';
import { uploadBulk } from "services/annotationServices";
import { uploadFileToProject } from '../../../services/projectServices';
import "./csvModal.css";

const CsvModal = (props) => {
    const [uploadSpreadsheet, setUploadSpreadsheet] = useState(false);
    const [uploadAimFile, setUploadAimFile] = useState(false);
    const [files, setFiles] = useState([]);

    const onSelectFile = e => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);
      };

    const handleUpload = (e) => {
        if (files.length === 0) {
            toast.error("Please select files before uploading!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
            return;
        }
        const promises = [];
        const formData = new FormData();
        files.forEach((file, index) => {
          formData.append(`file${index + 1}`, file);
        });
        const config = {
          headers: {
            'content-type': 'multipart/form-data'
          }
        };
        if (uploadSpreadsheet) promises.push(uploadBulk(formData, config));
        else promises.push(uploadFileToProject(formData, config, props.pid));

        Promise.all(promises).then((res) => {
            toast.success("File's been sent for saving!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
            props.onCancel();
        }).catch(err => {
            console.error(err);
            props.onCancel();
            toast.error("Could not upload the aim(s)!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              });
        });
    }

    const downloadSample = async () => {
        fetch(`${process.env.PUBLIC_URL}/CSVtoAIM_Template.csv`).then(response => {
            response.blob().then(blob => {
                const fileURL = window.URL.createObjectURL(blob);
                let alink = document.createElement('a');
                alink.href = fileURL;
                alink.download = 'CSVtoAIM_Template.csv';
                alink.click();
              }).catch(error => console.error('Reading CSVtoAIM_Template.csv', error))
        }).catch(err => console.error("Downloading CSVtoAIM_Template.csv", err))
    }
    

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
                                </a>  I have a spreadsheet of cases and I want to batch create AIM files.
                            {uploadSpreadsheet && <div className="top-margin" id="collapseDescription">
                                <p className="indent">Your file has to be in comma separated value (csv) format and contain the critical
                                information and identical header titles needed to create a valid teaching file. <br />A sample csv file can
                                be downloaded <a href="#" onClick={downloadSample}>here</a>.</p>
                                <div className="container">
                                <label htmlFor="formFile" id="upload-info" className="form-label">Upload CSV file to bootstrap teaching files in bulk:</label>
                                <input className="form-control" type="file" id="formFile" onChange={onSelectFile}/>
                            </div>
                            </div>}
                        </div>
                        <div className="container upload-option">
                        <a data-bs-toggle="collapse" href="#collapseUpload" role="button" aria-expanded="false"
                            aria-controls="collapseUpload">
                            <input className="form-radio-input" type="radio" value="" id="flexCheckDefault" onChange={() => { setUploadAimFile(true); setUploadSpreadsheet(false)}} checked={uploadAimFile} /></a> I have or just created AIM
                            files and want to upload them to STELLA!.
                        {uploadAimFile && <div className="container top-margin" id="collapseUpload">
                            <label htmlFor="formFile" id="upload-info" className="form-label">Upload JSON files:</label>
                            <input className="form-control" type="file" id="formFileMultiple" onChange={onSelectFile} multiple />
                        </div>}
                        </div>
                        <div className="series-selection-buttons">
                        <button className="btn btn-sm btn-secondary btn-selection" onClick={handleUpload}> Submit</button>
                        <button className="btn btn-sm btn-secondary btn-selection" onClick={props.onCancel}> Cancel </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CsvModal;
