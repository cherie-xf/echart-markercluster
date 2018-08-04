var rootSymbolAdd = "path://M170.666667 170.666667 853.333333 170.666667C876.8 170.666667 896 189.866667 896 213.333333L896 384C896 407.466667 876.8 426.666667 853.333333 426.666667L170.666667 426.666667C147.2 426.666667 128 407.466667 128 384L128 213.333333C128 189.866667 147.2 170.666667 170.666667 170.666667M384 341.333333 426.666667 341.333333 426.666667 256 384 256 384 341.333333M213.333333 256 213.333333 341.333333 298.666667 341.333333 298.666667 256 213.333333 256M341.333333 682.666667 469.333333 682.666667 469.333333 554.666667 554.666667 554.666667 554.666667 682.666667 682.666667 682.666667 682.666667 768 554.666667 768 554.666667 896 469.333333 896 469.333333 768 341.333333 768 341.333333 682.666667Z";
var rootSymbolMinus = "path://M170.666667 170.666667 853.333333 170.666667C876.8 170.666667 896 189.866667 896 213.333333L896 384C896 407.466667 876.8 426.666667 853.333333 426.666667L170.666667 426.666667C147.2 426.666667 128 407.466667 128 384L128 213.333333C128 189.866667 147.2 170.666667 170.666667 170.666667M384 341.333333 426.666667 341.333333 426.666667 256 384 256 384 341.333333M213.333333 256 213.333333 341.333333 298.666667 341.333333 298.666667 256 213.333333 256M341.333333 682.666667 682.666667 682.666667 682.666667 768 341.333333 768 341.333333 682.666667Z";
var deviceSymbol = "path://M896 128H128a42.666667 42.666667 0 0 0-42.666667 42.666667v256a42.666667 42.666667 0 0 0 42.666667 42.666666h768a42.666667 42.666667 0 0 0 42.666667-42.666666V170.666667a42.666667 42.666667 0 0 0-42.666667-42.666667z m-42.666667 256H170.666667V213.333333h682.666666v170.666667z m42.666667 170.666667H128a42.666667 42.666667 0 0 0-42.666667 42.666666v256a42.666667 42.666667 0 0 0 42.666667 42.666667h768a42.666667 42.666667 0 0 0 42.666667-42.666667v-256a42.666667 42.666667 0 0 0-42.666667-42.666666z m-42.666667 256H170.666667v-170.666667h682.666666v170.666667z" + "path://M725.333333 256h85.333334v85.333333h-85.333334z m-128 0h85.333334v85.333333h-85.333334z m128 426.666667h85.333334v85.333333h-85.333334z m-128 0h85.333334v85.333333h-85.333334z"
var districts = {
    "chart1": {
        "lat": 30.683503,
        "lng": 104.106627
    },
    "chart2": {
        "lat": 30.637573,
        "lng": 104.026361
    }
};
var datas1 = [{
    name: 'root',
    symbolSize: 25,
    symbol: rootSymbolMinus,
    type: 'cluster',
    status: 'open',
    itemStyle: { color: 'green' },
    label: {
        show: false,
        position: 'top'
    }
}, {
    name: 'device1',
    symbolSize: 15,
    symbol: deviceSymbol,
    itemStyle: { color: 'orange' },
}, {
    name: 'device2',
    symbolSize: 15,
    symbol: deviceSymbol,
    itemStyle: { color: 'gray' },
}, {
    name: 'device3',
    symbolSize: 15,
    symbol: deviceSymbol,
}];
var datas2 = [{
    name: 'root',
    symbolSize: 25,
    symbol: rootSymbolMinus,
    type: 'cluster',
    status: 'open',
    itemStyle: { color: 'green' },
    label: {
        show: false,
        position: 'top'
    }
}, {
    name: 'device1',
    symbolSize: 15,
    symbol: deviceSymbol,
}, {
    name: 'device2',
    symbolSize: 15,
    symbol: deviceSymbol,
}, {
    name: 'device3',
    symbolSize: 15,
    symbol: deviceSymbol,
    itemStyle: { color: 'gray' },
}, {
    name: 'device4',
    symbolSize: 15,
    symbol: deviceSymbol,
}, {
    name: 'device5',
    symbolSize: 15,
    symbol: deviceSymbol,
    itemStyle: { color: 'orange' },
}, {
    name: 'device6',
    symbolSize: 15,
    symbol: deviceSymbol,
}, {
    name: 'device7',
    symbolSize: 15,
    symbol: deviceSymbol,
}, {
    name: 'device8',
    symbolSize: 15,
    symbol: deviceSymbol,
    itemStyle: { color: 'gray' },
}, {
    name: 'device9',
    symbolSize: 15,
    symbol: deviceSymbol,
    itemStyle: { color: 'orange' },
}, {
    name: 'device10',
    symbolSize: 15,
    symbol: deviceSymbol,
}, {
    name: 'device11',
    symbolSize: 15,
    symbol: deviceSymbol,
    itemStyle: { color: 'orange' },
}, {
    name: 'device12',
    symbolSize: 15,
    symbol: deviceSymbol,
}
];
var datas = {
    'chart1': datas1,
    'chart2': datas2,
};
var rootData1 = [{
    name: 'root',
    symbolSize: 25,
    symbol: rootSymbolAdd,
    type: 'cluster',
    status: 'close',
    itemStyle: { color: 'green' },
    label: {
        show: true,
        position: 'inside',
        offset: [10, -13],
        formatter: datas['chart1'].length - 1 + '',
    }

}];
var rootData2 = [{
    name: 'root',
    symbolSize: 25,
    symbol: rootSymbolAdd,
    type: 'cluster',
    status: 'close',
    itemStyle: { color: 'green' },
    label: {
        show: true,
        position: 'inside',
        offset: [10, -13],
        formatter: datas['chart2'].length - 1 + '',
    }

}];
var rootData={
    'chart1': rootData1,
    'chart2': rootData2,
};
var links1 = datas['chart1'].map((d,i)=>{
    return {
        source: 0,
        target: i,
    };
});
var links2 = datas['chart2'].map((d,i)=>{
    return {
        source: 0,
        target: i,
    };
});
var links = {
    'chart1': links1,
    'chart2': links2,
}

