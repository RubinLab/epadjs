import React, { Component, useState } from "react";
import { connect } from "react-redux";
import Draggable from "react-draggable";
import cornerstone from "cornerstone-core";
import * as dcmjs from "dcmjs";
import { uids } from "./uids";
import { pptWrapper } from "./pptWrapper";
import { videoExport } from "./videoExport";
import cornerstoneTools from "cornerstone-tools";
import { getToolState } from "cornerstone-tools/stateManagement/toolState";
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';

import "./bootstrap-icons.css";
import "./MediaExport.css";
import "./styles.css";

const mapStateToProps = state => {
  return {
    activePort: state.annotationsListReducer.activePort,
  };
};

const scrollToIndex = cornerstoneTools.importInternal("util/scrollToIndex");

// These values control various things in the media export interface, and
// are placed here for convenience.
const defaultGifLength = 10;
const maxGifLength = 30;
const defaultFrameRate = 10;
const maxFrameRate = 30;
const debounceMilliseconds = 300;
// Any DICOM data whose tag is included in this array should have its data included in the presentation.
// Using the wadors format for tags
const tagsToInclude = [
  'x00080050',
  'x00080020',
  'x00100040',
  'x00100030',
  'x0008103E',
  'x00180080',
  'x00180081',
  'x00100020'
];
// PHI-related tags. If a tag is in this array, its data is only
// included in the presentation if the 'Save Accession #' button is toggled on.
const phiTags = ['x00080050', 'x00100020'];

let wadoUrl;

/**
 * Handles media exporting. This class saves its data using the saveData parameter.
 * When you construct a new instance of this class, take the most recent input of
 * saveData and pass it to this class as the 'data' parameter.
 * @param {Function} onClose Method called when this class closes
 * @param {Function} saveData When saveData is passed obj, save obj somewhere.
 * @param {Object} data An object that has been passed to the saveData method.
 */
class MediaExport extends Component {
  constructor(props) {
    super(props);
    wadoUrl = sessionStorage.getItem('wadoUrl');
    this.pptTags = tagsToInclude;
    this.sensitiveTags = phiTags;
    // The following lines give this class a way to export and import the current
    // presentation and gif, so that you can close and re-open the class dialog
    // without losing progress.
    if (this.props.data === undefined || Object.keys(this.props.data).length == 0) {
      this.pptw = new pptWrapper();
      this.gifData = {
        ready: false,
        text: '',
        width: -1,
        height: -1
      }
      this.props.saveData({
        pptw: this.pptw,
        gifData: this.gifData
      });
    } else {
      this.pptw = this.props.data.pptw;
      this.gifData = this.props.data.gifData;
    }
    this.gifData.setReady = this.setGifReady;
    this.vid = new videoExport();
    this.slideNotes = ''
    this.state = {
      output: [],
      input: "",
      isRecording: false
    }
    this.debounce = [false];
    this.includeAccessionNumber = false;
    this.dumpDataSet = this.dumpDataSet.bind(this);
  }
  componentDidMount() {
    const { activePort } = this.props;
    // In theory this.props has all of the information needed to export
    // high quality screenshots. In practice, you need cornerstone to 
    // handle that for you.
    const { element } = cornerstone.getEnabledElements()[activePort];
    this.canv = element.getElementsByClassName('cornerstone-canvas')[0];
    this.pptw.updateDisplayText('pptInfo');
    this.pptw.updateCanvasPreview('pptPreview');
    this.gifData.setReady(this.gifData.ready);
  }

  // helper function to see if a string only has ascii characters in it
  isASCII = (str) => {
    return /^[\x00-\x7F]*$/.test(str);
  }

  mapUid = (str) => {
    var uid = uids[str];
    if (uid) {
      return ' [ ' + uid + ' ]';
    }
    return '';
  }

  getTag = (tag) => {
    var group = tag.substring(1, 5);
    var element = tag.substring(5, 9);
    var tagIndex = ("(" + group + "," + element + ")").toUpperCase();
    var attr = dcmjs.data.DicomMetaDictionary.dictionary[tagIndex];
    return attr;
  }

