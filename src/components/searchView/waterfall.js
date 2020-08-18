import jQuery from 'jquery';
import $ from 'jquery';
import Highcharts from 'highcharts';

let i;
 function getWaterfallForAllInProject(projectID, type, waterfallDiv, metric) {
  var waterfallUrl =
    'http://' +
    window.location.host +
    '/epad/v2/projects/' +
    projectID +
    '/aims/?report=WATERFALL&type=' +
    type;
  if (metric != null && metric != 'undefined')
    waterfallUrl += '&metric=' + metric;
  drawWaterfall(waterfallUrl, waterfallDiv, metric);
}

function getWaterfallForProject(
  subjectUIDs,
  projectID,
  type,
  waterfallDiv,
  metric
) {
  var waterfallUrl =
    'http://' +
    window.location.host +
    '/epad/v2/aims/?subjectUIDs=' +
    subjectUIDs +
    '&projectID=' +
    projectID +
    '&report=WATERFALL&type=' +
    type;
  if (metric != null && metric != 'undefined')
    waterfallUrl += '&metric=' + metric;
  drawWaterfall(waterfallUrl, waterfallDiv, metric);
}

function getWaterfallForWorklist(subj_proj_array, type, waterfallDiv, metric) {
  var waterfallUrl =
    'http://' +
    window.location.host +
    '/epad/v2/aims/?report=WATERFALL&type=' +
    type +
    '&subj_proj_pairs=' +
    encodeURIComponent(JSON.stringify(subj_proj_array));
  if (metric != null && metric != 'undefined')
    waterfallUrl += '&metric=' + metric;
  drawWaterfall(waterfallUrl, waterfallDiv, metric);
}

//rounds the val to 2 digit precision if double
function roundDouble(val) {
  if (!isNaN(val)) return Math.round(val * 100) / 100;
  return val;
}

export function drawWaterfall(data, metric) {
  console.log(Highcharts);
  var processed_json = new Array();
  for (i = 0; i < data.series.length; i++) {
    /* if (data.series[i].responseCategory=="SD"){
	                    data.series[i].color='Orange';
	                }
	                if (data.series[i].responseCategory=="PR"){
	                    data.series[i].color='Green';
	                } */
    console.log(data.series[i].name + ' ' + roundDouble(data.series[i].y));
    if (
      roundDouble(data.series[i].y) < 999.0 &&
      roundDouble(data.series[i].y) != 0.0
    ) {
      data.series[i].y = roundDouble(data.series[i].y);
      processed_json.push(data.series[i]);
    } else {
      console.log(data.series[i].name + ' ' + data.series[i].y);
    }
  }

  // draw chart
  // $('#waterfallContainer').highcharts({
  Highcharts.chart('report', {
    chart: {
      type: 'column',
    },
    title: {
      text: 'Waterfall',
    },
    legend: {
      enabled: false,
    },
    xAxis: {
      type: 'category',
      allowDecimals: false,
      title: {
        text: '',
      },
      labels: {
        enabled: false,
        rotation: 300,
      },
    },
    plotOptions: {
      column: {
        pointPadding: 0,
        groupPadding: 0,
        shadow: false,
        dataLabels: {
          enabled: true,
          format: '{point.y:.2f} %',
        },
      },
      series: {
        cursor: 'pointer',
        // point: {
        //   events: {
        //     click: function() {
        //       renderTable(
        //         'http://' + window.location.host + '/epad/',
        //         this.name,
        //         this.project,
        //         metric
        //       );
        //     },
        //   },
        // },
      },
    },
    // function renderTable(serverUrl,patId,projectId, report, template){
    yAxis: {
      title: {
        text: 'Best Response',
      },
    },
    series: [
      {
        name: 'Waterfall',
        data: processed_json,
      },
    ],
  });
}

export function createPopup() {
  var waterfallDiv = document.getElementById('waterfallContainer');
  if (waterfallDiv != null) waterfallDiv.remove();

  waterfallDiv = $(document.createElement('div'));
  waterfallDiv.html(
    '<select id="filter"><option>Choose to filter</option><option>RECIST</option><option>ADLA</option><option>intensitystddev</option></select><div id="waterfallContainer" style="width:100%; min-width: 300px;" title="WATERFALL"></div>'
  );
  waterfallDiv.dialog({
    autoOpen: false,
    width: 'auto',
    minWidth: 300,
    maxHeight: 800,
    resizable: true,
  });
  waterfallDiv.dialogExtend({
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
  return waterfallDiv;
}
function formatPopup() {
  $('.ui-dialog-titlebar').css('background', '#4d4d4d');
  $('.ui-dialog-titlebar').css('padding', 0);
  $('.ui-dialog-titlebar').css('text-overflow', 'none');
  $('.ui-dialog-titlebar').css('text-align', 'center');
  $('.ui-dialog-content').css('padding', 0);
  $('.ui-widget-header').css('border', 0);
  $('.ui-widget-header').removeClass('ui-corner-all');
}

function renderWaterfallForWorklist(subj_proj_array, type) {
  var waterfallDiv = createPopup();
  formatPopup();
  waterfallDiv.dialog('open');
  var $filter = waterfallDiv.find('#filter');
  $filter.change(function() {
    getWaterfallForWorklist(subj_proj_array, type, waterfallDiv, $filter.val());
  });
}
function renderWaterfallForProject(subjectUIDs, projectID, type) {
  var waterfallDiv = createPopup();
  formatPopup();
  waterfallDiv.dialog('open');
  var $filter = waterfallDiv.find('#filter');
  $filter.change(function() {
    getWaterfallForProject(
      subjectUIDs,
      projectID,
      type,
      waterfallDiv,
      $filter.val()
    );
  });
}

function renderWaterfallForAllInProject(projectID, type, metric) {
  var waterfallDiv = createPopup();
  formatPopup();

  waterfallDiv.dialog('open');
  var $filter = waterfallDiv.find('#filter');
  $filter.change(function() {
    getWaterfallForAllInProject(projectID, type, waterfallDiv, $filter.val());
  });
}