var myChart = echarts.init(document.getElementById('chart'))
var option = {
    bmap: {
        center: [104.072402, 30.663748],
        zoom: 12,
        roam: true,
        enableMapClick: false,
        mapStyle: {
            styleJson: [{
                "featureType": "all",
                "elementType": "all",
                "stylers": {
                    "lightness": 61,
                    "saturation": -70
                }

            }, {
                "featureType": "poi",
                "elementType": "all",
                "stylers": {
                    "visibility": "off"
                }
            }]
        }
    },
    legend: {
        show: false,
        orient: 'vertical',
        right: 20,
        top: 15,
        padding: 10,
        backgroundColor: "rgba(255,255,255,0.8)",
        data: []
    },

};

myChart.setOption(option);
setTimeout(init, 0);


function init() {
    initMap();
    initPieDistrict(myChart, getMap());
}

function initMap() {
    var top_left_navigation = new BMap.NavigationControl({
        //type: BMAP_NAVIGATION_CONTROL_SMALL
    });
    var map = getMap();
    map.addControl(top_left_navigation);
    map.disableDoubleClickZoom();
    map.removeEventListener("click");
    return map;
}


function getMap() {
    return myChart.getModel().getComponent('bmap').getBMap();
}

var districtPoint = districts;
var districtChart = {};

var initPieDistrict = function (chart, map) {
    parentChart = chart;
    var count = 0;
    for (var prop in districtPoint) {
        var position = districtPoint[prop];
        var id = prop;
        districtChart[prop] = initPieMarker(map, id, position);
    }
}

function initPieMarker(map, id, position) {
    var htm = '<div id="' + id + '" style="width:40px;height:40px;" class="mask graph-chart"></div>';
    var point = new BMap.Point(position.lng, position.lat);
    var myRichMarkerObject = new BMapLib.RichMarker(htm, point, {
        "anchor": new BMap.Size(-20, -20),
        barkground: "transparent"
    });
    map.addOverlay(myRichMarkerObject);
    document.getElementById(id).parentNode.style.backgroundColor = "transparent";
    document.getElementById(id).parentNode.style.zIndex = "1";
    $('.mask').forwardevents();
    var myChart = echarts.init(document.getElementById(id), "macarons");
    var option = {
        tooltip: {
            trigger: 'item',
            //formatter: "{a} <br/>{b}: {c} ({d}%)"
            formatter: "{b}"
        },
        series: [{
            name: id,
            type: 'graph',
            layout: 'force',
            focusNodeAdjacency: true,
            roam: false,
            draggable: false,
            force: {
                gravity: 1,   // the larger the center     
                repulsion: 350,
                layoutAnimation: false
            },
            lineStyle: {
                normal: {
                    opacity: 0.9,
                    width: 1,
                },
                emphasis: {
                    color: '#ec407a'
                }
            },
            data: rootData[id],
            links:links[id],
        }]


    }
    myChart.setOption(option);
    myChart.on("click", function (data, o, d) {
        console.log(data, o, d);
        if (data.data.type == 'cluster') {

            var o = myChart.getOption();
            if (data.data.status == 'close') {
                o.series[0].data = datas[data.seriesName];
                document.getElementById(data.seriesName).style.width = "150px";
                document.getElementById(data.seriesName).style.height = "150px";
                myRichMarkerObject.setAnchor(new BMap.Size(-75, -75));//设置Marker的偏移量
            } else {
                o.series[0].data = rootData[data.seriesName];
                document.getElementById(data.seriesName).style.width = "40px";
                document.getElementById(data.seriesName).style.height = "40px";
                myRichMarkerObject.setAnchor(new BMap.Size(-20, -20));//设置Marker的偏移量
            }

            myChart.clear();
            myChart.resize();
            myChart.setOption(o);
        }
    })
    return myChart;
}