
    function latLng2Point(latLng, map) {
        var bounds = map.getBounds();
        var topRight = map.getProjection().fromLatLngToPoint(map.getBounds().getNorthEast());
        var bottomLeft = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthWest());
        // var changed = map.getProjection().fromLatLngToPoint(map.getBounds().getSouthEast());
        var scale = Math.pow(2, map.getZoom());
        var worldPoint = map.getProjection().fromLatLngToPoint(latLng);
        console.log('worldPoint', worldPoint, 'scale', scale, 'bottomLeft', bottomLeft, 'topRight', topRight, 'bounds', bounds);
        var convertLeftX = bottomLeft.x; 
        if(convertLeftX > 256/2){
            convertLeftX = bottomLeft.x - 256
        } 
        var pointX = (worldPoint.x - convertLeftX) * scale;
        if(scale <= 4){
            pointX = (256 - worldPoint.x) * scale
        }
        var pointY = (worldPoint.y - topRight.y) * scale;
        return new google.maps.Point(pointX, pointY);
    }

    function handleEvent(map) {
        console.log('drag', map)
        // document.getElementById('lat').value = event.latLng.lat();
        // document.getElementById('lng').value = event.latLng.lng();
    }

$(document).ready(function () {
    var point = {
        la: 49.2521911,
        long: -122.89423449999998,
    }
    var markers = [];
    var location = new google.maps.LatLng(point.la, point.long);
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
      zoom: 4,
      center: location 
    });

    var marker = new google.maps.Marker({
          position:  location,
          label: 'test',
          map: map
    });
    // var nemarker = new google.maps.Marker({
    //       position:  map.getBounds().getNorthEast(),
    //       label: 'ne',
    //       map: map
    // });
    // var swmarker = new google.maps.Marker({
    //       position:  map.getBounds().getSouthWest(),
    //       label: 'sw',
    //       map: map
    // });

    map.addListener('center_changed', function() {
        // 3 seconds after the center of the map has changed, pan back to the
        // marker.
        window.setTimeout(function() {
        //   map.panTo(marker.getPosition());

            var point = latLng2Point(location, map);
        console.log( 'get point', point )
            $('.marker').css('top', point.y)
            $('.marker').css('left', point.x)
        }, 500);

      });

    map.addListener('zoom_changed', function() {
        // 3 seconds after the center of the map has changed, pan back to the
        // marker.
        window.setTimeout(function() {
        //   map.panTo(marker.getPosition());

            var point = latLng2Point(location, map);
        console.log( 'get point', point )
            $('.marker').css('top', point.y)
            $('.marker').css('left', point.x)
        }, 500);

      });

    // map.addListener('dragend', handleEvent);
    // $('#mask').forwardevents({directEventsTo:$('#map-canvas')} );

    setTimeout(function(){
        var point = latLng2Point(location, map);
        console.log( 'get point', point )
        $('.marker').css('top', point.y)
        $('.marker').css('left', point.x)

        if(markers.length){
            map.removeMarker(map.markers[0]);
            map.removeMarker(map.markers[1]);
        }
        var nemarker = new google.maps.Marker({
            position:  map.getBounds().getNorthEast(),
            label: 'ne',
            map: map
        });
        var swmarker = new google.maps.Marker({
            position:  map.getBounds().getSouthWest(),
            label: 'sw',
            map: map
        });
        markers.push(nemarker);
    }, 500)
    
  });
