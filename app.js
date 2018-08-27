function initMap() {
    var nightStyle = null;
    var markerImg = {
        url: 'images/marker6.png',
        scaledSize: new google.maps.Size(40, 40),
    };

    // var features = data.map(d => {
    //     return Object.assign({ position: new google.maps.LatLng(d.lat, d.lng) }, d);
    // })
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
        markerImg: markerImg,
        chartSettings:{
            scatter: {
                color: '#e01f54',
            },
            spider:{
                group:{
                    key: 'property_type',
                    colorMap:{
                        'house': '#9b8bba',
                        'townhouse': '#e098c7',
                        'apartment_condo': '#d3758f',
                        'duplex': '#e01f54',
                        'multifamily': '#001852',
                        'mfd_mobile_home': '#f5e8c8',
                        'other': '#b8d2c7',
                    },
                },
            },
            pie:{
                group:{
                    key: 'property_type',
                    colorMap:{
                        'house': '#9b8bba',
                        'townhouse': '#e098c7',
                        'apartment_condo': '#d3758f',
                        'duplex': '#e01f54',
                        'multifamily': '#001852',
                        'mfd_mobile_home': '#f5e8c8',
                        'other': '#b8d2c7',
                    },
                },

            },

        }
    });

}