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
var WINDOW_LEN = 300;
var socket = null;
var initialized = false;
var start_timestamp = 0;


function parseLine(line){
    var row = line.split(',');
    if(row[row.length-1] == ""){
        row.pop();
    }
    return row;
}


function init_config(line){
    var row = parseLine(line);
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
                                   hidden: true,
                                   fill: false});
    }
    var headers = ['roll', 'pitch', 'yaw', 'view'];
    var target_header = ['pitch', 'hi', 'lo'];
    for (var index = 0; index < headers.length; index++){
        COLORS.push(getRandomColor());
        var header = headers[index];
        config.data.datasets.push({label: header,
                                   borderColor: COLORS[COLORS.length-1],
                                   backgroundColor: COLORS[COLORS.length-1],
                                   data:[],
                                   hidden: target_header.indexOf(header) < 0,
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
        console.log("line: " + line);
        var row = parseLine(line);
        row = row.map(function(x){ return parseInt(x); });
        var timestamp = parseInt(row.shift());
        if(start_timestamp == 0){
            start_timestamp = timestamp;
        }
        var roll = ((row[1] & 0x03) << 8) + (row[0] & 0xFF);
        var pitch = ((row[2] & 0x0f) << 6) | (((row[1] & 0xfc) >> 2) & 0x3F);
        
        // var hi =  row[2] & 0x0f;
        // var lo =  (row[1] & 0xfc) >> 2;
        // var spitch = Number(pitch).toString(16);
        //console.log("spitch %s | %s %s", spitch,  hi.toString(16), lo.toString(16));

        //ひねり
        var yaw = row[3];
        var view = (row[2] & 0xf0) >> 4;

        row = row.concat([roll, pitch, yaw, view]);
        config.data.labels.push(timestamp - start_timestamp);
        //column
        for (var index = 0; index < row.length; index++){
            config.data.datasets[index].data.push(parseInt(row[index]));
            var dt = config.data.datasets[index].data;
            if(WINDOW_LEN < dt.length){
                config.data.datasets[index].data.unshift();
            }
        }
        row.unshift(timestamp);
        var elm = $('#csvdata');
        //console.log("row[1]" + row[1]);
        var csvline = row.map(function(x){return x.toString();}).join(",")+"\n";
        //console.log(csvline);
        var csv = elm.val() + csvline;
        elm.val(csv);
        $(elm).scrollTop($(elm)[0].scrollHeight);
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
    //console.log(event);
    //var elm = $('#csvdata');
    //var csv = elm.val()+event.data;
    //elm.val(csv);
    var newcsv = event.data.split("\n");
    plot_data(newcsv);
}

$(document).ready(function(){
    main();
});
