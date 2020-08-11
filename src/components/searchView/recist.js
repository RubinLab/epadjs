import $ from 'jquery';
import jQuery from 'jquery';


Number.prototype.times = function(fn) {
  for (var r = [], i = 0; i < this; i++) r.push(fn(i));
  return r;
};

var linkColor = '#ccf';
var errorColor = 'rgb(207, 72, 88)';
var baselineColor = 'rgb(40, 163, 46)';
var followupColor = '#1b6a81';
var targetColor = '#4d4d4d'; //'#16a79d';
var newColor = '#7f0202';
var resolvedColor = '#7c7c7c'; //'#f1960e';
var nontargetColor = targetColor; // '#7c7c7c';//'rgb(105, 177, 203)';
var calcBColor = '#d6e7f5';
var calcColor = 'dimgray';
//var numofHeaderCols=1;
var serverUrl = 'http://epad-dev4.stanford.edu:8080/epad/';
var blueBtnColor = '#407db2';
var prlColor = newColor;
var rlColor = resolvedColor;
var nlColor = newColor;
var plColor = nontargetColor; //'#1c1b1b';
var bgColor = '#666666';
var spans = []; // it is filled in MakeRecistTable
var textColor = '#d4dadd';
let i;
let j;
let k;
let sums;

function addRow(data, text, rowData, appendText, numofHeaderCols, hideCols) {
  return $('<tr/>').append(
    (rowData.length + numofHeaderCols).times(function(c) {
      if (c == 0)
        return $('<td/>')
          .attr('colspan', numofHeaderCols - hideCols.length)
          .text(text)
          .css('text-align', 'left');
      else if (c >= numofHeaderCols) {
        if (
          rowData[c - numofHeaderCols] != null &&
          rowData[c - numofHeaderCols] != 'undefined'
        )
          return $('<td/>')
            .text(roundDouble(rowData[c - numofHeaderCols]) + appendText)
            .attr('colspan', spans[c - numofHeaderCols])
            .css('text-align', 'center');
      }
    })
  );
}

function roundDouble(val) {
  if (!isNaN(val)) return Math.round(val * 100) / 100;
  return val;
}

function wordExport(patient) {
  if (!window.Blob) {
    alert('Your legacy browser does not support this action.');
    return;
  }

  var html, link, blob, url, css;

  // EU A4 use: size: 841.95pt 595.35pt;
  // US Letter use: size:11.0in 8.5in;

  css =
    '<style>' +
    '@page WordSection1{size: 595.35pt 841.95pt;mso-page-orientation: portrait;}' +
    'div.WordSection1 {page: WordSection1;}' +
    'table{border-collapse:collapse;text-align:center;}th{border:1px gray solid;text-color:black;}td{text-align:center;border:1px gray solid;text-color:black;}' +
    '</style>';
  var exportDiv = $('#docx').clone();

  exportDiv.find('tbody').removeAttr('style');
  exportDiv.find('tr').removeAttr('style');
  exportDiv.find('td').removeAttr('style');
  exportDiv.find('th').removeAttr('style');

  html = exportDiv.html();
  var date = new Date();
  var options = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  };

  var header =
    '<p>Patient ' +
    patient +
    '</p><p>Tumor Measurements</p><p>Dr._________________________</p><p>' +
    date.toLocaleTimeString('en-us', options) +
    '</p>';
  blob = new Blob(['\ufeff', css + header + html], {
    type: 'application/msword',
  });
  url = URL.createObjectURL(blob);
  link = document.createElement('A');
  link.href = url;
  // Set default file name.
  // Word will append file extension - do not add an extension here.
  link.download = 'Report_' + patient + '.doc';
  document.body.appendChild(link);
  if (navigator.msSaveOrOpenBlob)
    navigator.msSaveOrOpenBlob(blob, 'Document.doc');
  // IE10-11
  else link.click(); // other browsers
  document.body.removeChild(link);
}

function findMeasurements(table) {
  let allMeasurements = [];
  jQuery.each(table, function(i, elem) {
    jQuery.each(elem, function(j, selem) {
      if (selem != null && typeof selem === 'object') {
        Object.keys(selem).forEach(function(c) {
          if (jQuery.inArray(c, allMeasurements) == -1) allMeasurements.push(c);
        });
      }
    });
  });
  return allMeasurements;
}

function findTemplates(uids) {
  let allTemplates = [];
  jQuery.each(uids, function(i, elem) {
    jQuery.each(elem, function(j, selem) {
      if (selem != null && typeof selem['templateCode'] != 'undefined') {
        if (jQuery.inArray(selem['templateCode'], allTemplates) == -1)
          allTemplates.push(selem['templateCode']);
      }
    });
  });
  return allTemplates;
}

function findShapes(uids) {
  let allShapes = [];
  let shapes;
  jQuery.each(uids, function(i, elem) {
    jQuery.each(elem, function(j, selem) {
      if (selem != null && typeof selem['shapes'] != 'undefined') {
        shapes = selem['shapes'].split(',');
        shapes.forEach(function(shape) {
          if (shape.trim() != '' && jQuery.inArray(shape, allShapes) == -1)
            allShapes.push(shape);
        });
      }
    });
  });
  return allShapes;
}

function checkForShapes(aimShapes, filterShapes) {
  //no shape from aim return false
  if (!aimShapes && filterShapes) return false;
  let match = false;
  aimShapes.split().forEach(function(as) {
    filterShapes.split().forEach(function(fs) {
      if (fs.toLowerCase().includes(as.toLowerCase())) match = true;
    });
  });
  return match;
}

