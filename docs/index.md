<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>DVM Google map eChart</title>
    <link rel="stylesheet" href="app.css">
</head>

<body>
    <!--
    <div id="map-canvas"></div>
    <div class="google-maps" >
        <iframe name="map_iframe" 
            id="gmap_top_threat_dest---1532995751642" 
            src="https://mapserver.fortinet.com/server/hEJlrDCsdrXFh4nujr9pSRXtzvM4s3Sz5Cg0ExwmLFacm00TVQrrkxPbrpttXeTGTSMNLzdM4qvK2KTq4eIWLaCIxXLB8eDD3nzGOjnEJcQTsgNBZPNQi4NNwOt+ieSfSYPvMLOBF0-qm6QfkpcbfQ==/html/noc/index.html" class="fi-iframe fap-iframe">
        </iframe>
        <iframe 
            id="map_iframe" name="map_iframe" class="fi-iframe fap-iframe" 
            src="https://mapserver.fortinet.com/server/QBFKY3hmNhfQ-2woqZ-A07Cpjnvq1HGMWiw1xwYllbL3bRgXuwMXQMVkPTARy2mHvhuBObSRY2fT1zJUkH-3YzdXDPd4Wx46a6mLEMnmV+9+2Im335cDtcQT-D5H2MmG2RJ0zMUOtwfTzrXtryHM1A==/html/dvmlist/index.html">
        </iframe>
        <div class="fix-gridster-over-iframe"></div>
    </div>

    <div id="chart"></div>
    -->
    <div class="container">
        <div id="map-canvas"> </div>
        <div id="mask">
            <div class="marker"></div>
        </div>
    </div>

    <!-- <script src="https://maps.googleapis.com/maps/api/js?v=3.exp"></script> -->
    <script src="https://maps.googleapis.com/maps/api/js?v=3.31" async defer></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.js"></script>
    <script src="events.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/4.1.0/echarts.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/echarts/4.1.0/extension/bmap.js"></script>
    <script src="https://api.map.baidu.com/api?v=2.0&ak=aZKa0p9qYqkIUUALVU6CWGP5ZSxp"></script>
    <script src="https://api.map.baidu.com/library/RichMarker/1.2/src/RichMarker_min.js"></script>
    <script src="map.js"></script>
    <!--
    <script src="app.js"></script>
-->
</body>

</html>