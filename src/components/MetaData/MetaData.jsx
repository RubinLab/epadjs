import React, { Component } from "react";
import { connect } from "react-redux";
import Draggable from "react-draggable";
import cornerstone from "cornerstone-core";
import * as dcmjs from "dcmjs";
import { uids } from "./uids";

import "./MetaData.css";

const mapStateToProps = state => {
  return {
    activePort: state.annotationsListReducer.activePort,
  };
};

class MetaData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      output: []
    }
    this.dumpDataSet = this.dumpDataSet.bind(this);
  }
  componentDidMount() {
    const { activePort } = this.props;
    const { element } = cornerstone.getEnabledElements()[activePort];
    // console.log("cornerstone", cornerstone);
    const image = cornerstone.getImage(element);
    const { elements } = image.data;
    console.log("image", image);
    const tempOutput = [];
    this.dumpDataSet(image.data, tempOutput);
    this.setState({ output: tempOutput });
    // console.log("image", image);

    // // const dataset = dcmjs.data.DicomMetaDictionary.namifyDataset(elements);
    // Object.keys(elements).forEach(tag => {
    //   const data = Object.assign({}, elements[tag]);
    //   Object.keys(data.Value).forEach(index => {
    //     console.log("inner", data.Value[index], index);
    //   });
    // });
    // console.log("namedDataset", namedDataset);
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

  // This function iterates through dataSet recursively and adds new HTML strings
  // to the output array passed into it
  dumpDataSet(dataSet, output) {
    const maxLength = 128;
    const untilTag = "";
    const showGroupElement = true;
    const showLength = true;
    const showVR = true;
    const showFragments = true;
    const showFrames = true;

    // try {
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

      // if (showP10Header === false && element.tag <= "x0002ffff") {
      //   continue;
      // }
      // if (showPrivateElements === false && dicomParser.isPrivateTag(element.tag)) {
      //   continue;
      // }
      // if (showEmptyValues === false && element.length <= 0) {
      //   continue;
      // }
      var text = "";
      var title = "";

      var color = 'black';

      var tag = this.getTag(element.tag);

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

        title += lengthText;

        var vrText = "";
        if (element.vr) {
          vrText += "VR=" + element.vr;
        }

        if (showVR) {
          text += vrText + "; ";
        }
        if (vrText) {
          title += "; " + vrText;
        }

        title += "; dataOffset=" + element.dataOffset;
        // make text lighter since this is an unknown attribute
        color = '#C8C8C8';
      }
      else {
        text += tag.name;
        if (showGroupElement === true) {
          text += "(" + element.tag + ")";
        }
        text += " : ";

        title += "(" + element.tag + ")";

        var lengthText = " length=" + element.length;
        if (element.hadUndefinedLength) {
          lengthText += " (-1)";
        }

        if (showLength === true) {
          text += lengthText + "; ";
        }
        title += "; " + lengthText;

        var vrText = "";
        if (element.vr) {
          vrText += "VR=" + element.vr;
        }

        if (showVR) {
          text += vrText + "; ";
        }
        if (vrText) {
          title += "; " + vrText;
        }

        title += "; dataOffset=" + element.dataOffset;

      }

      // Here we check for Sequence items and iterate over them if present.  items will not be set in the
      // element object for elements that don't have SQ VR type.  Note that implicit little endian
      // sequences will are currently not parsed.
      if (element.items) {
        output.push('<li>' + text + '</li>');
        output.push('<ul>');

        // each item contains its own data set so we iterate over the items
        // and recursively call this function
        var itemNumber = 0;
        element.items.forEach(function (item) {
          output.push('<li>Item #' + itemNumber++ + ' ' + item.tag);
          var lengthText = " length=" + item.length;
          if (item.hadUndefinedLength) {
            lengthText += " (-1)";
          }

          if (showLength === true) {
            text += lengthText + "; ";
            output.push(lengthText);
          }
          output.push('</li>');
          output.push('<ul>');
          // this.dumpDataSet(item.dataSet, output);
          output.push('</ul>');
        });
        output.push('</ul>');
      }
      else if (element.fragments) {
        text += "encapsulated pixel data with " + element.basicOffsetTable.length + " offsets and " +
          element.fragments.length + " fragments";
        text += this.sha1Text(dataSet.byteArray, element.dataOffset, element.length);

        output.push("<li title='" + title + "'=>" + text + '</li>');

        if (showFragments && element.encapsulatedPixelData) {
          output.push('Fragments:<br>');
          output.push('<ul>');
          var itemNumber = 0;
          element.fragments.forEach(function (fragment) {
            var str = '<li>Fragment #' + itemNumber++ + ' dataOffset = ' + fragment.position;
            str += '; offset = ' + fragment.offset;
            str += '; length = ' + fragment.length;
            str += this.sha1Text(dataSet.byteArray, fragment.position, fragment.length);
            str += '</li>';

            output.push(str);
          });
          output.push('</ul>');
        }
        if (showFrames && element.encapsulatedPixelData) {
          output.push('Frames:<br>');
          output.push('<ul>');
          var bot = element.basicOffsetTable;
          // if empty bot and not RLE, calculate it
          if (bot.length === 0) {
            bot = dicomParser.createJPEGBasicOffsetTable(dataSet, element);
          }

          function imageFrameLink(frameIndex) {
            var linkText = "<a class='imageFrameDownload' ";
            linkText += "data-frameIndex='" + frameIndex + "'";
            linkText += " href='#'> Frame #" + frameIndex + "</a>";
            return linkText;
          }

          for (var frameIndex = 0; frameIndex < bot.length; frameIndex++) {
            var str = "<li>";
            str += imageFrameLink(frameIndex, "Frame #" + frameIndex);
            str += ' dataOffset = ' + (element.fragments[0].position + bot[frameIndex]);
            str += '; offset = ' + (bot[frameIndex]);
            var imageFrame = dicomParser.readEncapsulatedImageFrame(dataSet, element, frameIndex, bot);
            str += '; length = ' + imageFrame.length;
            str += this.sha1Text(imageFrame);
            str += '</li>';
            output.push(str);
          }
          output.push('</ul>');
        }
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
                text += "<i>binary data</i>";
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
                  color = '#C8C8C8';
                  // If it is some other length and we have no string
                  text += "<i>binary data</i>";
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
              // if (element.length === 2) {
              //   text += "<i>" + dataDownloadLink(element, "binary data") + " of length " + element.length + " as uint16: " + dataSet.uint16(propertyName);
              // } else if (element.length === 4) {
              //   text += "<i>" + dataDownloadLink(element, "binary data") + " of length " + element.length + " as uint32: " + dataSet.uint32(propertyName);
              // } else {
              //   text += "<i>" + dataDownloadLink(element, "binary data") + " of length " + element.length + " and VR " + vr + "</i>";
              // }
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
              text += "<i>no display code for VR " + vr + " yet, sorry!</i>";
            }
          }

          if (element.length === 0) {
            color = '#C8C8C8';
          }
        }
        // else {
        //   color = '#C8C8C8';

        //   // Add text saying the data is too long to show...
        //   text += "<i>" + dataDownloadLink(element, "data");
        //   text += " of length " + element.length + " for VR " + vr + " too long to show</i>";
        //   text += this.sha1Text(dataSet.byteArray, element.dataOffset, element.length);
        // }
        // finally we add the string to our output array surrounded by li elements so it shows up in the
        // DOM as a list
        output.push('<li style="color:' + color + ';" title="' + title + '">' + text + '</li>');

      }
    }
    // } catch (err) {
    //   var ex = {
    //     exception: err,
    //     output: output
    //   }
    //   throw ex;
    // }
  }

  render() {
    console.log("list", this.state.output[0]);
    const { output } = this.state;

    const listHtml = { __html: output.join('') };
    return (
      <Draggable handle="#handle">
        <div className="smb-pop-up">
          <div className="close-smart-brush-menu" onClick={this.props.onClose}>
            <a href="#">X</a>
          </div>
          <div id="handle" className="buttonLabel">
            <span>Meta Data of Image</span>
          </div>
          <hr />
          <div>
            {output.length && (<ul dangerouslySetInnerHTML={listHtml} />)}
          </div>
        </div>
        {/*  */}
      </Draggable>
    );
  }
}

export default connect(mapStateToProps)(MetaData);