function shrinkTable(filteredTable, data, numofHeaderCols) {
  let shrinkedData = {};
  let rows = [];
  let cols = [];
  jQuery.each(filteredTable, function(i, elem) {
    rows[i] = false;
    jQuery.each(elem, function(j, selem) {
      if (selem != null && selem != 'undefined') {
        if (j >= numofHeaderCols) rows[i] = true;
        cols[j] = true;
      }
    });
  });

  let filtereddtTable = [];
  jQuery.each(data.tTable, function(i, elem) {
    if (rows[i] === true) {
      let row = [];
      jQuery.each(elem, function(j, selem) {
        if (
          cols[j] != null &&
          cols[j] != 'undefined' &&
          cols[j] == true &&
          filteredTable[i][j] != null
        )
          row.push(filteredTable[i][j]);
      });
      filtereddtTable.push(row);
    }
  });
  shrinkedData.tTable = filtereddtTable;

  let filteredduids = [];
  jQuery.each(data.tUIDs, function(i, elem) {
    if (rows[i] === true) {
      let row = [];
      jQuery.each(elem, function(j, selem) {
        if (
          cols[j + numofHeaderCols] != null &&
          cols[j + numofHeaderCols] != 'undefined' &&
          cols[j + numofHeaderCols] == true
        )
          row.push(selem);
      });
      filteredduids.push(row);
    }
  });
  shrinkedData.tUIDs = filteredduids;

  let filtereddstudyDates = [];
  jQuery.each(data.studyDates, function(i, elem) {
    if (
      cols[i + numofHeaderCols] != null &&
      cols[i + numofHeaderCols] != 'undefined' &&
      cols[i + numofHeaderCols] == true
    )
      filtereddstudyDates.push(elem);
  });
  shrinkedData.studyDates = filtereddstudyDates;

  let filtereddtTimepoints = [];
  jQuery.each(data.tTimepoints, function(i, elem) {
    if (
      cols[i + numofHeaderCols] != null &&
      cols[i + numofHeaderCols] != 'undefined' &&
      cols[i + numofHeaderCols] == true
    )
      filtereddtTimepoints.push(elem);
  });
  shrinkedData.tTimepoints = filtereddtTimepoints;

  let filtereddstTimepoints = [];
  jQuery.each(data.stTimepoints, function(i, elem) {
    if (
      cols[i + numofHeaderCols] != null &&
      cols[i + numofHeaderCols] != 'undefined' &&
      cols[i + numofHeaderCols] == true
    )
      filtereddstTimepoints.push(elem);
  });
  shrinkedData.stTimepoints = filtereddstTimepoints;

  let filtereddtLesionNames = [];
  jQuery.each(data.tLesionNames, function(i, elem) {
    if (rows[i] != null && rows[i] != 'undefined' && rows[i] == true)
      filtereddtLesionNames.push(elem);
  });
  shrinkedData.tLesionNames = filtereddtLesionNames;
  return shrinkedData;
}

function filterForMeasurementTemplateShape(
  data,
  table,
  measurement,
  uids,
  template,
  shapes,
  numofHeaderCols
) {
  if (template === 'All') {
    template = null;
  }
  if (shapes === 'All') {
    shapes = null;
  }
  let filteredTable = [];
  jQuery.each(table, function(i, elem) {
    filteredTable.push(
      elem.map(function(selem, j) {
        if (typeof selem === 'object') {
          if (
            (template == null ||
              (template != null &&
                template &&
                data.tUIDs[i][j - numofHeaderCols] != 'undefined' &&
                data.tUIDs[i][j - numofHeaderCols] != null &&
                data.tUIDs[i][j - numofHeaderCols].templateCode == template)) &&
            (shapes == null ||
              (shapes != null &&
                shapes &&
                data.tUIDs[i][j - numofHeaderCols] != null &&
                checkForShapes(
                  data.tUIDs[i][j - numofHeaderCols].shapes,
                  shapes
                )))
          )
            if (selem != null && typeof selem[measurement] != 'undefined')
              return selem[measurement].value;
            else return 'NA';
          else return null;
        } else {
          return selem;
        }
      })
    );
  });

  return filteredTable;
}

function calcSums(filteredTable, timepoints, numofHeaderCols) {
  console.log(' 0000000 ====> filteredTable, timepoints, numofHeaderCols');
  console.log(filteredTable, timepoints, numofHeaderCols);
  sums = [];
  if (filteredTable[0] != null) {
    for (k = 0; k < filteredTable[0].length - numofHeaderCols; k++) {
      sums[k] = 0.0;
      j = k;
      for (j = k; j < filteredTable[0].length - numofHeaderCols; j++) {
        if (timepoints[j] == timepoints[k]) {
          if (j != k) sums[j] = null;

          for (i = 0; i < filteredTable.length; i++) {
            try {
              if (filteredTable[i][j + numofHeaderCols] != 'NA')
                sums[k] += parseFloat(filteredTable[i][j + numofHeaderCols]);
            } catch (err) {
              console.log(
                "Couldn't convert to double value=" +
                  filteredTable[i][j + numofHeaderCols]
              );
            }
          }
        } else {
          //break if you see any other timepoint and skip the columns already calculated
          break;
        }
      }
      k = j - 1;
    }
  }
  return sums;
}

function calcRRBaseline(sums, timepoints) {
  let baseline = sums[0];
  let rrBaseline = [];
  for (i = 0; i < sums.length; i++) {
    if (sums[i] != null) {
      if (timepoints[i] != null && timepoints[i] == 0) {
        baseline = sums[i];
        console.log('baseline changed. New baseline is:' + i);
      }
      if (baseline == 0) {
        console.log('baseline is 0. returning 999999.9 for rr');
        rrBaseline[i] = 999999.9;
      } else rrBaseline[i] = ((sums[i] - baseline) * 100.0) / baseline;
    }
  }
  return rrBaseline;
}