  sha1Text = (byteArray, position, length) => {
    const showSHA1 = false;
    if (showSHA1 === false) {
      return "";
    }
    var text = "; SHA1 " + sha1(byteArray, position, length);
    return text;
  }

  /**
   * Updates the UI, telling it whether or not a gif is ready to download.
   * This toggles visibility of the loading indicator and the buttons for
   * downloading the gif or adding it to the presentation.
   * @param {Boolean} val True means gif is ready
   */
  setGifReady = (val) => {
    this.gifData.ready = val;
    const x = document.getElementById('gifRecordingIndicator');
    const y = document.getElementById('gifLoadingIndicator');
    if (val) {
      x.innerHTML = 'Movie ready.';
      y.style.display = 'none';
    } else {
      // x.style.display = 'none';
    }
  }

  /**
   * Records a gif of the active cornerstone canvas, using the settings taken from
   * the sliders in the UI.
   * This function is debounced, so it does nothing if called twice within a short
   * time frame, because otherwise you could lose a lot of progress by accidentally
   * double-clicking. The debounce time can be configured at the top of this file.
   */
  recordGif = () => {
    const x = document.getElementById('gifRecordingIndicator');
    const y = document.getElementById('gifLoadingIndicator');
    if (this.debounce[0]) {
      return;
    }
    this.debounce[0] = true;
    const debounce = this.debounce;
    setTimeout(() => { debounce[0] = false }, debounceMilliseconds);
    if (!this.state.isRecording) {
      this.setState({ isRecording: true });
      this.gifData.setReady(false);
      y.style.display = 'none';
      x.innerHTML = 'Recording progress: 0%';
      const { activePort } = this.props;
      const { element } = cornerstone.getEnabledElements()[activePort];
      const image = cornerstone.getImage(element);
      // fill in the metadata for wadors
      if (wadoUrl.includes('wadors')) {
        image.metadata = this.createImageDataFromMetadata(image.imageId);
      }
      let stringArray = ['', ''];
      this.dumpDataSet(image.metadata, stringArray);
      this.gifData.text = stringArray[0];
      this.canv = element.getElementsByClassName('cornerstone-canvas')[0];
      this.gifData.width = this.canv.width;
      this.gifData.height = this.canv.height;
      const duration = parseInt(document.getElementById('gifDurationSlider').value);
      const frameRate = parseInt(document.getElementById('gifFramerateSlider').value);
      let progress = 0;
      let i = 0;
      const afterFrame = () => {
        i = i + 1;
        if (Math.floor(i / (duration * frameRate) * 10) > progress) {
          progress = Math.floor(i / (duration * frameRate) * 10);
          x.innerHTML = 'Recording progress: ' + progress * 10 + '%'
        }
      }
      this.vid.recordGif(this.canv, duration, frameRate, this.gifData, 1, afterFrame);
      const finished = () => {
        this.setState({ isRecording: false });
        debounce[0] = true;
        setTimeout(() => { debounce[0] = false }, debounceMilliseconds * 2 - 100);
      }
      setTimeout(
        function Timer() {
          // Asynchronous stuff is hard so instead of checking this.state.isRecording
          // we check this.
          if (x.innerHTML === 'Recording progress: 100%') {
            finished();
            x.innerHTML = 'Recording finished. Preparing movie.';
            y.style.display = 'block';
          }
        }, duration * 1000 + 100)
    } else {
      x.innerHTML = 'Recording finished early. Preparing movie.';
      y.style.display = 'block';
      this.vid.endVideo();
      this.setState({ isRecording: false });
    }

  }

  /**
   * Clears the presentation.
   */
  clearPpt = () => {
    if (!this.pptw.isEmpty() && window.confirm('Are you sure you want to clear the whole presentation?')) {
      this.pptw = new pptWrapper();
      this.props.saveData({ pptw: this.pptw, gifData: this.gifData });
      this.pptw.updateDisplayText('pptInfo');
      this.pptw.updateCanvasPreview('pptPreview');
    }
  }

