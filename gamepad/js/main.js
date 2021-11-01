//ゲームコントローラ

var GP0 = 0;
var GP1 = 1;
var PREV_GP = null;
var START = 0;

var count = 0;
function getGPButton(gp, PREV_GP){
    if(gp.buttons[GP0].pressed){
        return '▶'
    }
    if(gp.buttons[GP1].pressed){
        return '一時停止'
    }
    return null;
}


function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

var COLORS = null;
var config = {
    type: 'line',
    data:{
        labels: [],
        datasets: [
        ]
    },
    options: {
        scales: {
            y:[
                {
                    ticks:{
                        beginAtZero: true,
                        min: -1,
                        max: 1,
                    }
                }
            ]
        }
    }
};
var COLORS2 = null;
var config2 = {
    type: 'line',
    data:{
        labels: [],
        datasets: [
        ]
    },
    options: {
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
    }
};
var ctx = $("#canvas")[0].getContext('2d');
var chart = new Chart(ctx, config);
var ctx2 = $("#button_canvas")[0].getContext('2d');
var chart2 = new Chart(ctx2, config2);
var start = 0;

function gpLoop(){
    //コントローラのボタンが押されたかどうかの状態(スナップショット)
    var prev = PREV_GP;
    var gps = navigator.getGamepads() || navigator.webkitGetGamepads() || [];
    if(gps.length == 0){
        window.requestAnimationFrame(gpLoop);
        return;
    }
    var gp = gps[0];
    if(COLORS == null){
        COLORS = [];
        for(i = 0; i < gp.axes.length; i++){
            COLORS.push(getRandomColor());
            config.data.datasets.push({label: 'axis'+i, borderColor: COLORS[i], data:[]});
        }
        COLORS2 = [];
        for(i = 0; i < gp.buttons.length; i++){
            COLORS2.push(getRandomColor());
            config2.data.datasets.push({label: 'button'+i, borderColor: COLORS2[i], data:[]});
        }
        start = gp.timestamp;
        console.log(start);
        console.log(gp);
    }
    if((prev != null) && (gp.timestamp == prev.timestamp)){
        window.requestAnimationFrame(gpLoop);
        return;
    }
    //msec
    var elapsed_time = (gp.timestamp - start)/1000;
    //console.log(start);
    config.data.labels.push(elapsed_time);
    for(i = 0; i < gp.axes.length; i++){
        config.data.datasets[i].data.push(gp.axes[i]);
    }
    chart.update();

    config2.data.labels.push(elapsed_time);
    for(i = 0; i < gp.buttons.length; i++){
        var v = 0;
        if(gp.buttons[i].pressed){
            v = 1;
        }
        config2.data.datasets[i].data.push(v);
    }
    chart2.update();
    // var button = getGPButton(gp, prev);
    // if(button != null){
    //     console.log(button);
    //     pushButton(button);
    // }
    PREV_GP = $.extend({}, gp);
    window.requestAnimationFrame(gpLoop);
}

//window.requestAnimationFrame(gpLoop);
window.addEventListener('gamepadconnected', function(e){ window.requestAnimationFrame(gpLoop); });