function calcRRMin(sums, timepoints) {
  let min = sums[0];
  let rr = [];
  for (i = 0; i < sums.length; i++) {
    if (sums[i] != null) {
      if (timepoints[i] != null && timepoints[i] == 0) {
        min = sums[i];
        console.log('Min changed. New baseline.min is:' + min);
      }
      if (min == 0) {
        console.log('min is 0. returning 999999.9 for rr');
        rr[i] = 999999.9;
      } else rr[i] = ((sums[i] - min) * 100.0) / min;
      if (sums[i] < min) {
        min = sums[i];
        console.log('Min changed. Smaller rr. min is:' + min);
      }
    }
  }
  return rr;
}

function calcResponseCat(rr, timepoints, isThereNewLesion, sums) {
  let responseCats = [];
  for (i = 0; i < rr.length; i++) {
    if (rr[i] != null) {
      if (i == 0 || (timepoints[i] != null && timepoints[i] == 0)) {
        responseCats[i] = 'BL';
      } else if (
        rr[i] >= 20 ||
        (isThereNewLesion != null &&
          isThereNewLesion[i] != null &&
          isThereNewLesion[i] == true)
      ) {
        responseCats[i] = 'PD'; //progressive
      } else if (sums[i] == 0) {
        responseCats[i] = 'CR'; //complete response
      } else if (rr[i] <= -30) {
        responseCats[i] = 'PR'; //partial response
      } else {
        responseCats[i] = 'SD'; //stable disease
      }
    }
  }
  return responseCats;
}

function isThereANewLesion(data, numofHeaderCols) {
  if (data.ntTable != null) {
    let ntNewLesionStudyDates = [];
    for (i = 0; i < data.ntTable.length; i++) {
      for (j = 0; j < data.studyDates.size(); j++) {
        if (
          data.ntTable[i][j + numofHeaderCols] != null &&
          data.ntTable[i][j + numofHeaderCols]
            .trim()
            .equalsIgnoreCase('new lesion') &&
          !ntNewLesionStudyDates.contains(data.studyDates.get(j))
        ) {
          ntNewLesionStudyDates.add(data.studyDates.get(j));
        }
      }
    }
    let isThereNewLesion = [];
    if (ntNewLesionStudyDates.length != 0) {
      for (let studyDate in ntNewLesionStudyDates)
        isThereNewLesion[data.studyDates.indexOf(studyDate)] = true;
    }
  }
}

function formatDate(st) {
  var pattern = /^(\d{4})(\d{2})(\d{2})$/;
  var arrayDate = st.match(pattern);
  if (arrayDate == null) {
    //see if it matches the old format
    //sample  2008-05-19T17:50:15
    pattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/;
    arrayDate = st.match(pattern);

    if (arrayDate == null) {
      //see if matches the new one with time
      pattern = /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/;
      arrayDate = st.match(pattern);

      if (arrayDate == null) {
        //still null return date itself
        return st;
      }
    }
  }
  return arrayDate[2] + '/' + arrayDate[3] + '/' + arrayDate[1];
}

function makeTable(data, filteredTable, modality, numofHeaderCols, hideCols) {
  let spans = [];
  for (i = 0; i < data.tTimepoints.length; i++) {
    spans[i] = 0;
    let found = false;
    for (j = i; j < data.stTimepoints.length; j++) {
      //find the first one that matches
      //stop when you see anything else later
      if (data.tTimepoints[i] == data.stTimepoints[j]) {
        spans[i]++;
        found = true;
      } else if (found) break;
    }
  }

  var timepointheader = (data.tTimepoints.length + numofHeaderCols).times(
    function(c) {
      if (c == 0)
        return $('<th/>')
          .text('Lesion Name')
          .addClass('report-table__header')
          .attr('rowspan', 3)
          .css('vertical-align', 'middle')
          .css('border-bottom', 'solid 1px #4d4d4d')
          .css('text-align', 'left');
      if (hideCols.indexOf(c) != -1) return '';
      if (c == numofHeaderCols - 1)
        return $('<th/>')
          .addClass('report-table__header')
          .text('Location')
          .attr('rowspan', 3)
          .css('vertical-align', 'middle')
          .css('border-bottom', 'solid 1px #4d4d4d')
          .css('text-align', 'left');
      if (c >= numofHeaderCols) {
        let txt = '';
        if (data.tTimepoints[c - numofHeaderCols] == 0) txt = 'BL';
        else txt = 'F' + data.tTimepoints[c - numofHeaderCols];
        return $('<th/>')
          .text(txt)
          .attr('colspan', spans[c - numofHeaderCols]);
      }
    }
  );
  var header = (data.studyDates.length + numofHeaderCols).times(function(c) {
    if (c == 0 || hideCols.indexOf(c) != -1) return '';
    if (c >= numofHeaderCols) {
      let st = data.studyDates[c - numofHeaderCols];
      return $('<th/>').text(formatDate(st));
    }
  });

  var modalityheader = (data.studyDates.length + numofHeaderCols).times(
    function(c) {
      if (c == 0 || hideCols.indexOf(c) != -1) return '';
      if (c >= numofHeaderCols) {
        if (
          modality[c - numofHeaderCols] != null &&
          modality[c - numofHeaderCols] != '!'
        )
          return $('<th/>').text(modality[c - numofHeaderCols]);
        else return $('<th/>').text('');
      }
    }
  );

  var row = function(r) {
    return $('<tr/>').append(
      (data.studyDates.length + numofHeaderCols).times(function(c) {
        if (hideCols.indexOf(c) != -1) return '';
        if (
          filteredTable[r][c] == null ||
          filteredTable[r][c] === 'undefined'
        ) {
          return $('<td/>')
            .attr('id', 'c' + r + c)
            .text('--');
        }
        if (c >= numofHeaderCols)
          return $('<td/>')
            .attr('id', 'c' + r + c)
            .text(roundDouble(filteredTable[r][c]));
        else
          return $('<td/>')
            .attr('id', 'c' + r + c)
            .text(filteredTable[r][c])
            .css('text-align', 'left');
      })
    );
  };

  return $('<tbody/>').addClass("report-table__body")
    .append($('<tr/>').append(timepointheader))
    .append($('<tr/>').append(header))
    .append(
      $('<tr/>')
        .append(modalityheader)
        .css('border-bottom', 'solid 1px #4d4d4d')
    )
    .append(filteredTable.length.times(row))
    .append(
      addRow(
        data,
        'Sum Lesion Diameters (cm)',
        data.tSums,
        '',
        numofHeaderCols,
        hideCols
      ).css('border-top', 'solid 1px #4d4d4d')
    )
    .append(
      addRow(
        data,
        'RR from Baseline',
        data.tRRBaseline,
        '%',
        numofHeaderCols,
        hideCols
      )
    )
    .append(
      addRow(
        data,
        'RR from Minimum',
        data.tRRMin,
        '%',
        numofHeaderCols,
        hideCols
      )
    )
    .attr('border', 1)
    .css('background-color', '#666666')
    .css('color', '#d4dadd');
}