  /**
   * Adds a screenshot of the active cornerstone canvas to the presentation.
   * When this comment was written, the active canvas had a red border, and could be changed
   * by clicking on a different canvas.
   */
  addToPpt = () => {
    const { activePort } = this.props;
    const { element } = cornerstone.getEnabledElements()[activePort];
    this.canv = element.getElementsByClassName('cornerstone-canvas')[0];
    const image = cornerstone.getImage(element);
    // fill in the metadata for wadors
    if (wadoUrl.includes('wadors')) {
      image.metadata = this.createImageDataFromMetadata(image.imageId);
    }
    let stringArray = ['', ''];
    this.dumpDataSet(image.metadata, stringArray);
    this.pptw.addImageToSlide(
      this.canv.toDataURL(),
      this.canv.width,
      this.canv.height,
      stringArray[0],
      stringArray[1]
    );
    this.pptw.updateDisplayText('pptInfo');
    this.pptw.updateCanvasPreview('pptPreview');
  }

  /**
   * Takes and downloads a screenshot of the active cornerstone canvas.
   * */
  saveScreenshot = () => {
    const { activePort } = this.props;
    const { element } = cornerstone.getEnabledElements()[activePort];
    this.canv = element.getElementsByClassName('cornerstone-canvas')[0];
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = this.canv.toDataURL('image/jpeg');
    a.download = "STELLA image.jpg";
    a.click();
    a.remove();
  }

  /**
   * Removes the last image on the current slide from the presentation.
   */
  removeFromPpt = () => {
    this.pptw.removeImageFromSlide();
    this.pptw.updateDisplayText('pptInfo');
    this.pptw.updateCanvasPreview('pptPreview');
  }

  /**
   * Deletes the current slide from the presentation.
   */
  deletePptSlide = () => {
    this.pptw.removeCurrentSlide();
    this.pptw.updateDisplayText('pptInfo');
    this.pptw.updateCanvasPreview('pptPreview');
  }

  /**
   * Downloads the presentation. This occurs instantly, as the presentation is handled locally.
   */
  savePpt = () => {
    this.pptw.exportPresentation('Stella images.pptx', this.includeAccessionNumber);
  }

  /**
   * Moves to the next slide. Creates a new slide if none exist.
   */
  nextPptSlide = () => {
    this.pptw.nextSlide();
    this.pptw.updateDisplayText('pptInfo');
    this.pptw.updateCanvasPreview('pptPreview');
  }

  /**
   * Moves to the previous slide. Does nothing if on the first slide.
   */
  prevPptSlide = () => {
    this.pptw.prevSlide();
    this.pptw.updateDisplayText('pptInfo');
    this.pptw.updateCanvasPreview('pptPreview');
  }

  /**
   * Debug method for use in development.
   */
  logElement = () => {
    console.log(this.props.data);
  }

  formatDate = (dicomDate) => {
    return `${dicomDate.substring(4, 6)}/${dicomDate.substring(6, 8)}/${dicomDate.substring(
        0, 4
      )}`
  }
  getAge = (birthDate, date) => {
    let age = '';
    const studyDate = new Date(this.formatDate(date));
    const dobDate = new Date(this.formatDate(birthDate));
    const timeDiff = studyDate.getTime() - dobDate.getTime();
    const timeDiffDate = new Date(timeDiff);
    const dayDiff = Math.round(timeDiff / (1000 * 3600 * 24));
    const years = timeDiffDate.getFullYear() - 1970;
    if (dayDiff <= 59) {
      age = `${dayDiff}-day-old `;
    } else if (years < 2) {
      let months = (studyDate.getFullYear() - dobDate.getFullYear()) * 12;
      months += studyDate.getMonth() - dobDate.getMonth();
      age = `${months}-month-old `;
    } else {
      age = `${years}-year-old `;
    }
    return age;
  }

  // Got from Aim Editor and modified the required tags
  createImageDataFromMetadata = (id) => {
    const data = {};
    const requiredTags = this.pptTags;

    const metadata = cornerstoneWADOImageLoader.wadors.metaDataManager.get(id);

    for (let i = 0; i < requiredTags.length; i++) {
      const key = requiredTags[i].substring(1).toUpperCase();
      data[requiredTags[i]] = metadata[key]?.Value
        ? metadata[key].Value[0]
        : '';
    }
    if (
      typeof data['x00100010'] === 'object' &&
      data['x00100010'].hasOwnProperty('Alphabetic')
    ) {
      data['x00100010'] = data['x00100010']['Alphabetic'];
    }
    return data;
  };

