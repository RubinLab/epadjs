import $ from 'jquery/dist/jquery.js';

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
  console.log(html);
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
	if (!aimShapes && filterShapes)
		return false;
	
    match=false;
	aimShapes.split().forEach(function(as){
		filterShapes.split().forEach(function(fs){
            if (fs.toLowerCase().includes(as.toLowerCase()))
				match=true;
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
function fillInTables(data, filteredTable,patId,projectId,recisttable,numofHeaderCols,hideCols){
  modality=[];
  for (i=0;i<data.tUIDs.length;i++){
          for (j=0;j<data.tUIDs[i].length;j++){
              if (data.tUIDs[i][j]!=null && data.tUIDs[i][j]!=""){
                  if (modality[j]==null)
                      modality[j]=data.tUIDs[i][j].modality;
                  else if (modality[j].indexOf(data.tUIDs[i][j].modality)==-1)
                      modality[j]+="/"+data.tUIDs[i][j].modality;
              }
          }
          if (data.ntUIDs!=null && data.ntUIDs[i]!=null){
              for (j=0;j<data.ntUIDs[i].length;j++){
                  if (data.ntUIDs[i][j]!=null && data.ntUIDs[i][j]!=""){
                      if (modality[j]==null)
                          modality[j]=data.ntUIDs[i][j].modality;
                      else if (modality[j].indexOf(data.ntUIDs[i][j].modality)==-1)
                          modality[j]="/"+data.ntUIDs[i][j].modality;
                  }
              }
          }
  }
  var table=$("<table/>")
   .attr("class","w3-table w3-small w3-centered");
  if (data.tSums == null){
      data.tSums=calcSums(filteredTable,data.stTimepoints,numofHeaderCols);
      data.tRRBaseline=calcRRBaseline(sums,data.stTimepoints);
      data.tRRMin=calcRRMin(sums,data.stTimepoints);
      data.tResponseCats=calcResponseCat(data.tRRMin, data.stTimepoints, isThereANewLesion(data), sums);
  }
  table.append(makeTable(data, filteredTable, modality,numofHeaderCols,hideCols));
  if (data.ntTable!=null){
      table.append(MakeTableNonTarget(data,numofHeaderCols,hideCols));
  }
  table.append(responseCatsTable(data,numofHeaderCols,hideCols));
////    needed for whole page without dialog. uncomment these, remove dialog open and put a filter select
//    var recisttable=$("#tables");
//    recisttable.empty();
//    recisttable.append(table);
  recisttable.find("#tables").empty();
  recisttable.find("#tables").attr("class","w3-responsive").append(table);
//    
  recisttable.find("th").css('border-left', 'solid 2px '+textColor);
  recisttable.find("td").css('border-left', 'solid 2px '+textColor);
  checkAndColor(data,patId,projectId,recisttable,numofHeaderCols);
  if (data.ntTable!=null){
      checkAndColorNonTarget(data,patId,projectId,recisttable,numofHeaderCols);
  }
  recisttable.find("th").css("color","white");
  recisttable.find("tr").css("line-height",0.5);
  recisttable.find(".header").css("line-height",0.2);

  ////    remove for whole page without dialog. uncomment these
  recisttable.dialog( "open" );
}

function filterAndFillInTables(
  data,
  table,
  patId,
  projectId,
  recisttable,
  numofHeaderCols,
  hideCols
) {
  var filter = recisttable.find('#filter');
  var templateFilter = recisttable.find('#templateFilter');
  var shapesFilter = recisttable.find('#shapesFilter');
  let filteredTable = filterForMeasurementTemplateShape(
    data,
    table,
    filter.val(),
    data.tUIDs,
    templateFilter.val(),
    shapesFilter.val(),
    numofHeaderCols
  );
  let shrinkedData;
  shrinkedData = shrinkTable(filteredTable, data, numofHeaderCols);
  //filter change should calculate everything
  shrinkedData = makeCalcs(shrinkedData, numofHeaderCols);
  fillInTables(
    shrinkedData,
    shrinkedData.tTable,
    patId,
    projectId,
    recisttable,
    numofHeaderCols,
    hideCols
  );
}

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
    filteredTable = table;
    filter.hide();
    templateFilter.hide();
    shapesFilter.hide();
    //this should be recist and shoudn't need calculations
    shrinkedData = data;
  } else {
    if (loadFilter) {
      filters = loadFilter.split('&');
      filters.forEach(function(item) {
        pair = item.split('=');
        if (pair) {
          if (pair[0] === 'shapes') {
            //assume just one for now
            shapesFilter
              .find('option[text="' + pair[1] + '"]')
              .prop('selected', true);
            //    					shapesFilter.val(pair[1]);
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
    filteredTable = filterForMeasurementTemplateShape(
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
  fillInTables(
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

  filter.change(function() {
    filterAndFillInTables(
      data,
      data.tTable,
      patId,
      projectId,
      recisttable,
      numofHeaderCols,
      hideCols
    );
  });

  templateFilter.change(function() {
    filterAndFillInTables(
      data,
      data.tTable,
      patId,
      projectId,
      recisttable,
      numofHeaderCols,
      hideCols
    );
  });

  shapesFilter.change(function() {
    filterAndFillInTables(
      data,
      data.tTable,
      patId,
      projectId,
      recisttable,
      numofHeaderCols,
      hideCols
    );
  });
}

function getReport(
  serverUrl,
  patId,
  projectId,
  recisttable,
  filter,
  numofHeaderCols,
  hidecols,
  loadFilter
) {
  //	recisttable.find('#patient').text('Patient '+patId).css('color','#4489c4');

  //     var data=JSON.parse(reportDataJson);
  //     fillFilterSelect(data,data.tTable,patId,projectId);

  $.ajax({
    type: 'GET',
    url:
      serverUrl +
      'v2/projects/' +
      projectId +
      '/subjects/' +
      patId +
      '/aims/?' +
      filter,
    dataType: 'json',
    data: null,
    xhrFields: {
      withCredentials: true,
    },
    cache: false,
    error: function(jqXHR, textStatus, errorThrown) {
      alert(
        JSON.stringify(jqXHR) +
          ' status:' +
          textStatus +
          ' error:' +
          errorThrown
      );
    },
    success: function(data) {
      fillFilterSelect(
        data,
        data.tTable,
        patId,
        projectId,
        recisttable,
        numofHeaderCols,
        hideCols,
        loadFilter
      );
    },
  });
}

export function renderTable(
  serverUrl,
  id,
  patId,
  projectId,
  report,
  template,
  data
) {
  //check the existing ids and create a unique id for this recist table
  console.log('this is called!!!');
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
      '" title="' +
      report +
      '"  style="background-color:#4d4d4d;overflow-y:auto;overflow-x:auto;"><h6 style="font-size:80%;text-align:right;padding:0;border:0;margin:0;color:white;background-color:#666666;"><select id="shapesFilter"><option>Choose to filter</option></select>&nbsp;<select id="templateFilter"><option>Choose to filter</option></select>&nbsp;<select id="filter"><option>Choose to filter</option></select>&nbsp;<button class="w3-btn w3-tiny w3-round-large recistWhitetext" id="exportBtn">Export</button></h6></div><div id="docx"><div id= "tables" class="WordSection1"></div></div><h6 style="font-size:80%;text-align:left;padding:0;border:0;margin:0;color:white;background-color:#666666;"><button id="baseline" class="w3-btn w3-tiny w3-round-large recistWhitetext" style="border:1px solid #9a9797">Baseline</button>&nbsp;<button id="followup" class="w3-btn w3-tiny w3-round-large recistWhitetext" style="border:1px solid #9a9797">Followup</button>&nbsp;<button id="new" class="w3-btn w3-tiny w3-round-large recistWhitetext">New/Reappeared/Progressive</button>&nbsp;<button id="resolved" class="w3-btn w3-tiny w3-round-large recistWhitetext">Resolved</button>&nbsp;<button id="nontarget" class="w3-btn w3-tiny w3-round-large recistWhitetext">Present Lesion</button>&nbsp;<button id="error" class="w3-btn w3-tiny w3-round-large recistWhitetext">Error</button></h6></div>'
  );
  var reportText = report;
  if (reportText === 'RECIST') reportText = 'Tumor Burden';
  recisttable.dialog({
    autoOpen: false,
    width: 'auto',
    minWidth: 300,
    maxHeight: 800,
    resizable: true,
    title: 'Patient ' + patId + ' ' + reportText + ' Report',
    beforeClose: function myCloseDialog() {
      recisttable.remove();
    },
  });
  recisttable.dialogExtend({
    closable: true, // enable/disable close button
    maximizable: true, // enable/disable maximize button
    minimizable: true, // enable/disable minimize button
    minimizeLocation: 'right', // sets alignment of minimized dialogues
    icons: {
      // jQuery UI icon class
      close: 'ui-icon-close',
      maximize: 'ui-icon-plus',
      minimize: 'ui-icon-minus',
      restore: 'ui-bullet',
    },
  });

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
  //	recisttable.find('#target').css("background-color",targetColor)
  recisttable.find('#new').css('background-color', newColor);
  recisttable.find('#resolved').css('background-color', resolvedColor);
  recisttable.find('#nontarget').css('background-color', nontargetColor);
  recisttable.find('#error').css('background-color', errorColor);
  filter = '';
  loadFilter = '';
  if (report === 'RECIST') {
    filter = 'report=RECIST';
    numofHeaderCols = 3;
    hideCols = [1];
  } else if (report === 'ADLA') {
    filter = 'report=Longitudinal&shapes=line';
    loadFilter = 'shapes=line&metric=standard deviation';
    numofHeaderCols = 2;
    hideCols = [];
  } else {
    filter = 'report=Longitudinal';
    if (report != 'Longitudinal') loadFilter = 'metric=' + report;
    if (template != null) filter += '&templatecode=' + template;
    numofHeaderCols = 2;
    hideCols = [];
  }
  // getReport(
  //   serverUrl,
  //   patId,
  //   projectId,
  //   recisttable,
  //   filter,
  //   numofHeaderCols,
  //   hideCols,
  //   loadFilter
  // );
  fillFilterSelect(
    data,
    data.tTable,
    patId,
    projectId,
    recisttable,
    numofHeaderCols,
    hideCols,
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
  window.exportBtn.onclick = function() {
    wordExport(patId);
  };
  //    recisttable.find('#patientHeader').height('30px').css('font-size','110%');
}