function MakeTableNonTarget(data, numofHeaderCols, hideCols) {
  var bigheader = $('<td/>')
    .attr('colspan', data.studyDates.length + numofHeaderCols)
    .html(
      '<div class="recist HeaderRow" id="nonMeasurableHeader">Non-measurable Disease Table</div>'
    );

  var header = (data.studyDates.length + numofHeaderCols).times(function(c) {
    if (c == 0)
      return $('<th/>')
        .text('Lesion Name')
        .css('text-align', 'left');
    if (hideCols.indexOf(c) != -1) return '';
    if (c == numofHeaderCols - 1) return $('<th/>').text('Location');
    if (c >= numofHeaderCols) {
      let st = data.studyDates[c - numofHeaderCols];
      return $('<th/>').text(formatDate(st));
    } else return $('<th/>');
  });

  var row = function(r) {
    return $('<tr/>').append(
      (data.studyDates.length + numofHeaderCols).times(function(c) {
        if (c == 1) return '';
        if (data.ntTable[r][c] == null) {
          return $('<td/>')
            .attr('id', 'nc' + r + c)
            .text('--');
        }
        if (c >= numofHeaderCols)
          return $('<td/>')
            .attr('id', 'nc' + r + c)
            .text(roundDouble(data.ntTable[r][c]))
            .css('text-align', 'center');
        else
          return $('<td/>')
            .attr('id', 'nc' + r + c)
            .text(data.ntTable[r][c])
            .css('text-align', 'left');
      })
    );
  };

  return $('<tbody/>')
    .append($('<tr/>').append(bigheader))
    .append(
      $('<tr/>')
        .append(header)
        .attr('class', 'header')
    )
    .append(data.ntTable.length.times(row))
    .attr('border', 1)
    .css('background-color', '#666666')
    .css('color', '#d4dadd');
}

function addResponseCatRow(
  data,
  text,
  rowData,
  appendText,
  numofHeaderCols,
  hideCols
) {
  return $('<tr/>').append(
    (rowData.length + numofHeaderCols).times(function(c) {
      let col;
      if (c == 0) {
        col = $('<td/>')
          .text(text)
          .css('text-align', 'left')
          .attr('colspan', numofHeaderCols - hideCols.length);
      } else if (c >= numofHeaderCols) {
        if (
          rowData[c - numofHeaderCols] != null &&
          rowData[c - numofHeaderCols] != 'undefined'
        )
          col = $('<td/>')
            .text(roundDouble(rowData[c - numofHeaderCols]) + appendText)
            .attr('colspan', spans[c - numofHeaderCols]);
      }
      return col;
    })
  );
}

function responseCatsTable(data, numofHeaderCols, hideCols) {
  return $('<tbody/>')
    .append(
      addResponseCatRow(
        data,
        'Response Category',
        data.tResponseCats,
        '',
        numofHeaderCols,
        hideCols
      )
    )
    .attr('border', 1)
    .css('border-top', 'solid 2px #4d4d4d')
    .css('background-color', '#666666');
}

function openAllAimsOfLesion(row, patientID, projectID) {
  for (j = 0; j < row.length; j++)
    window.loadSpecific(
      projectID,
      patientID,
      row[j].studyUID,
      row[j].seriesUID,
      row[j].aimUID
    );
}

function createLinkUrl(
  server,
  studyUID,
  seriesUID,
  aimUID,
  patientID,
  projectID
) {
  ////    url=serverUrl+'?projectID='+projectID+'&patientID='+patientID+'&studyUID='+studyUID+'&seriesUID='+seriesUID+'&aimID='+aimUID;
  //    text='projectID='+projectID+'&patientID='+patientID+'&studyUID='+studyUID+'&seriesUID='+seriesUID+'&aimID='+aimUID;
  //    var encrypted=CryptoJS.AES.encrypt(text, "bb33647e-140e-11e7-93ae-92361f002671")
  //    enc="?enc="+encodeURIComponent(encrypted.toString());
  //    url=serverUrl+enc;
  //    return url;
  return '#';
}

