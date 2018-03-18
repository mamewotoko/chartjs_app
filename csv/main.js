function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var COLORS = null;
var config = {};

var ctx = $("#canvas")[0].getContext('2d');
var chart = new Chart(ctx, config);
var start = 0;
var COLORS = null;
var PREFIX = 'buf';
var USE_DATA_HEADER = false;

function init_config(line){
    var row = line.split(',');
    COLORS = [];
    //column
    config.type = 'line';
    config.data = {
        labels: [],
        datasets: []
    };
    config.options = {
        scales: {
            yAxes:[
                {
                    ticks:{
                        beginAtZero: true,
                        min: -1,
                        max: 1,
                    }
                }
            ]
        }
    };
    try {
        parseInt(row[0]);
        USE_DATA_HEADER = false;
    }
    catch(e){
        USE_DATA_HEADER = true;
    }
    for (var index = 1; index < row.length; index++){
        var rowindex = index - 1;
        COLORS.push(getRandomColor());

        var header = null;
        if(USE_DATA_HEADER){
            header = row[index];
        }
        else {
            header = PREFIX+rowindex;
        }
        config.data.datasets.push({label: header,
                                   borderColor: COLORS[rowindex],
                                   backgroundColor: COLORS[rowindex],
                                   data:[],
                                   fill: false});
    }
}

function plot_data(){
    var csvtext = $('#csvdata').val();
    //time,
    var lines = csvtext.split('\n');
    init_config(lines[0]);
    
    for (var i = 0; i < lines.length; i++){
        line = lines[i];
        var row = line.split(',');
        var timestamp = row[0];
        config.data.labels.push(timestamp);
        //column
        for (var index = 1; index < row.length; index++){
            var rowindex = index - 1;
            config.data.datasets[rowindex].data.push(row[index]);
        }
    }
    chart.update();
}

$(document).ready(function(){
    $('#csvdata').bind('input propertychange', plot_data);
    plot_data();
});
