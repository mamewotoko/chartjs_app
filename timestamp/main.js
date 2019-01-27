function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var config = {};

var ctx = $("#canvas")[0].getContext('2d');
var chart = new Chart(ctx, config);
var start = 0;
var PREFIX = 'buf';
var USE_DATA_HEADER = false;

function init_config(){
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
                        min: 0,
                        max: 1,
                    }
                }
            ]
        }
    };
    //COLORS.push(getRandomColor());
    var color = getRandomColor();
    
    var header = "elapsed sec";
    config.data.datasets.push({label: header,
                               borderColor: color,
                               backgroundColor: color,
                               data:[],
                               fill: false});
}

function parse_line(line){
    //var re = new RegExp('^(\d{2}):(\d{2}):(\d{2}) (.*)$');
    var re = new RegExp('^(([0-9]{4})/([0-9]{2})/([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2})) (.*)$');
    var m = re.exec(line);
    return m;
}

function plot_data(){
    var csvtext = $('#csvdata').val();
    //time,
    var lines = csvtext.split('\n');
    var initialized = false;
    var prev = 0;
    
    init_config(row);

    for (var i = 0; i < lines.length; i++){
        var line = lines[i];
        if(0 < line.length && line.charAt(0) == ';'){
            //handle as comment
            continue;
        }
        var row = parse_line(line);
        if(row == null){
            continue;
        }
        //var sec_in_day = parseInt(row[2])*60*60 + parseInt(row[3])*60 + parseInt(row[4]);
        var epoch = new Date(row[1]);
        console.log(epoch.toString());
        var data = 0;
        if(prev > 0){
            data = epoch - prev;
        }
        prev = epoch;
        var timestamp = row[1];
        config.data.labels.push(timestamp);
        //column
        console.log(line);
        config.data.datasets[0].data.push(data);
    }
    chart.update();
}

$(document).ready(function(){
    $('#csvdata').bind('input propertychange', plot_data);
    plot_data();
});