function checkAndColor(
  data,
  patientID,
  projectID,
  recisttable,
  numofHeaderCols
) {
  for (i = 0; i < data.tUIDs.length; i++) {
    var aNameTag = $('<a>', { href: '#' });
    aNameTag.click(
      { projectID: projectID, patientID: patientID, row: data.tUIDs[i] },
      function(event) {
        openAllAimsOfLesion(
          event.data.row,
          event.data.patientID,
          event.data.projectID
        );
      }
    );
    let txt = recisttable.find('#c' + i + '0').text();
    aNameTag.text(txt); // Populate the text with what's already there
    aNameTag.css('color', linkColor);
    aNameTag.css('text-decoration', 'none');
    //                aNameTag.attr('target', '_blank');
    recisttable
      .find('#c' + i + '0')
      .text('')
      .append(aNameTag);
    for (j = 0; j < data.tUIDs[i].length; j++) {
      //find if the cell is in a span
      //find which span
      let isInSpan = false;
      var k;
      for (k = 0; k < spans.length; k++) {
        if (spans[k] > 1 && j >= k && j < k + spans[k]) {
          isInSpan = true;
          break;
        }
      }
      //put link
      if (data.tUIDs[i][j] != null) {
        var aTag = $('<a>', {
          href: createLinkUrl(
            serverUrl,
            data.tUIDs[i][j].studyUID,
            data.tUIDs[i][j].seriesUID,
            data.tUIDs[i][j].aimUID,
            patientID,
            projectID
          ),
        });
        aTag.click(
          {
            projectID: projectID,
            patientID: patientID,
            studyUID: data.tUIDs[i][j].studyUID,
            seriesUID: data.tUIDs[i][j].seriesUID,
            aimUID: data.tUIDs[i][j].aimUID,
          },
          function(event) {
            window.loadSpecific(
              event.data.projectID,
              event.data.patientID,
              event.data.studyUID,
              event.data.seriesUID,
              event.data.aimUID
            );
          }
        );
        txt = recisttable.find('#c' + i + (j + numofHeaderCols)).text();
        aTag.text(txt); // Populate the text with what's already there
        aTag.css('color', linkColor);
        aTag.css('text-decoration', 'none');
        //                aTag.attr('target', '_blank');
        recisttable
          .find('#c' + i + (j + numofHeaderCols))
          .text('')
          .append(aTag);

        //                recisttable.find('#c'+i+'1').hide();
        //the cell num of location is important! Assumes it is goig to be on second column
        if (data.tUIDs[i][j].location != data.tTable[i][1]) {
          recisttable
            .find('#c' + i + '1')
            .css('border-left', 'solid 2px ' + errorColor);
        }

        //baseline
        if (data.tUIDs[i][j].timepoint == 0) {
          recisttable
            .find('#c' + i + (j + numofHeaderCols))
            .css('border-left', 'solid 2px ' + baselineColor);
        }
        //followup
        if (data.tUIDs[i][j].timepoint != 0) {
          recisttable
            .find('#c' + i + (j + numofHeaderCols))
            .css('border-left', 'solid 2px ' + followupColor);
        }
        //new lesion
        if (data.tUIDs[i][j].type.indexOf('new') != -1) {
          recisttable
            .find('#c' + i + (j + numofHeaderCols))
            .css('background-color', newColor);
          //.css('border-bottom', 'solid 2px '+newColor);
        }
        //resolved lesion
        if (data.tUIDs[i][j].type.indexOf('resolved') != -1) {
          recisttable
            .find('#c' + i + (j + numofHeaderCols))
            .css('background-color', resolvedColor);
          //.css('border-bottom', 'solid 2px '+resolvedColor);
        }
        //target lesion
        //                if (data.tUIDs[i][j].type.indexOf('target')!=-1){
        //                	recisttable.find('#c'+i+(j+numofHeaderCols)).css('background-color', targetColor);
        //                }
        //timepoint
        //check if it is different from the row above (or j?)
        if (
          i > 0 &&
          (data.tUIDs[i - 1][j] != null &&
            data.tUIDs[i][j].timepoint != data.tUIDs[i - 1][j].timepoint)
        ) {
          recisttable
            .find('#c' + i + (j + numofHeaderCols))
            .css('border-left', 'solid 2px ' + errorColor);
        }
      } else {
        //see if there is any other cell that is full in that span
        let hasAnyInSpanAfter = false;
        let hasAnyInSpanBefore = false;
        for (let t = j; t < data.stTimepoints.length; t++) {
          if (data.stTimepoints[t] == data.tTimepoints[k]) {
            if (data.tUIDs[i][t] != null) {
              hasAnyInSpanAfter = true;
              break;
            }
          } else {
            break;
          }
        }
        for (let t = j; t > 0; t--) {
          if (data.stTimepoints[t] == data.tTimepoints[k]) {
            if (data.tUIDs[i][t] != null) {
              hasAnyInSpanBefore = true;
              break;
            }
          } else {
            break;
          }
        }
        if (!isInSpan && !hasAnyInSpanAfter && !hasAnyInSpanBefore)
          recisttable
            .find('#c' + i + (j + numofHeaderCols))
            .css('background-color', errorColor);
      }
    }
  }
  for (k = 0; k < data.studyDates.length + numofHeaderCols; k++)
    recisttable
      .find('#c' + (data.tUIDs.length - 1) + k)
      .css('border-bottom-width', 'thick');
}

