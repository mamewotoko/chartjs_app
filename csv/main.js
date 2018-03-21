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

function init_config(row){
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
    row.shift();
    var v = parseInt(row[0]);
    use_header = isNaN(v);

    console.log(row)
    console.log("row length: %d", row.length)
    console.log("header " + use_header)
    for (var index = 0; index < row.length; index++){
        COLORS.push(getRandomColor());

        var header = null;
        if(use_header){
            header = row[index];
        }
        else {
            header = PREFIX+index;
        }
        config.data.datasets.push({label: header,
                                   borderColor: COLORS[index],
                                   backgroundColor: COLORS[index],
                                   data:[],
                                   fill: false});
    }
    return use_header;
}

function plot_data(){
    var csvtext = $('#csvdata').val();
    //time,
    var lines = csvtext.split('\n');
    var initialized = false;
    
    for (var i = 0; i < lines.length; i++){
        var line = lines[i];
        if(0 < line.length && line.charAt(0) == ';'){
            //handle as comment
            continue;
        }
        var row = line.split(',');
        if(! initialized){
            initialized = true;
            if(init_config(row)){
                continue;
            }
        }
        var row = line.split(',');
        var timestamp = row.shift();
        config.data.labels.push(timestamp);
        //column
        for (var index = 0; index < row.length; index++){
            console.log(line);
            config.data.datasets[index].data.push(parseInt(row[index]));
        }
    }
    chart.update();
}

$(document).ready(function(){
    $('#csvdata').bind('input propertychange', plot_data);
    plot_data();
});