  // This function iterates through dataSet and adds new HTML strings
  // to the output array passed into it.
  dumpDataSet = (dataSet, array) => {
    // we add the strings to output array
    for (const [tag, value] of Object.entries(dataSet)) {
      const isSensitiveTag = this.sensitiveTags.includes(tag);
      if (tag === 'x00100030') {
        array[0] += '  ' + this.getAge(value, dataSet['x00080020']) + '\n';
      }
      else if (!isSensitiveTag) {
        array[0] += '  ' + value + '\n';
      } else {
        array[1] += '  ' + value + '\n';
      }
    }
  }

  onChangeHandler = (e) => {
    this.setState({
      input: e.target.value,
    })
  }

  /**
   * Updates the text that accompanies the framerate slider.
   */
  updateFramerateDisplay = () => {
    document.getElementById("gifFramerateText").innerHTML = 'Frames per second: ' + document.getElementById('gifFramerateSlider').value;
  }

  /**
   * Updates the text that accompanies the duration slider.
   */
  updateDurationDisplay = () => {
    const duration = document.getElementById('gifDurationSlider').value;
    if (duration == 1) {
      document.getElementById("gifDurationText").innerHTML = 'Duration: 1 Second';
    } else {
      document.getElementById("gifDurationText").innerHTML = `Duration: ${duration} Seconds`;
    }
  }

  /**
   * Toggles display of the gif settings and the status of the toggle button.
   */
  toggleHideGifSettings = () => {
    const x = document.getElementById("movie-settings");
    // const b = document.getElementById("gifSettingsButton");
    if (x.style.display == "block") {
      x.style.display = "none";
    } else {
      x.style.display = "block";
    }
  }

  /**
   * Downloads the processed gif.
   */
  downloadGif = () => {
    if (!this.gifData.ready) {
      return;
    }
    // It's a little hacky but it's the best way I could come up with, and
    // the people on stackoverflow said to do this.
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    a.href = this.gifData.url;
    a.download = "STELLA movie.gif";
    a.click();
  }

  /**
   * Adds the processed gif to the presentation, along some metadata.
   * Note that the presentation preview shows a static image, but the
   * presentation itself still contains an animated gif.
   */
  addGif = () => {
    if (!this.gifData.ready) {
      return;
    }
    const f = new FileReader();
    f.onload = (dataURL) => {
      this.pptw.addImageToSlide(
        dataURL.target.result,
        this.gifData.width,
        this.gifData.height,
        this.gifData.text,
        this.gifData.sensitiveText
      );
      this.pptw.updateDisplayText('pptInfo');
      this.pptw.updateCanvasPreview('pptPreview');
    }
    f.readAsDataURL(this.gifData.blob);
  }