function checkAndColorNonTarget(
  data,
  patientID,
  projectID,
  recisttable,
  numofHeaderCols
) {
  for (i = 0; i < data.ntUIDs.length; i++) {
    var aNameTag = $('<a>', { href: '#' });
    aNameTag.click(
      { projectID: projectID, patientID: patientID, row: data.ntUIDs[i] },
      function(event) {
        openAllAimsOfLesion(
          event.data.row,
          event.data.patientID,
          event.data.projectID
        );
      }
    );
    let txt = recisttable.find('#nc' + i + '0').text();
    aNameTag.text(txt); // Populate the text with what's already there
    aNameTag.css('color', linkColor);
    aNameTag.css('text-decoration', 'none');
    //                aNameTag.attr('target', '_blank');
    recisttable
      .find('#nc' + i + '0')
      .text('')
      .append(aNameTag);
    for (j = 0; j < data.ntUIDs[i].length; j++) {
      //put link
      if (data.ntUIDs[i][j] != null) {
        if (
          data.ntTable[i][j + numofHeaderCols]
            .toLowerCase()
            .indexOf('progressive') != -1
        ) {
          recisttable.find('#nc' + i + (j + numofHeaderCols)).text('PrL');
          recisttable
            .find('#nc' + i + (j + numofHeaderCols))
            .css('background-color', prlColor);
        } else if (
          data.ntTable[i][j + numofHeaderCols]
            .toLowerCase()
            .indexOf('resolved') != -1
        ) {
          recisttable.find('#nc' + i + (j + numofHeaderCols)).text('RL');
          recisttable
            .find('#nc' + i + (j + numofHeaderCols))
            .css('background-color', rlColor);
        } else if (
          data.ntTable[i][j + numofHeaderCols].toLowerCase().indexOf('new') !=
          -1
        ) {
          recisttable.find('#nc' + i + (j + numofHeaderCols)).text('NL');
          recisttable
            .find('#nc' + i + (j + numofHeaderCols))
            .css('background-color', nlColor);
        } else if (
          data.ntTable[i][j + numofHeaderCols]
            .toLowerCase()
            .indexOf('reappeared') != -1
        ) {
          recisttable.find('#nc' + i + (j + numofHeaderCols)).text('RaL');
          recisttable
            .find('#nc' + i + (j + numofHeaderCols))
            .css('background-color', nlColor);
        } else {
          recisttable.find('#nc' + i + (j + numofHeaderCols)).text('PL');
          recisttable
            .find('#nc' + i + (j + numofHeaderCols))
            .css('background-color', plColor);
        }

        var aTag = $('<a>', {
          href: createLinkUrl(
            serverUrl,
            data.ntUIDs[i][j].studyUID,
            data.ntUIDs[i][j].seriesUID,
            data.ntUIDs[i][j].aimUID,
            patientID,
            projectID
          ),
        });
        aTag.click(
          {
            projectID: projectID,
            patientID: patientID,
            studyUID: data.ntUIDs[i][j].studyUID,
            seriesUID: data.ntUIDs[i][j].seriesUID,
            aimUID: data.ntUIDs[i][j].aimUID,
          },
          function(event) {
            window.loadSpecific(
              event.data.projectID,
              event.data.patientID,
              event.data.studyUID,
              event.data.seriesUID,
              event.data.aimUID
            );
          }
        );
        aTag.text(recisttable.find('#nc' + i + (j + numofHeaderCols)).text()); // Populate the text with what's already there
        aTag.css('color', linkColor);
        aTag.css('text-decoration', 'none');
        //                aTag.attr('target', '_blank');
        recisttable
          .find('#nc' + i + (j + numofHeaderCols))
          .text('')
          .append(aTag);
      }
    }
    for (k = 0; k < data.studyDates.length + numofHeaderCols; k++)
      recisttable
        .find('#c' + (data.tUIDs.length - 1) + k)
        .css('border-bottom-width', 'thick');
  }
}

function fillInTables(
  data,
  filteredTable,
  patId,
  projectId,
  recisttable,
  numofHeaderCols,
  hideCols
) {
  let modality = [];
  for (i = 0; i < data.tUIDs.length; i++) {
    for (j = 0; j < data.tUIDs[i].length; j++) {
      if (data.tUIDs[i][j] != null && data.tUIDs[i][j] != '') {
        if (modality[j] == null) modality[j] = data.tUIDs[i][j].modality;
        else if (modality[j].indexOf(data.tUIDs[i][j].modality) == -1)
          modality[j] += '/' + data.tUIDs[i][j].modality;
      }
    }
    if (data.ntUIDs != null && data.ntUIDs[i] != null) {
      for (j = 0; j < data.ntUIDs[i].length; j++) {
        if (data.ntUIDs[i][j] != null && data.ntUIDs[i][j] != '') {
          if (modality[j] == null) modality[j] = data.ntUIDs[i][j].modality;
          else if (modality[j].indexOf(data.ntUIDs[i][j].modality) == -1)
            modality[j] = '/' + data.ntUIDs[i][j].modality;
        }
      }
    }
  }
  var table = $('<table/>').attr('class', 'w3-table w3-small w3-centered');
  if (data.tSums == null) {
    data.tSums = calcSums(filteredTable, data.stTimepoints, numofHeaderCols);
    data.tRRBaseline = calcRRBaseline(sums, data.stTimepoints);
    data.tRRMin = calcRRMin(sums, data.stTimepoints);
    data.tResponseCats = calcResponseCat(
      data.tRRMin,
      data.stTimepoints,
      isThereANewLesion(data),
      sums
    );
  }
  table.append(
    makeTable(data, filteredTable, modality, numofHeaderCols, hideCols)
  );

  if (data.ntTable != null) {
    table.append(MakeTableNonTarget(data, numofHeaderCols, hideCols));
  }
  table.append(responseCatsTable(data, numofHeaderCols, hideCols));
  ////    needed for whole page without dialog. uncomment these, remove dialog open and put a filter select
  //    var recisttable=$("#tables");
  //    recisttable.empty();
  //    recisttable.append(table);
  recisttable.find('#tables').empty();
  recisttable
    .find('#tables')
    // .attr('class', 'w3-responsive')
    .append(table);
  recisttable.find('th').css('border-left', 'solid 2px ' + textColor);
  recisttable.find('td').css('border-left', 'solid 2px ' + textColor);
  checkAndColor(data, patId, projectId, recisttable, numofHeaderCols);
  if (data.ntTable != null) {
    checkAndColorNonTarget(
      data,
      patId,
      projectId,
      recisttable,
      numofHeaderCols
    );
  }
  recisttable.find('th').css('color', 'white');
  // recisttable.find('tr').css('line-height', 0.5);
  // recisttable.find('.header').css('line-height', 0.2);
  return recisttable;
  ////    remove for whole page without dialog. uncomment these
  // recisttable.dialog('open');
}

