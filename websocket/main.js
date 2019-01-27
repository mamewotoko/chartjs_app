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
var start_timestamp = 0;
var chart;

function make_row(line){
    var row = line.split(',');
    //
    var start = 0;
    var end = 10;
    row = row.slice(start, Math.min(end, row.length-1));
    return row;
}

function init_config(line){
    //var row = line.split(',');
    var row = make_row(line);
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

function plot_data(lines){
    if(!initialized){
        init_config(lines[0]);
        initialized = true;
    }
    
    for (var i = 0; i < lines.length; i++){
        var line = lines[i];
        if(line.length == 0 || line.charCodeAt(0) == 0){
            //console.log("no timestamp continue");
            continue;
        }

        // var row = line.split(',');
        // //
        // var start = 0;
        // var end = 10;
        // row = row.slice(start, Math.max(end, row.length-1));
        var row = make_row(line);
        var timestamp = parseInt(row[0]);
        if(start_timestamp == 0){
            start_timestamp = timestamp;
        }

        config.data.labels.push(timestamp - start_timestamp);
        //column
        for (var index = 1; index < row.length; index++){
            var colindex = index - 1;
            config.data.datasets[colindex].data.push(parseInt(row[index]));
        }
    }
    //TODO; remove empty row
    //next_row_index = lines.length - 1;
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
    console.log(event);
    var elm = $('#csvdata');
    var csv = elm.val()+event.data;
    elm.val(csv);
    var newcsv = event.data.split("\n");
    plot_data(newcsv);
}

$(document).ready(function(){
    //$('#csvdata').bind('input propertychange', plot_data);
    //plot_data();
    main();
});