  recordStack = () => {
    if (!this.state.isRecording) {
      this.setState({ isRecording: true });
      // scrollToIndex(element, 0) scrolls to the first image,
      // scrollToIndex(element, 1) to the second image,
      // scrollToIndex(element, -1) to the last image,
      // scrollToIndex(element, -2) to the second to last image, etc.
      const x = document.getElementById('gifRecordingIndicator');
      x.innerHTML = 'Recording progress: 0%'
      const y = document.getElementById('gifLoadingIndicator');
      const { activePort } = this.props;
      const { element } = cornerstone.getEnabledElements()[activePort];
      const image = cornerstone.getImage(element);
      let duration = parseInt(document.getElementById('gifDurationSlider').value);
      let frameRate = parseInt(document.getElementById('gifFramerateSlider').value);
      let numImages = -1;
      // There isn't any simple way to figure out the number of images in a series from here.
      // scrollToIndex method figures it out by calling getToolState, a method internal to
      // cornerstone-tools. I have imported it and am using it here. I am not sure about the
      // specifics of importing it that way, because I noticed that cornerstone-tools is
      // included in /epadjs/src instead of being imported through npm. If that changes, my method
      // of importing getToolState may break, but hopefully my code should be resilient enough to
      // keep functioning if that happens.
      try {
        numImages = getToolState(element, 'stack').data[0].imageIds.length;
      } catch (error) {
        // Exponential search to find the maximum allowed index. This is hacky but it should 
        // work as a backup.
        console.warn('MediaExport could not figure out the number of images in this series. ' +
          'Using a workaround. This is because of the following error:\n', error);
        let lowerBound = 0;
        let upperBound = 1;
        let loopDone = false;
        while (!loopDone) {
          try {
            scrollToIndex(element, upperBound);
            lowerBound = upperBound;
            upperBound = upperBound * 2;
          } catch (e) {
            loopDone = true;
          }
        }
        while (lowerBound != upperBound) {
          let middleIndex = Math.ceil(lowerBound / 2 + upperBound / 2);
          try {
            scrollToIndex(element, middleIndex);
            lowerBound = middleIndex;
          } catch (e) {
            upperBound = Math.min(middleIndex, upperBound - 1);
          }
        }
        numImages = lowerBound + 1;
      }
      // Record the gif:
      duration = Math.max(duration, numImages / frameRate);
      // fill in the metadata for wadors
      if (wadoUrl.includes('wadors')) {
        image.metadata = this.createImageDataFromMetadata(image.imageId);
      }
      let stringArray = ['', ''];
      this.dumpDataSet(image.metadata, stringArray);
      this.gifData.text = stringArray[0];
      this.gifData.sensitiveText = stringArray[1];
      this.canv = element.getElementsByClassName('cornerstone-canvas')[0];
      this.gifData.width = this.canv.width;
      this.gifData.height = this.canv.height;
      let i = 0;
      scrollToIndex(element, 0);
      let progress = 0;
      const afterFrame = () => {
        i += 1;
        if (Math.floor(i / numImages * 10) > progress) {
          progress = Math.floor(i / numImages * 10);
          x.innerHTML = 'Recording progress: ' + progress * 10 + '%';
        }
        if (i < numImages) {
          scrollToIndex(element, i);
        }
      }
      // We can record the frames quickly and play them back at the desired framerate.
      const speedUp = Math.max(30 / numImages * duration, 1);
      this.vid.recordGif(this.canv, duration / speedUp, numImages / duration * speedUp, this.gifData, speedUp, afterFrame);
      const finished = () => { this.setState({ isRecording: false }) }
      setTimeout(
        function Timer() {
          finished();
          x.innerHTML = 'Recording finished. Preparing movie.';
          y.style.display = 'block';
        }, duration / speedUp * 1000 + 50);
    }
  }

  toggleAccessionNumber = ({ target }) => {
    this.includeAccessionNumber = target.checked;
  }