// function filterAndFillInTables(
//   data,
//   table,
//   patId,
//   projectId,
//   recisttable,
//   numofHeaderCols,
//   hideCols
// ) {
//   var filter = recisttable.find('#filter');
//   var templateFilter = recisttable.find('#templateFilter');
//   var shapesFilter = recisttable.find('#shapesFilter');
//   let filteredTable = filterForMeasurementTemplateShape(
//     data,
//     table,
//     filter.val(),
//     data.tUIDs,
//     templateFilter.val(),
//     shapesFilter.val(),
//     numofHeaderCols
//   );
//   let shrinkedData;
//   shrinkedData = shrinkTable(filteredTable, data, numofHeaderCols);
//   //filter change should calculate everything
//   shrinkedData = makeCalcs(shrinkedData, numofHeaderCols);
//   recisttable = fillInTables(
//     shrinkedData,
//     shrinkedData.tTable,
//     patId,
//     projectId,
//     recisttable,
//     numofHeaderCols,
//     hideCols
//   );
//   return recisttable;
// }

function makeCalcs(shrinkedData, numofHeaderCols) {
  shrinkedData.tSums = calcSums(
    shrinkedData.tTable,
    shrinkedData.stTimepoints,
    numofHeaderCols
  );
  shrinkedData.tRRBaseline = calcRRBaseline(
    shrinkedData.tSums,
    shrinkedData.stTimepoints
  );
  shrinkedData.tRRMin = calcRRMin(
    shrinkedData.tSums,
    shrinkedData.stTimepoints
  );
  shrinkedData.tResponseCats = calcResponseCat(
    shrinkedData.tRRMin,
    shrinkedData.stTimepoints,
    isThereANewLesion(shrinkedData),
    shrinkedData.tSums
  );
  return shrinkedData;
}

function prettyShape(value) {
  if (value.toLowerCase().includes('multipoint')) return 'Line';
  if (value.toLowerCase().includes('polyline')) return 'Polygon';
  if (value.toLowerCase().includes('spline')) return 'Spline';
  if (value.toLowerCase().includes('circle')) return 'Circle';
  if (value.toLowerCase().includes('point')) return 'Point';
  if (value.toLowerCase().includes('ellipse')) return 'Perpendicular';
}

function fillFilterSelect(
  data,
  table,
  patId,
  projectId,
  recisttable,
  numofHeaderCols,
  hideCols,
  loadFilter
) {
  let shrinkedData;
  var filter = recisttable.find('#filter');
  //uncomment for whole page
  //    var $filter = $("#filter");
  filter.empty();
  $.each(findMeasurements(table), function(index, value) {
    filter.append('<option>' + value + '</option>');
  });
  var templateFilter = recisttable.find('#templateFilter');
  //uncomment for whole page
  //    var $filter = $("#filter");
  templateFilter.empty();
  templateFilter.append('<option>All</option>');
  $.each(findTemplates(data.tUIDs), function(index, value) {
    templateFilter.append('<option>' + value + '</option>');
  });
  var shapesFilter = recisttable.find('#shapesFilter');
  //uncomment for whole page
  //    var $filter = $("#filter");
  shapesFilter.empty();
  shapesFilter.append('<option>All</option>');
  $.each(findShapes(data.tUIDs), function(index, value) {
    shapesFilter.append(
      '<option value=' +
        value +
        ' text=' +
        prettyShape(value) +
        '>' +
        prettyShape(value) +
        '</option>'
    );
  });
  if (filter.is(':empty')) {
    let filteredTable = table;
    filter.hide();
    templateFilter.hide();
    shapesFilter.hide();
    //this should be recist and shoudn't need calculations
    shrinkedData = data;
  } else {
    if (loadFilter) {
      let filters = loadFilter.split('&');
      filters.forEach(function(item) {
        let pair = item.split('=');
        if (pair) {
          if (pair[0] === 'shapes') {
            //assume just one for now
            shapesFilter
              .find('option[text="' + pair[1] + '"]')
              .prop('selected', true);
            //              shapesFilter.val(pair[1]);
          }
          if (pair[0] === 'metric') {
            filter.val(pair[1]);
          }
        }
      });
    } else {
      filter.selectedIndex = 0;
      templateFilter.selectedIndex = 0;
      shapesFilter.selectedIndex = 0;
    }
    //why patid and projectid not processed
    //        filteredTable=filterForMeasurement(data,table,filter.val(),patId,projectId);
    let filteredTable = filterForMeasurementTemplateShape(
      data,
      table,
      filter.val(),
      data.tUIDs,
      templateFilter.val(),
      shapesFilter.val(),
      numofHeaderCols
    );
    shrinkedData = shrinkTable(filteredTable, data, numofHeaderCols);
  }
  if (shrinkedData.tSums == null) {
    shrinkedData = makeCalcs(shrinkedData, numofHeaderCols);
  }
  recisttable = fillInTables(
    shrinkedData,
    shrinkedData.tTable,
    patId,
    projectId,
    recisttable,
    numofHeaderCols,
    hideCols
  );
  if (loadFilter) {
    filter.hide();
    templateFilter.hide();
    shapesFilter.hide();
  }

  // filter.change(function() {
  //   recisttable = filterAndFillInTables(
  //     data,
  //     data.tTable,
  //     patId,
  //     projectId,
  //     recisttable,
  //     numofHeaderCols,
  //     hideCols
  //   );
  // });

  // templateFilter.change(function() {
  //   recisttable = filterAndFillInTables(
  //     data,
  //     data.tTable,
  //     patId,
  //     projectId,
  //     recisttable,
  //     numofHeaderCols,
  //     hideCols
  //   );
  // });

  // shapesFilter.change(function() {
  //   recisttable = filterAndFillInTables(
  //     data,
  //     data.tTable,
  //     patId,
  //     projectId,
  //     recisttable,
  //     numofHeaderCols,
  //     hideCols
  //   );
  // });
  return recisttable;
}

