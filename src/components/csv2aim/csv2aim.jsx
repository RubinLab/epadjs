import React, { Component, useState } from "react";
import { BiUpload } from 'react-icons/bi';
import UploadCSV from './uploadcsv';

export default function CSV2AIM() {
    const [uploadClicked, setUploadClicked] = useState(false);

    const handleSubmitUpload = () => {
        setUploadClicked(false);
    };

    return (
        <>
            <button type="button" className="btn btn-sm" onClick={() => { setUploadClicked(true) }}><BiUpload /><br />Convert CSV to AIM files</button>
            {uploadClicked && (
            <UploadCSV
                onCancel={() => setUploadClicked(false)}
                onResolve={handleSubmitUpload}
            />
            )}
        </>
    );
}