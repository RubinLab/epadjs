import React from "react";
import { connect } from "react-redux";
import "./CsvModal.css";

const CsvModal = (props) => {
    return (
        <div class="overlay-dk">
            <div id="series-window-bk">
                <div class="series-header">Bootstrap/Bulk Upload Window <i class="bi bi-x-circle"></i></div>
                <div class="series-body filter-control">
                    STELLA uses AIM files (Annotation and Image Markup) as the basis for each Teaching File. <br />
                    To batch create AIM files from a spreadsheet and upload them to STELLA, select from the following options:
                </div>
                <div class="series-body">
                <div class="container upload-option">
                <a data-bs-toggle="collapse" href="#collapseDescription" role="button" aria-expanded="false"
                    aria-controls="collapseDescription"><input class="form-radio-input" type="radio" value=""
                    id="flexCheckDefault" /></a> I have a spreadsheet of cases and I want to batch create AIM files.
                <div class="collapse top-margin" id="collapseDescription">
                <p class="indent">Your file has to be in comma separated value (csv) format and contain the critical
                    information and identical header titles needed to create a valid teaching file. <br />A sample csv file can
                    be downloaded <a href="#">here</a>.</p>
                <div class="container">
              <label for="formFile" class="form-label">Upload CSV file to bootstrap teaching files in bulk:</label>
              <input class="form-control" type="file" id="formFile" />
            </div>
          </div>
        </div>
        <div class="container upload-option">
          <a data-bs-toggle="collapse" href="#collapseUpload" role="button" aria-expanded="false"
            aria-controls="collapseUpload">
            <input class="form-radio-input" type="radio" value="" id="flexCheckDefault" /></a> I have or just created AIM
            files and want to upload them to STELLA!.
          <div class="container collapse top-margin" id="collapseUpload">
            <label for="formFile" class="form-label">Upload JSON files:</label>
            <input class="form-control" type="file" id="formFileMultiple" multiple />
          </div>
        </div>
        <div class="series-selection-buttons">
          <button class="btn btn-sm btn-secondary btn-selection"> Submit</button>
          <button class="btn btn-sm btn-secondary btn-selection"> Cancel </button>
        </div>
            </div>
            </div>
        </div>
    );
}

export default CsvModal;
