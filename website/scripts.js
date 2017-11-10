// ----- General Functions -----

var MAX_DATAPOINTS = 20;
var timeVal = 0;

// Array to hold our data
var electricStats = {
    voltageArry: [],
    currentArry: [],
    powerArry: [],
    energyArry: []
};

// var updateChart = function(){};
// var updateStatArry = function(){};
// var renderAllCharts = function(){};
var updateHolders = function(){};

var x = 0;
var startRand = false;
var intervalID;

var testMsg = {
    text: 'test msg number: ' + x
};

// ----- PubNub Stuff -----
var pubnub = new PubNub({
    subscribeKey: "sub-c-1089702c-c016-11e7-97ca-5a9f8a2dd46d",
    publishKey: "pub-c-d0429aa8-023b-4f06-9d6d-fb916ae807f1",
    ssl: true
});

pubnub.addListener({
    message: function(m) {
        console.log(m);
        updateHolders(m.message, electricStats);
    }
});

pubnub.subscribe({
    channels: ['rpi']
});

// ----- jQuery Functions -----
$(document).ready( function() {
    $('#test').on('click', function(){
        x++;
        pubnub.publish(
            {
                message: {
                    text: 'test msg number: ' + x
                },
                channel: 'rpi'
            }, 
            function(status, response) {
                if (status.error) {
                    console.log("publishing failed w/ status: ", status);
                } else {
                    console.log("message published w/ server response: ", response);
                }
            }    
        );                
    });

    $('#toggleRand').on('click', function(){
        if (startRand) {
            clearInterval(intervalID);
            startRand = false;
        }
        else if (!startRand) {
            intervalID = setInterval(function(){updateChart(randGen(100,90));}, updateInterval);
            startRand = true;
        }
    });

    // ----- CanvasJS stuff -----

    // Create a new chart to hold our data
    var chart1 = new CanvasJS.Chart("chartContainer1", {
        title: {
            text: "Power Output"
        },
        axisX: {
            title: "Time (s)"
        },
        axisY: {
            title: "Power (W)"
        },
        data: [{
            type: "line",
            dataPoints: electricStats.powerArry
        }]
    });

    var chart2 = new CanvasJS.Chart("chartContainer2", {
        title: {
            text: "Voltage Output"
        },
        axisX: {
            title: "Time (s)"
        },
        axisY: {
            title: "Voltage (V)"
        },
        data: [{
            type: "line",
            dataPoints: electricStats.voltageArry
        }]
    });

    var chart3 = new CanvasJS.Chart("chartContainer3", {
        title: {
            text: "Current Output"
        },
        axisX: {
            title: "Time (s)"
        },
        axisY: {
            title: "Current (A)"
        },
        data: [{
            type: "line",
            dataPoints: electricStats.currentArry
        }]
    });

    var chart4 = new CanvasJS.Chart("chartContainer4", {
        title: {
            text: "Cumulative Energy"
        },
        axisX: {
            title: "Time (s)"
        },
        axisY: {
            title: "Energy (J)"
        },
        data: [{
            type: "line",
            dataPoints: electricStats.energyArry
        }]
    });

    var renderAllCharts = function() {
        chart1.render();
        chart2.render();
        chart3.render();
        chart4.render();
    }

    function randGen(offset, mult) {
        return Math.random() * mult + offset;
    }

    var updateStatArry = function(statObj, statArry, xVal, yVal) {
        if (isNaN(yVal)) {
            console.log('Error! yVal is not a number!');
            return;
        }
        else {
            statObj[statArry].push({
                x: xVal,
                y: yVal
            });
        }

        if (statObj[statArry].length > MAX_DATAPOINTS) {
            statObj[statArry].shift();
        };
    };

    updateHolders = function(msgObj, statsObj) {
        var power = msgObj.voltage * msgObj.current;

        updateStatArry(statsObj, 'voltageArry', timeVal, msgObj.voltage);
        updateStatArry(statsObj,'currentArry', timeVal, msgObj.current);
        updateStatArry(statsObj,'powerArry', timeVal, power);
        updateStatArry(statsObj,'energyArry', timeVal, power);
    
        timeVal++;
    
        $(voltageHolder).text(msgObj.voltage);
        $(currentHolder).text(msgObj.current);
        $(powerHolder).text(power);
        $(rpm0Holder).text(msgObj.rpm0);
        $(rpm1Holder).text(msgObj.rpm1);
        $(rpm2Holder).text(msgObj.rpm2);
    
        renderAllCharts();
    };
    // updateChart = function(yVal) {
    //     console.log('Updating ' + chart + ' with: ' + yVal)
    //     if (isNaN(yVal)) {
    //         console.log('Error! yVal is not a number!');
    //         return;
    //     }
    //     else {
    //         dataArry.push({
    //             x: xVal,
    //             y: yVal
    //         });

    //         xVal++;
    
    //         // Remove old values
    //         if (dataArry.length > 10) {
    //             dataArry.shift();
    //         }
    
    //         renderAllCharts()
    //     }
    // }

    // Initial render of chart
    renderAllCharts();

    // Code to update chart
    // var xVal = dataArry.length + 1;
    // var updateInterval = 1000;
    
});
