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
var start = 0;
var COLORS = null;
var PREFIX = 'buf';
var USE_DATA_HEADER = false;
var socket = null;
var initialized = false;
var next_row_index = 0;
var last_timestamp = 0;
var chart;

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
        animation: false,
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

function init_plot(){
    window.chart = new Chart(ctx, config);
}

function plot_data(csv){
    var csvtext = csv;
    //time,
    var lines = csvtext.split('\n');
    if(!initialized){
        init_config(lines[0]);
        initialized = true;
    }
    console.log("plot_data: %d %d diff %d\n%s", next_row_index, lines.length, lines.length-next_row_index, csv);
    if(lines.length < next_row_index){
        return;
    }
    
    for (var i = next_row_index; i < lines.length; i++){
        var line = lines[i];
        if(line == ""){
            continue;
        }
        console.log("line: %d %s", i, line);
        var row = line.split(',');
        var timestamp = row[0];
        //TODO; use index
        // if(timestamp <= last_timestamp){
        //     continue;
        // }
        last_timestamp = timestamp;
        config.data.labels.push(timestamp);
        //column
        console.log("row length: %d %s", row.length, line);
        for (var index = 1; index < row.length; index++){
            var colindex = index - 1;
            config.data.datasets[colindex].data.push(parseInt(row[index]));
        }
    }
    //TODO; remove empty row
    next_row_index = lines.length - 1;
    window.chart.update();
}

function main(){
    init_plot();
    
    var uri = "ws://localhost:7681/lws-minimal";
    socket = new WebSocket(uri);
    socket.onopen = onOpen;
    socket.onmessage = onMessage;
    socket.onclose = onClose;
    socket.onerror = onError;
}

function onOpen(event){
    console.log("opened");
}

function onClose(event){
    console.log("closed");
}

function onError(event){
    console.log("error");
}

function onMessage(event){
    console.log("message: ")
    console.log(event);
    var elm = $('#csvdata');
    var csv = elm.val()+event.data;
    elm.val(csv);
    plot_data(csv);
}

$(document).ready(function(){
    //$('#csvdata').bind('input propertychange', plot_data);
    //plot_data();
    main();
});
