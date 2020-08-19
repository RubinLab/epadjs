import Highcharts from 'highcharts';

//rounds the val to 2 digit precision if double
function roundDouble(val) {
  if (!isNaN(val)) return Math.round(val * 100) / 100;
  return val;
}

export function drawWaterfall(data, metric) {
  let i;
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

  Highcharts.chart('waterfallContainer', {
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
