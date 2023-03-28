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
//import "bootstrap/dist/css/bootstrap.min.css"

//import "./bootstrap.min.css";
import "./bootstrap-icons.css";
import "./MediaExport.css";
import "./styles.css";

const mapStateToProps = state => {
  return {
    activePort: state.annotationsListReducer.activePort,
  };
};

const scrollToIndex = cornerstoneTools.importInternal("util/scrollToIndex");

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
    // Any DICOM data whose tag is included in pptTags should have its data
    // included in the presentation.
    this.pptTags = ['(0008,0050)', '(0008,0020)', '(0010,0040)', '(0010,1010)',
      '(0008,103E)', '(0018,0080)', '(0018,0081)'];
    // Accession number and possibly other tags in the future.
    this.sensitiveTags = ['(0008,0050)']
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
      input: ""
    }
    this.includeAccessionNumber = false;
    this.dumpDataSet = this.dumpDataSet.bind(this);
  }
  componentDidMount() {
    const { activePort } = this.props;
    // console.log(this.props);
    // In theory this.props has all of the information needed to export
    // high quality screenshots. In practice, you need cornerstone to 
    // handle that for you.
    const { element } = cornerstone.getEnabledElements()[activePort];
    this.canv = element.getElementsByClassName('cornerstone-canvas')[0];
    // this.vid.initializeRecorder(this.canv);
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
   */
  recordGif = () => {
    this.gifData.setReady(false);
    const x = document.getElementById('gifRecordingIndicator');
    x.innerHTML = 'Recording progress: 0%'
    const y = document.getElementById('gifLoadingIndicator');
    const { activePort } = this.props;
    const { element } = cornerstone.getEnabledElements()[activePort];
    const image = cornerstone.getImage(element);
    let stringArray = [''];
    this.dumpDataSet(image.data, stringArray);
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
        x.innerHTML = 'Recording progress: ' + progress*10 + '%'
      }
    }
    this.vid.recordGif(this.canv, duration, frameRate, this.gifData, 1, afterFrame);
    setTimeout(
      function Timer() {
        x.innerHTML = 'Recording finished.';
        y.style.display = 'block';
      }, duration * 1000)
  }

  // TODO: Make a custom modal instead of using window.confirm
  // Possible change: Only confirm if there are multiple slides (see deletePptSlide)
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
    let stringArray = ['', ''];
    this.dumpDataSet(image.data, stringArray);
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

  // Possible change: ask the user to confirm if the slide is not empty
  // (or if it contains 2 + images)
  // (see clearPpt)
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

  // This function iterates through dataSet recursively and adds new HTML strings
  // to the output array passed into it.
  // I took this function from MetaData.jsx, modified it a bit, and stripped out all of the 
  // parts that weren't needed.
  dumpDataSet = (dataSet, array) => {
    const maxLength = 128;
    const untilTag = "";
    const showGroupElement = false;
    const showLength = false;
    const showVR = false;
    const showFragments = true;
    const showFrames = true;
    const showP10Header = true;
    const showPrivateElements = true;
    const showEmptyValues = false;

    try {
      var keys = [];
      for (var propertyName in dataSet.elements) {
        keys.push(propertyName);
      }
      keys.sort();


      // the dataSet.elements object contains properties for each element parsed.  The name of the property
      // is based on the elements tag and looks like 'xGGGGEEEE' where GGGG is the group number and EEEE is the
      // element number both with lowercase hexadecimal letters.  For example, the Series Description DICOM element 0008,103E would
      // be named 'x0008103e'.  Here we iterate over each property (element) so we can build a string describing its
      // contents to add to the output array
      for (var k = 0; k < keys.length; k++) {
        var propertyName = keys[k];
        var element = dataSet.elements[propertyName];

        if (showP10Header === false && element.tag <= "x0002ffff") {
          continue;
        }
        if (showPrivateElements === false && dicomParser.isPrivateTag(element.tag)) {
          continue;
        }
        if (showEmptyValues === false && element.length <= 0) {
          continue;
        }
        var text = "";
        // var title = "";

        // var color = 'black';

        var tag = this.getTag(element.tag);
        if (tag === undefined || !this.pptTags.includes(tag.tag)) {
          continue;
        }
        const isSensitiveTag = this.sensitiveTags.includes(tag.tag);

        // The output string begins with the element name (or tag if not in data dictionary), length and VR (if present).  VR is undefined for
        // implicit transfer syntaxes
        if (tag === undefined) {
          text += element.tag;
          text += " : ";

          var lengthText = "length=" + element.length;
          if (element.hadUndefinedLength) {
            lengthText += " (-1)";
          }
          if (showLength === true) {
            text += lengthText + "; ";
          }

          // title += lengthText;

          var vrText = "";
          if (element.vr) {
            vrText += "VR=" + element.vr;
          }

          if (showVR) {
            text += vrText + "; ";
          }
          //if (vrText) {
          //  title += "; " + vrText;
          //}

          // title += "; dataOffset=" + element.dataOffset;
          // make text lighter since this is an unknown attribute
          // color = '#C8C8C8';
        }
        else {
          text += tag.name;
          if (showGroupElement === true) {
            text += "(" + element.tag + ")";
          }
          text += " : ";

          // title += "(" + element.tag + ")";

          var lengthText = " length=" + element.length;
          if (element.hadUndefinedLength) {
            lengthText += " (-1)";
          }

          if (showLength === true) {
            text += lengthText + "; ";
          }
          // title += "; " + lengthText;

          var vrText = "";
          if (element.vr) {
            vrText += "VR=" + element.vr;
          }

          if (showVR) {
            text += vrText + "; ";
          }
          //if (vrText) {
          //  title += "; " + vrText;
          //}

          // title += "; dataOffset=" + element.dataOffset;

        }

        // Here we check for Sequence items and iterate over them if present.  items will not be set in the
        // element object for elements that don't have SQ VR type.  Note that implicit little endian
        // sequences will are currently not parsed.
        if (element.items) {
          // output.push('<li>' + text + '</li>');
          // output.push('<ul>');

          // each item contains its own data set so we iterate over the items
          // and recursively call this function
          // var itemNumber = 0;
          element.items.forEach(function (item) {
            // output.push('<li>Item #' + itemNumber++ + ' ' + item.tag);
            var lengthText = " length=" + item.length;
            if (item.hadUndefinedLength) {
              lengthText += " (-1)";
            }

            if (showLength === true) {
              text += lengthText + "; ";
              // output.push(lengthText);
            }
            // output.push('</li>');
            // output.push('<ul>');
            // this.dumpDataSet(item.dataSet, output);
            // output.push('</ul>');
          });
          // output.push('</ul>');
        }
        else if (element.fragments) {
          text += "encapsulated pixel data with " + element.basicOffsetTable.length + " offsets and " +
            element.fragments.length + " fragments";
          text += this.sha1Text(dataSet.byteArray, element.dataOffset, element.length);

          // output.push("<li title='" + title + "'=>" + text + '</li>');

          // if (showFragments && element.encapsulatedPixelData) {
          //   output.push('Fragments:<br>');
          //   output.push('<ul>');
          //   var itemNumber = 0;
          //   element.fragments.forEach((fragment) => {
          //     var str = '<li>Fragment #' + itemNumber++ + ' dataOffset = ' + fragment.position;
          //     str += '; offset = ' + fragment.offset;
          //     str += '; length = ' + fragment.length;
          //     str += this.sha1Text(dataSet.byteArray, fragment.position, fragment.length);
          //     str += '</li>';

          //     output.push(str);
          //   });
          //   output.push('</ul>');
          // }
          //if (showFrames && element.encapsulatedPixelData) {
          //  output.push('Frames:<br>');
          //  output.push('<ul>');
          //  var bot = element.basicOffsetTable;
          //  // if empty bot and not RLE, calculate it
          //  if (bot.length === 0) {
          //    bot = dicomParser.createJPEGBasicOffsetTable(dataSet, element);
          //  }

          //  function imageFrameLink(frameIndex) {
          //    var linkText = "<a class='imageFrameDownload' ";
          //    linkText += "data-frameIndex='" + frameIndex + "'";
          //    linkText += " href='#'> Frame #" + frameIndex + "</a>";
          //    return linkText;
          //  }

          //  for (var frameIndex = 0; frameIndex < bot.length; frameIndex++) {
          //    var str = "<li>";
          //    str += imageFrameLink(frameIndex, "Frame #" + frameIndex);
          //    str += ' dataOffset = ' + (element.fragments[0].position + bot[frameIndex]);
          //    str += '; offset = ' + (bot[frameIndex]);
          //    var imageFrame = dicomParser.readEncapsulatedImageFrame(dataSet, element, frameIndex, bot);
          //    str += '; length = ' + imageFrame.length;
          //    str += this.sha1Text(imageFrame);
          //    str += '</li>';
          //    output.push(str);
          //  }
          //  output.push('</ul>');
          //}
        }
        else {
          // use VR to display the right value
          var vr;
          if (element.vr !== undefined) {
            vr = element.vr;
          }
          else {
            if (tag !== undefined) {
              vr = tag.vr;
            }
          }

          // if the length of the element is less than 128 we try to show it.  We put this check in
          // to avoid displaying large strings which makes it harder to use.
          if (element.length < maxLength) {
            // Since the dataset might be encoded using implicit transfer syntax and we aren't using
            // a data dictionary, we need some simple logic to figure out what data types these
            // elements might be.  Since the dataset might also be explicit we could be switch on the
            // VR and do a better job on this, perhaps we can do that in another example

            // First we check to see if the element's length is appropriate for a UI or US VR.
            // US is an important type because it is used for the
            // image Rows and Columns so that is why those are assumed over other VR types.
            if (element.vr === undefined && tag === undefined) {
              if (element.length === 2) {
                text += " (" + dataSet.uint16(propertyName) + ")";
              }
              else if (element.length === 4) {
                text += " (" + dataSet.uint32(propertyName) + ")";
              }


              // Next we ask the dataset to give us the element's data in string form.  Most elements are
              // strings but some aren't so we do a quick check to make sure it actually has all ascii
              // characters so we know it is reasonable to display it.
              var str = dataSet.string(propertyName);
              var stringIsAscii = this.isASCII(str);

              if (stringIsAscii) {
                // the string will be undefined if the element is present but has no data
                // (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
                // data.  Note that the length of the element will be 0 to indicate "no data"
                // so we don't put anything here for the value in that case.
                if (str !== undefined) {
                  text += '"' + str + '"' + this.mapUid(str);
                }
              }
              else {
                if (element.length !== 2 && element.length !== 4) {
                  color = '#C8C8C8';
                  // If it is some other length and we have no string
                  text += "binary data";
                }
              }
            }
            else {
              function isStringVr(vr) {
                if (vr === 'AT'
                  || vr === 'FL'
                  || vr === 'FD'
                  || vr === 'OB'
                  || vr === 'OF'
                  || vr === 'OW'
                  || vr === 'SI'
                  || vr === 'SQ'
                  || vr === 'SS'
                  || vr === 'UL'
                  || vr === 'US'
                ) {
                  return false;
                }
                return true;
              }
              if (isStringVr(vr)) {
                // Next we ask the dataset to give us the element's data in string form.  Most elements are
                // strings but some aren't so we do a quick check to make sure it actually has all ascii
                // characters so we know it is reasonable to display it.
                var str = dataSet.string(propertyName);
                var stringIsAscii = this.isASCII(str);

                if (stringIsAscii) {
                  // the string will be undefined if the element is present but has no data
                  // (i.e. attribute is of type 2 or 3 ) so we only display the string if it has
                  // data.  Note that the length of the element will be 0 to indicate "no data"
                  // so we don't put anything here for the value in that case.
                  if (str !== undefined) {
                    text += '"' + str + '"' + this.mapUid(str);
                  }
                }
                else {
                  if (element.length !== 2 && element.length !== 4) {
                    // color = '#C8C8C8';
                    // If it is some other length and we have no string
                    text += "binary data";
                  }
                }
              }
              else if (vr === 'US') {
                text += dataSet.uint16(propertyName);
                for (var i = 1; i < dataSet.elements[propertyName].length / 2; i++) {
                  text += '\\' + dataSet.uint16(propertyName, i);
                }
              }
              else if (vr === 'SS') {
                text += dataSet.int16(propertyName);
                for (var i = 1; i < dataSet.elements[propertyName].length / 2; i++) {
                  text += '\\' + dataSet.int16(propertyName, i);
                }
              }
              else if (vr === 'UL') {
                text += dataSet.uint32(propertyName);
                for (var i = 1; i < dataSet.elements[propertyName].length / 4; i++) {
                  text += '\\' + dataSet.uint32(propertyName, i);
                }
              }
              else if (vr === 'SL') {
                text += dataSet.int32(propertyName);
                for (var i = 1; i < dataSet.elements[propertyName].length / 4; i++) {
                  text += '\\' + dataSet.int32(propertyName, i);
                }
              }
              else if (vr == 'FD') {
                text += dataSet.double(propertyName);
                for (var i = 1; i < dataSet.elements[propertyName].length / 8; i++) {
                  text += '\\' + dataSet.double(propertyName, i);
                }
              }
              else if (vr == 'FL') {
                text += dataSet.float(propertyName);
                for (var i = 1; i < dataSet.elements[propertyName].length / 4; i++) {
                  text += '\\' + dataSet.float(propertyName, i);
                }
              }
              else if (vr === 'OB' || vr === 'OW' || vr === 'UN' || vr === 'OF' || vr === 'UT') {
                color = '#C8C8C8';
                 // If it is some other length and we have no string
                 if (element.length === 2) {
                   text += dataDownloadLink(element, "binary data") + " of length " + element.length + " as uint16: " + dataSet.uint16(propertyName);
                 } else if (element.length === 4) {
                   text += dataDownloadLink(element, "binary data") + " of length " + element.length + " as uint32: " + dataSet.uint32(propertyName);
                 } else {
                   text += dataDownloadLink(element, "binary data") + " of length " + element.length + " and VR " + vr;
                 }
              }
              else if (vr === 'AT') {
                var group = dataSet.uint16(propertyName, 0);
                var groupHexStr = ("0000" + group.toString(16)).substr(-4);
                var element = dataSet.uint16(propertyName, 1);
                var elementHexStr = ("0000" + element.toString(16)).substr(-4);
                text += "x" + groupHexStr + elementHexStr;
              }
              else if (vr === 'SQ') {
              }
              else {
                // If it is some other length and we have no string
                text += "no display code for VR " + vr + " yet, sorry!";
              }
            }

            //if (element.length === 0) {
            //  color = '#C8C8C8';
            //}
          }
          else {
          //   color = '#C8C8C8';

             // Add text saying the data is too long to show...
             text += dataDownloadLink(element, "data");
             text += " of length " + element.length + " for VR " + vr + " too long to show";
             text += this.sha1Text(dataSet.byteArray, element.dataOffset, element.length);
           }
          // finally we add the string to our output array
          if (!isSensitiveTag) {
            array[0] += '  ' + text + '\n';
          } else {
            array[1] += '  ' + text + '\n';
          }
          // console.log(text);
        }
      }
    } catch (err) {
      var ex = {
        exception: err
      }
      console.warn(ex);
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
    const duration = parseInt(document.getElementById('gifDurationSlider').value);
    let frameRate = parseInt(document.getElementById('gifFramerateSlider').value);
    let numImages = -1;
    let n = 1;
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
        'This is because of the following error:\n', error);
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
          upperBound = Math.min(middleIndex, upperBound-1);
        }
      }
      numImages = lowerBound + 1;
    }
    // We want the resulting gif to be the duration specified by the user, without
    // exceeding the specified framerate, so we skip frames until we can fit the
    // whole video in the desired duration, then we reduce the framerate to
    // ensure that the video has the correct duration.
    while (n <= 1000) {
      if (frameRate * duration >= Math.floor(numImages / n)) {
        frameRate = Math.floor(numImages / n) / duration;
        break;
      }
      n++;
    }
    // Record the gif:
    let stringArray = ['', ''];
    this.dumpDataSet(image.data, stringArray);
    this.gifData.text = stringArray[0];
    this.gifData.sensitiveText = stringArray[1];
    this.canv = element.getElementsByClassName('cornerstone-canvas')[0];
    this.gifData.width = this.canv.width;
    this.gifData.height = this.canv.height;
    let i = 0;
    scrollToIndex(element, 0);
    let progress = 0;
    const afterFrame = () => {
      i = i + n;
      if (Math.floor(i / numImages * 10) > progress) {
        progress = Math.floor(i / numImages * 10);
        x.innerHTML = 'Recording progress: ' + progress*10 + '%'
      }
      if (i < numImages) {
        scrollToIndex(element, i);
      }
    }
    // Arbitrarily chosen. I tested this on my computer and it struggles to keep up past
    // about 20 frames per second.
    const k = Math.max(20/frameRate, 1);
    this.vid.recordGif(this.canv, duration / k, frameRate * k, this.gifData, k, afterFrame);
    setTimeout(
      function Timer() {
        x.innerHTML = 'Recording finished. ';
        y.style.display = 'block';
      }, duration / k * 1000);
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
        {/*<div className="close-media-export-menu" onClick={this.props.onClose}>*/}
        {/*  <a href="#">X</a>*/}
        {/*</div>*/}
        {/*<div id="media-export-handle" className="buttonLabel">*/}
        {/*  <span>Export Media</span>*/}
        {/*</div>*/}
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
            <a><i className="bi bi-image"></i><p>Save{'\u00A0'}to Disk</p></a>
          </div>
        </div>
        <div className="media-icon-bar">
          <div className="annotation-header-new">Movie Controls</div>
          <div onClick={this.recordStack} className="icon-block">
            <a><i className="bi bi-images"></i><p>Record Stack{'\u00A0'}as Movie</p></a>
          </div>
          <div onClick={this.recordGif} className="icon-block">
            <a><i className="bi bi-record-circle danger"></i><p>Record Screen{'\u00A0'}as Movie</p></a>
          </div>
          <div onClick={this.addGif} className="icon-block">
            <a><i className="bi bi-plus-square"></i><p>Add{'\u00A0'}to Slide</p></a>
          </div>
          <div onClick={this.removeFromPpt} className="icon-block">
            <a><i className="bi bi-dash-square"></i><p>Remove from Slide</p></a>
          </div>
          <div onClick={this.downloadGif} className="icon-block">
            <a><i className="bi bi-download" alt="Save Movie to Disk"></i><p>Save{'\u00A0'}to Disk</p></a>
          </div>
          <div onClick={this.toggleHideGifSettings} className="icon-block">
            <a><i className="bi bi-gear-fill"></i><p>Settings</p></a>
          </div>
        </div>
        <div className="movie-settings" id="movie-settings">
          <div className="annotation-header-new">Movie Settings
            <i onClick={this.toggleHideGifSettings} className="bi bi-eye-slash-fill" style={{ cursor: 'pointer', float: 'right', marginRight: '7px' }}> Hide Settings</i></div>
          <br />
          <label htmlFor="gifFramerateSlider" id="gifFramerateText" className="form-label">Frames per Second: 10</label>
          <input type="range" className="form-range" min="5" max="30" step="5" list="gifFPSlist" defaultValue="10" onChange={this.updateFramerateDisplay} id="gifFramerateSlider" />
          <datalist id="gifFPSlist">
            <option>5</option>
            <option>10</option>
            <option>15</option>
            <option>20</option>
            <option>25</option>
            <option>30</option>
          </datalist>
          <label htmlFor="gifDurationSlider" id="gifDurationText" className="form-label">Duration: 3 Seconds</label>
          <input type="range" className="form-range" min="1" max="5" step="1" list="gifDurationList" defaultValue="3" onChange={this.updateDurationDisplay} id="gifDurationSlider" />
          <datalist id="gifDurationList">
            <option>1</option>
            <option>2</option>
            <option>3</option>
            <option>4</option>
            <option>5</option>
          </datalist>
        </div>
        <div className="presentation">
          <div className="annotation-header-new">Presentation Controls </div>
          <label className="accession-check icon-block2 form-check-label" htmlFor="toggleAccessionNumber">
            <div className="form-check form-switch form-check-inline">
              <input className="form-check-input" type="checkbox" role="switch" id="toggleAccessionNumber" onChange={this.toggleAccessionNumber}/>
              <p style={{color: '#fff'}}>Save Accession #</p>
              </div>
            </label>
          <div className="icon-block2" onClick={this.savePpt}>
            <a style={{ textAlign: 'center' }}><i  className="bi bi-download"></i><p>Save Presentation</p></a>
          </div>

          <div className="icon-block2" onClick={this.clearPpt}>
            <a style={{ textAlign: 'center' }}><i className="bi bi-x-circle"></i><p>Clear Presentation</p></a>
          </div>
        </div>
        {/*<br />*/}
        <br />
        <div className="status" id="gif-status-box">
          <div className="annotation-header-new">Status</div>
          <div className="status-box">
            <div id="gifRecordingIndicator">Status Messages appear here...</div>
            <div id="gifLoadingIndicator">Loading</div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps)(MediaExport);