export async function renderTable(
  id,
  patId,
  projectId,
  report,
  data,
  numofHeaderCols,
  hidecols,
  loadFilter,
  onClose
) {
  //check the existing ids and create a unique id for this recist table
  // var id = 'recisttbl';
  var recisttable = null;
  i = 0;
  while ((recisttable = document.getElementById('recisttbl' + i)) !== null) {
    i++;
  }
  id = id + i;
  recisttable = $(document.createElement('div'));
  //table and graph buttons <button class="w3-btn w3-tiny w3-round-large recistWhitetext" id="tableBtn">Table</button>&nbsp;<button class="w3-btn w3-tiny w3-round-large recistWhitetext" id="graphBtn">Graph</button>&nbsp;

  recisttable.html(
    '<div id="' +
      id +
      //  'class="recistingTest"' +
      '" title="' +
      report +
      // '"  style="background-color:#4d4d4d;overflow-y:auto;overflow-x:auto;"><h6 style="font-size:100%;text-align:right;padding:0;border:0;margin:0;color:white;background-color:#666666;"><select id="shapesFilter"><option>Choose to filter</option></select>&nbsp;<select id="templateFilter"><option>Choose to filter</option></select>&nbsp;<select id="filter"><option>Choose to filter</option></select>&nbsp;<button class="w3-btn w3-tiny w3-round-large recistWhitetext" id="exportBtn">Export</button></h6></div><div id="docx"><div id= "tables" class="WordSection1"></div></div><h6 style="font-size:80%;text-align:left;padding:0;border:0;margin:0;color:white;background-color:#666666;"><button id="baseline" class="w3-btn w3-tiny w3-round-large recistWhitetext" style="border:1px solid #9a9797">Baseline</button>&nbsp;<button id="followup" class="w3-btn w3-tiny w3-round-large recistWhitetext" style="border:1px solid #9a9797">Followup</button>&nbsp;<button id="new" class="w3-btn w3-tiny w3-round-large recistWhitetext">New/Reappeared/Progressive</button>&nbsp;<button id="resolved" class="w3-btn w3-tiny w3-round-large recistWhitetext">Resolved</button>&nbsp;<button id="nontarget" class="w3-btn w3-tiny w3-round-large recistWhitetext">Present Lesion</button>&nbsp;<button id="error" class="w3-btn w3-tiny w3-round-large recistWhitetext">Error</button></h6></div>'
      '"  style="background-color:#4d4d4d;overflow-y:auto;overflow-x:auto;"><h6 style="font-size:100%;text-align:right;padding:0;border:0;margin:0;color:white;background-color:#666666;"><select id="shapesFilter"><option>Choose to filter</option></select>&nbsp;<select id="templateFilter"><option>Choose to filter</option></select>&nbsp;<select id="filter"><option>Choose to filter</option></select>&nbsp;<button class="w3-btn w3-tiny w3-round-large recistWhitetext" id="exportBtn">Export</button><button class="w3-btn w3-round-large recistWhitetext" id="closeBtn">&#215</button></h6></div><div id="docx"><div id= "tables" class="WordSection1"></div></div><h6 style="font-size:80%;text-align:left;padding:0;border:0;margin:0;color:white;background-color:#666666;"><button id="baseline" class="w3-btn w3-tiny w3-round-large recistWhitetext" style="border:1px solid #9a9797">Baseline</button>&nbsp;<button id="followup" class="w3-btn w3-tiny w3-round-large recistWhitetext" style="border:1px solid #9a9797">Followup</button>&nbsp;<button id="new" class="w3-btn w3-tiny w3-round-large recistWhitetext">New/Reappeared/Progressive</button>&nbsp;<button id="resolved" class="w3-btn w3-tiny w3-round-large recistWhitetext">Resolved</button>&nbsp;<button id="nontarget" class="w3-btn w3-tiny w3-round-large recistWhitetext">Present Lesion</button>&nbsp;<button id="error" class="w3-btn w3-tiny w3-round-large recistWhitetext">Error</button></h6></div>'

      );
  var reportText = report;
  if (reportText === 'RECIST') reportText = 'Tumor Burden';

  recisttable
    .find('#baseline')
    .css('border-left', 'solid 8px ' + baselineColor);
  recisttable.find('#baseline').css('background-color', bgColor);
  recisttable
    .find('#followup')
    .css('border-left', 'solid 8px ' + followupColor);
  recisttable.find('#followup').css('background-color', bgColor);
  recisttable.find('#tableBtn').css('background-color', blueBtnColor);
  recisttable.find('#graphBtn').css('background-color', blueBtnColor);
  recisttable.find('#exportBtn').css('background-color', blueBtnColor);
  //  recisttable.find('#target').css("background-color",targetColor)
  recisttable.find('#new').css('background-color', newColor);
  recisttable.find('#resolved').css('background-color', resolvedColor);
  recisttable.find('#nontarget').css('background-color', nontargetColor);
  recisttable.find('#error').css('background-color', errorColor);

  recisttable = fillFilterSelect(
    data,
    data.tTable,
    patId,
    projectId,
    recisttable,
    numofHeaderCols,
    hidecols,
    loadFilter
  );

  $('.ui-dialog-titlebar').css('background', '#4d4d4d');
  $('.ui-dialog-titlebar').css('padding', 0);
  $('.ui-dialog-titlebar').css('text-overflow', 'none');
  $('.ui-dialog-titlebar').css('text-align', 'center');
  $('.ui-dialog-content').css('padding', 0);
  $('.ui-widget-header').css('border', 0);
  $('.ui-widget-header').removeClass('ui-corner-all');

  recisttable.find('td').css('text-align', 'center');
  return recisttable.html();
}
