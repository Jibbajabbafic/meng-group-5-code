// ----- PubNub Stuff -----
var pubnub = new PubNub({
    subscribeKey: "sub-c-1089702c-c016-11e7-97ca-5a9f8a2dd46d",
    publishKey: "pub-c-d0429aa8-023b-4f06-9d6d-fb916ae807f1",
    ssl: true
});

var x = 0;

var testMsg = {
    text: 'test msg number: ' + x
};

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

var updateChart = function(){};

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

    // ----- CanvasJS stuff -----

    // Array to hold our data
    var dataArry = [{x: 0, y:0}];

    // Create a new chart to hold our data
    var chart = new CanvasJS.Chart("chartContainer", {
        title: {
            text: "Example Chart"
        },
        axisX: {
            title: "X axis"
        },
        axisY: {
            title: "Y axis"
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
    //var yVal = 100;
    var updateInterval = 1000;
    
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
    //setInterval(function(){updateChart()}, updateInterval);
});