  render() {
    const { output, input } = this.state;
    const lowerInput = input.toLowerCase();
    const list = output.filter(d => input === '' || d.toLowerCase().includes(lowerInput));

    const listHtml = { __html: list.join('') };
    return (
      <div className="media-export-pop-up" id="media-tab-pane">
        <div className="annotation-header-new">Media Export</div>
        <div className="slide-preview-area">
          <div className="slide-preview-text">
            <i style={{ cursor: 'pointer' }} onClick={this.prevPptSlide} className="bi bi-caret-left-fill"></i>
            <div style={{ display: 'inline-block' }} id="pptInfo"></div>
            <i style={{ cursor: 'pointer' }} onClick={this.nextPptSlide} className="bi bi-caret-right-fill"></i>
            <canvas className="slide-preview" id="pptPreview">&nbsp;</canvas></div>
          <div onClick={this.deletePptSlide} style={{ cursor: 'pointer' }}><i className="bi bi-trash3"></i> Delete this Slide</div>
        </div>
        <div className="media-icon-bar">
          <div className="annotation-header-new">Image Controls</div>
          <div onClick={this.addToPpt} className="icon-block">
            <a><i className="bi bi-plus-square"></i><p>Add</p></a>
          </div>
          <div onClick={this.removeFromPpt} className="icon-block">
            <a><i className="bi bi-dash-square"></i><p>Remove</p></a>
          </div>
          <div onClick={this.saveScreenshot} className="icon-block">
            <a><i className="bi bi-image"></i><p>Save to Disk</p></a>
          </div>
        </div>
        <div className="media-icon-bar">
          <div className="annotation-header-new">Movie Controls</div>
          <div onClick={this.recordStack} className="icon-block">
            <a><i className="bi bi-images"></i><p>Record Stack as Movie</p></a>
          </div>
          <div onClick={this.recordGif} className="icon-block">
            <a>
              <i className={this.state.isRecording ? "bi bi-stop-fill" : "bi bi-record-circle danger"}></i>
              <p style={this.state.isRecording ? { color: '#80FF00' } : {}}>
                {this.state.isRecording ? 'Stop Recording' : 'Record Series Actions'}
              </p>
            </a>
          </div>
          <div onClick={this.addGif} className="icon-block">
            <a><i className="bi bi-plus-square"></i><p>Add to Slide</p></a>
          </div>
          <div onClick={this.removeFromPpt} className="icon-block">
            <a><i className="bi bi-dash-square"></i><p>Remove from Slide</p></a>
          </div>
          <div onClick={this.downloadGif} className="icon-block">
            <a><i className="bi bi-download" alt="Save Movie to Disk"></i><p>Save to Disk</p></a>
          </div>
          <div onClick={this.toggleHideGifSettings} className="icon-block">
            <a><i className="bi bi-gear-fill"></i><p>Settings</p></a>
          </div>
        </div>
        <div className="movie-settings" id="movie-settings">
          <div className="annotation-header-new">Movie Settings
            <i onClick={this.toggleHideGifSettings} className="bi bi-eye-slash-fill" style={{ cursor: 'pointer', float: 'right', marginRight: '7px' }}> Hide Settings</i></div>
          <br />
          <label htmlFor="gifFramerateSlider" id="gifFramerateText" className="form-label">Frames per Second: {defaultFrameRate}</label>
          <input type="range" className="form-range" min="5" max={maxFrameRate} step="5" list="gifFPSlist" defaultValue={defaultFrameRate} onChange={this.updateFramerateDisplay} id="gifFramerateSlider" />
          <datalist id="gifFPSlist"></datalist>
          <label htmlFor="gifDurationSlider" id="gifDurationText" className="form-label">Duration: {defaultGifLength} Seconds</label>
          <input type="range" className="form-range" min="1" max={maxGifLength} step="1" list="gifDurationList" defaultValue={defaultGifLength} onChange={this.updateDurationDisplay} id="gifDurationSlider" />
          <datalist id="gifDurationList"></datalist>
        </div>
        <div className="presentation">
          <div className="annotation-header-new">Presentation Controls </div>
          <div style={{ marginLeft: '2rem' }}>
            <label className="accession-check icon-block2 form-check-label" htmlFor="toggleAccessionNumber">
              <div className="form-check form-switch form-check-inline">
                <input className="form-check-input" type="checkbox" role="switch" id="toggleAccessionNumber" onChange={this.toggleAccessionNumber} />
                <p style={{ color: '#fff' }}>Save Accession #</p>
              </div>
            </label>
            <div className="icon-block2" onClick={this.savePpt}>
              <a style={{ textAlign: 'center' }}><i className="bi bi-download"></i><p>Save Presentation</p></a>
            </div>

            <div className="icon-block2" onClick={this.clearPpt}>
              <a style={{ textAlign: 'center' }}><i className="bi bi-x-circle"></i><p>Clear Presentation</p></a>
            </div>
          </div>
        </div>
        <br />
        <div className="status" id="gif-status-box">
          <div className="annotation-header-new">Status</div>
          <div className="status-box">
            <div id="gifRecordingIndicator">Status Messages appear here...</div>
            <div id="gifLoadingIndicator"><div className="spinner-border" role="status">
              <span className="sr-only">Loading...</span>
            </div>{/*Loading*/}</div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(MediaExport);
