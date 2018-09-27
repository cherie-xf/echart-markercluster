function initMap() {
    var nightStyle = null;
    var markerImg = {
        url: 'images/marker5.png',
        scaledSize: new google.maps.Size(30, 30),
    };

    // var features = data.map(d => {
    //     return Object.assign({ position: new google.maps.LatLng(d.lat, d.lng) }, d);
    // })
    var devData = [];
    Object.keys(devices).map(function(key){
        devData.push(Object.assign({ name: key }, devices[key]));
    });
    /*
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        // center: features[0].position,
        center:  new google.maps.LatLng(data[0].lat, data[0].lng),
        styles: nightStyle,
    });
    var graphCluster = new GraphCluster(map, data, {
        size: {
            min: 30, //scatter symbol minimum size
            max: 60, //scatter symbol maximum size
        },
        clickControl: true,
        typeControl: true,
        markerImg: markerImg,
        chartSettings:{
            scatter: {
                color: '#e01f54',
            },
            spider:{
                group:{
                    key: 'property_type',
                    colorMap:{
                        'house': '#c1232b',
                        'townhouse': '#27727b',
                        'apartment_condo': '#e87c25',
                        'duplex': '#fcce10',
                        'multifamily': '#b5c334',
                        'mfd_mobile_home': '#60c0dd',
                        'other': '#b8d2c7',
                    },
                },
            },
            pie:{
                group:{
                    key: 'property_type',
                    colorMap:{
                        'house': '#c1232b',
                        'townhouse': '#27727b',
                        'apartment_condo': '#e87c25',
                        'duplex': '#fcce10',
                        'multifamily': '#b5c334',
                        'mfd_mobile_home': '#60c0dd',
                        'other': '#b8d2c7',
                    },
                },

            },

        }
    });
    */
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 4,
        center:  new google.maps.LatLng(devData[0].lat, devData[0].lng),
        styles: nightStyle,
    });
    var graphCluster = new GraphCluster(map, devData, {
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
                        '0': '#c1232b',
                        '1': '#27727b',
                    },
                },
            },
            pie:{
                group:{
                    key: 'conn_status',
                    colorMap:{
                        '0': '#c1232b',
                        '1': '#27727b',
                    },
                },

            },

        }
    });

}