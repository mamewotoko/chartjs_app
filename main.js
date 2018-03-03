

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
    }
};
var ctx = $("#canvas")[0].getContext('2d');
var chart = new Chart(ctx, config);

function gpLoop(){
    //コントローラのボタンが押されたかどうかの状態(スナップショット)
    var prev = PREV_GP;
    var gps = navigator.getGamepads() || navigator.webkitGetGamepads() || [];
    if(gps.length == 0){
        window.requestAnimationFrame(gpLoop);
        return;
    }
    var gp = gps[0];
    console.debug(gp);
    if(COLORS == null){
        COLORS = [];
        for(i = 0; i < gp.axes.length; i++){
            COLORS.push(getRandomColor());
            config.data.datasets.push({label: 'axis'+i, borderColor: COLORS[i], data:[]});
        }
    }
    if((prev != null) && (gp.timestamp == prev.timestamp)){
        //console.log("return " + prev + gp);
        //console.log("return "+gp.timestamp +" "+prev.timestamp+" "+(prev.timestamp-gp.timestamp));
        window.requestAnimationFrame(gpLoop);
        return;
    }
    //console.debug(gp);
    config.data.labels.push(gp.timestamp);
    for(i = 0; i < gp.axes.length; i++){
        config.data.datasets[i].data.push(gp.axes[i]);
    }
    chart.update();
    
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


