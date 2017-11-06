// ----- General Functions -----
var updateChart = function(){};

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
        var msg = m.message;
        if ('text' in msg) {
            var textString = String(msg.text);
            $('#returnMsg').text(textString);
        }
        if ('data' in msg) {
            if (msg.data != "") {
                var dataDigit = Number(msg.data);
                $('#returnData').text(dataDigit);
                updateChart(dataDigit);
            }
        }
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

    // Array to hold our data
    var dataArry = [];

    // Create a new chart to hold our data
    var chart = new CanvasJS.Chart("chartContainer", {
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
            dataPoints: dataArry
        }]
    });

    // Initial render of chart
    chart.render();

    // Code to update chart
    var xVal = dataArry.length + 1;
    var updateInterval = 1000;
    
    function randGen(offset, mult) {
        return Math.random() * mult + offset;
    }

    updateChart = function(yVal) {
        console.log('Received yVal = ' + yVal)
        if (isNaN(yVal)) {
            console.log('Error! yVal is not a number!');
            return;
        }
        else {
            dataArry.push({
                x: xVal,
                y: yVal
            });
    
            xVal++;
    
            // Remove old values
            if (dataArry.length > 10) {
                dataArry.shift();
            }
    
            chart.render();
        }
    }
});
