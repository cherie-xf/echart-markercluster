define([
  'jquery',
  'util',
  'gmapcluster'
], function($, Util, gmapcluster) {
  const COLOR_MAPPING = {
    classToHex: { 'color-green': '#83BB21', 'color-orange': '#e87c25', 'color-red': '#c1232b', 'color-model-device' : '#95a5a6' },
    hexToClass: { '#83BB21': 'color-green', '#FF9C43': 'color-orange', '#FF0000': 'color-red', '#95a5a6': 'color-model-device' }
  };
  var _fiDvmMap; // the instance of class FIGoogleMap
  var markerImg = {
    url: '../../image/dvm-marker.png',
    scaledSize: new google.maps.Size(28, 28),
   };
  //send initial request to get the data
  $(document).ready(function () {
    Promise.all([Util.PRService.callFn('init', { name: 'init' }), Util.PRService.callFn('getFmgLocation', {})])
      .then(function (values) {
        _fiDvmMap = initDevMap(values[0].data, values[1].data);
      });
  });

  var initDevMap = function (devLocation, fortiManagerLocation) {
    let devData = [];
    Object.keys(devLocation).map(function(key){
        devData.push(Object.assign({ name: key }, devLocation[key]));
    });
    var map = new google.maps.Map(document.getElementById('map-canvas'), $.extend(Util.GoogleMap.getSharedMapOpts(), {
      zoom: 3, // init
      center: { lat: 0, lng: 180 },
      minZoom: 3, //have to set this to prevent fi-scroll's effect from table view
      //maxZoom: 20,
    }));
    var graphCluster = new gmapcluster.GraphCluster(map, devData, {
        size: {
            min: 30, //scatter symbol minimum size
            max: 60, //scatter symbol maximum size
        },
        //clickControl: true,
        //typeControl: true,
        markerImg: markerImg,
        chartSettings:{
            scatter: {
                color: '#e01f54',
            },
            spider:{
                group:{
                    key: 'conn_status',
                    colorMap:{
                        '0': COLOR_MAPPING.classToHex['color-red'],
                        '1': COLOR_MAPPING.classToHex['color-orange'],
                    },
                },
            },
            pie:{
                group:{
                    key: 'conn_status',
                    colorMap:{
                        '0': COLOR_MAPPING.classToHex['color-red'],
                        '1': COLOR_MAPPING.classToHex['color-orange'],
                    },
                },

            },

        }
    });
    return graphCluster;


    //return new FIGoogleMap(devLocation, fortiManagerLocation);
  }
});
