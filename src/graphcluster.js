/*
 * Created Date: Monday, August 20th 2018, 00:15:02 am
 * Author: cheriefu
 * 
 * Copyright (c) 2018 Cherie Fu
 */
function GraphCluster(map, opt_markers, opt_options) {
    this.extend(GraphCluster, google.maps.OverlayView);
    // Initialize all properties.
    this.map_ = map;
    this.markers_ = [];
    this.clusters_ = [];
    this.ready_ = false;
    var opts_ = opt_options || {};
    this.gridSize_ = opts_.gridSize || 60;
    this.size_ = opts_.size;
    this.prevZoom_ = this.map_.getZoom();
    this.totalNum_ = opt_markers ? opt_markers.length : 0;
    // Explicitly call setMap on this overlay.
    this.setMap(map);
    var that = this;
    if (opts_.clickControl) {
        this.clickControl_ = new ClickControl(this.map_);
    }
    this.tooltip_ = new MarkerTooltip(this);

    // Add map event listerners
    google.maps.event.addListener(this.map_, 'zoom_changed', function () {
        var zoom = that.map_.getZoom();
        if (that.prevZoom_ !== zoom) {
            that.prevZoom_ = zoom;
            that.resetViewport();
        }
    })

    // both zoom and pan will trigger redraw
    google.maps.event.addListener(this.map_, 'idle', function () {
        that.createClusters();
    })
    // init cluster
    if (opt_markers && opt_markers.length > 0) {
        this.initMarkers(opt_markers);
    }
    this.createClusters();
}
/**
 * Extends a objects prototype by anothers.
 *
 * @param {Object} obj1 The object to be extended.
 * @param {Object} obj2 The object to extend with.
 * @return {Object} The new extended object.
 * @ignore
 */
GraphCluster.prototype.extend = function (obj1, obj2) {
    return (function (object) {
        for (var property in object.prototype) {
            this.prototype[property] = object.prototype[property];
        }
        return this;
    }).apply(obj1, [obj2]);
};

/**
 * onAdd is called when the map's panes are ready and the overlay has been
 * added to the map.
 * API Method
 */
GraphCluster.prototype.onAdd = function () {
    this.ready_ = true; // set the status overlay is added to map

};
/**
 * draw is called after onAdd
 * API Method
 */
GraphCluster.prototype.draw = function () {
};
/**
 * onRemove is automatically called from the API 
 * whenever overlay's map property set to null
 * API Method
 */
GraphCluster.prototype.onRemove = function () {
    //need to remove marker tooltip
    console.log('call on remove, remove tooltip');
    this.tooltip_.setMap(null);
};
// private method
GraphCluster.prototype.initMarkers = function (markers) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, m; m = markers[i]; i++) {
        bounds.extend(m.getPosition());
        this.markers_.push(m);
    }
    this.map_.fitBounds(bounds);
};
// private method
GraphCluster.prototype.createClusters = function () {
    console.log('zoom', this.prevZoom_);
    if (!this.ready_) {
        return;
    }
    var bounds = new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),
        this.map_.getBounds().getNorthEast());
    console.log('bounds', bounds);
    for (var i = 0, m; m = this.markers_[i]; i++) {
        if (!m.isAdded && bounds.contains(m.getPosition())) {
            this.addToClosestCluster_(m);
        }
    }
    this.cleanCluster_();
    this.addTooltipEventToMarkers();
};
// private remove marker number less than 2
GraphCluster.prototype.cleanCluster_ = function () {
    for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
        if (cluster.markers_.length < 2) {
            cluster.remove();
            cluster = null;
            this.clusters_.splice(i, 1);
        }

    }
};

// private method
GraphCluster.prototype.addToClosestCluster_ = function (marker) {
    var distance = 40000; // Some large number
    var closestCluster = null;
    for (var i = 0, c; c = this.clusters_[i]; i++) {
        var center = c.getCenter();
        if (center) {
            var d = this.distanceBetweenPoints_(center, marker.getPosition());
            if (d < distance) {
                distance = d;
                closestCluster = c; // get the distance smalleset one
            }
        }
    };

    if (closestCluster && closestCluster.isMarkerInClusterBounds(marker)) {
        closestCluster.addMarker(marker);
    } else {
        var cluster = new Cluster(this);
        cluster.setId('cluster_' + this.clusters_.length);
        cluster.addMarker(marker);
        this.clusters_.push(cluster);
    }
};
/**
 * Clears all existing clusters and recreates them.
 * @param {boolean} opt_hide To also hide the marker.
 */
GraphCluster.prototype.resetViewport = function (opt_hide) {
    // Remove all the clusters
    for (var i = 0, cluster; cluster = this.clusters_[i]; i++) {
        cluster.remove();
    }
    // Reset the markers to not be added and to be invisible.
    for (var i = 0, marker; marker = this.markers_[i]; i++) {
        marker.isAdded = false;
        if (opt_hide) {
            marker.setMap(null);
        }
    }
    this.clusters_ = [];
};

/**
 * ### core method
 * Calculates the distance between two latlng locations in km.
 * @param {google.maps.LatLng} p1 The first lat lng point.
 * @param {google.maps.LatLng} p2 The second lat lng point.
 * @return {number} The distance between the two points in km.
 * @private
*/
GraphCluster.prototype.distanceBetweenPoints_ = function (p1, p2) {
    if (!p1 || !p2) {
        return 0;
    }

    var R = 6371; // Radius of the Earth in km
    var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
    var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
};
/**
 * ### core method
 * @param {google.maps.LatLngBounds} bounds The bounds to extend.
 * @return {google.maps.LatLngBounds} The extended bounds.
 * here only use in Cluster for calculate bounds base on gride size
 */
GraphCluster.prototype.getExtendedBounds = function (bounds) {
    var projection = this.getProjection();

    // Turn the bounds into latlng.
    var tr = new google.maps.LatLng(bounds.getNorthEast().lat(),
        bounds.getNorthEast().lng());
    var bl = new google.maps.LatLng(bounds.getSouthWest().lat(),
        bounds.getSouthWest().lng());

    // Convert the points to pixels and the extend out by the grid size.
    var trPix = projection.fromLatLngToDivPixel(tr);
    trPix.x += this.gridSize_;
    trPix.y -= this.gridSize_;

    var blPix = projection.fromLatLngToDivPixel(bl);
    blPix.x -= this.gridSize_;
    blPix.y += this.gridSize_;

    // Convert the pixel points back to LatLng
    var ne = projection.fromDivPixelToLatLng(trPix);
    var sw = projection.fromDivPixelToLatLng(blPix);

    // Extend the bounds to contain the new bounds.
    bounds.extend(ne);
    bounds.extend(sw);

    return bounds;
};

GraphCluster.prototype.isZoomOnClick = function () {
    return this.clickControl_ && this.clickControl_.getZoomin();
}
GraphCluster.prototype.getTooltip = function () {
    return this.tooltip_;
}
GraphCluster.prototype.addTooltipEventToMarkers = function () {
    var that = this;
    for (var i = 0, m; m = this.markers_[i]; i++) {
        if (m.map) {
            m.addListener('mouseover', function (event) {
                if (event) {
                    that.getTooltip().show(event.latLng);
                }
            });
            m.addListener('mouseout', function (event) {
                if (that.getTooltip().getVisible()) {
                    that.getTooltip().hide();
                }
            });
        }
    }
}

/**
 * @param {GraphCluster} graphCluster 
 */
function Cluster(graphCluster) {
    this.graphCluster_ = graphCluster;
    this.map_ = this.graphCluster_.map_;
    this.gridSize_ = this.graphCluster_.gridSize_;
    this.size_ = this.graphCluster_.size_;
    this.totalNum_ = this.graphCluster_.totalNum_;
    this.center_ = null;
    this.markers_ = [];
    this.bounds_ = null;
    this.graph_ = new Graph(this);
    this.id_ = '';
}
Cluster.prototype.getBounds = function () {
    var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
    var markers = this.markers_;
    for (var i = 0, marker; marker = markers[i]; i++) {
        bounds.extend(marker.getPosition());
    }
    return bounds;
};
Cluster.prototype.calculateBounds_ = function () {
    var bounds = new google.maps.LatLngBounds(this.center_, this.center_);
    this.bounds_ = this.graphCluster_.getExtendedBounds(bounds);
};
Cluster.prototype.isMarkerInClusterBounds = function (marker) {
    return this.bounds_.contains(marker.getPosition());
};
/**
 * Add a marker the cluster.
 *
 * @param {google.maps.Marker} marker The marker to add.
 * @return {boolean} True if the marker was added.
 */
Cluster.prototype.addMarker = function (marker) {
    if (!this.center_) {
        // center will be the first marker position 
        // bounds will be the first marker position be center expand grid size
        this.center_ = marker.getPosition();
        this.calculateBounds_();
    }
    marker.isAdded = true;
    this.markers_.push(marker);

    var len = this.markers_.length;
    if (len < 2 && marker.getMap() != this.map_) {
        // Min cluster size not reached so show the marker.
        marker.setMap(this.map_);
    }
    if (len === 2) {
        // Hide the markers that were showing.
        for (var i = 0; i < len; i++) {
            this.markers_[i].setMap(null);
        }
        this.graph_.setCenter(this.center_);
        this.graph_.setSum(this.markers_.length)
        this.graph_.show();
    }
    if (len > 2) {
        marker.setMap(null);
        this.graph_.setSum(this.markers_.length)
        // this.graph_.update();
    }
    return true;
};
Cluster.prototype.getCenter = function () {
    return this.center_;
};
Cluster.prototype.getMap = function () {
    return this.map_;
};
Cluster.prototype.getGraphCluster = function () {
    return this.graphCluster_;
};
Cluster.prototype.setId = function (id) {
    this.id_ = id
};
Cluster.prototype.getId = function () {
    return this.id_
};
/**
 * Removes the cluster
 */
Cluster.prototype.remove = function () {
    this.graph_.remove();
    this.markers_.length = 0;
    delete this.markers_;
};
/**
 * a "scatter" type of echart as Cluster Icon
 */
function Graph(cluster) {
    cluster.getGraphCluster().extend(Graph, google.maps.OverlayView);
    this.cluster_ = cluster;
    this.center_ = null;
    this.div_ = null;
    this.visible_ = null;
    this.map_ = cluster.getMap();
    this.sums_ = '';
    this.size_ = cluster.size_ ? cluster.size_ : { max: 40, min: 30 };
    this.totalNum_ = cluster.totalNum_;
    this.width_ = this.size_.max + 10;
    this.height_ = this.size_.max + 10;
    this.expand_ = false;
    this.setMap(this.map_);
    this.chart_ = null;
}
Graph.prototype.setCenter = function (center) {
    this.center_ = center;
};
Graph.prototype.setSum = function (sum) {
    this.sums_ = sum;
};
Graph.prototype.onAdd = function () {
    this.div_ = document.createElement('DIV');
    this.div_.id = this.cluster_.getId();
    if (this.visible_) {
        var pos = this.getPosFromLatLng_(this.center_);
        console.log('grap on add', this.center_.lat(), this.center_.lng(), this.div_.id, pos.x, pos.y);
        this.div_.style.cssText = this.createCss(pos);
    }
    // Add the element to the "overlayLayer" pane (API method).
    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this.div_);

    var that = this;
    google.maps.event.addDomListener(this.div_, 'click', function () {
        that.triggerClusterClick();
    });
};
// draw function will be called ever "idle" event
Graph.prototype.draw = function () {
    // pos will changed ever "idle" event
    if (this.visible_) {
        var pos = this.getPosFromLatLng_(this.center_);
        // console.log('grap draw', this.center_.lat(),this.center_.lng(),this.div_.id, pos.x, pos.y);
        this.div_.style.top = pos.y + 'px';
        this.div_.style.left = pos.x + 'px';
        this.div_.style.zIndex = google.maps.Marker.MAX_ZINDEX + 1;
    }
    if (!this.chart_ && this.visible_) {
        this.chart_ = this.initChart(this.div_.id);
    }
};
Graph.prototype.getPosFromLatLng_ = function (latlng) {
    var pos = this.getProjection().fromLatLngToDivPixel(latlng);
    pos.x -= parseInt(this.width_ / 2, 10);
    pos.y -= parseInt(this.height_ / 2, 10);
    return pos;
};
Graph.prototype.hide = function () {
    if (this.div_) {
        this.div_.style.display = 'none';
    }
    this.visible_ = false;
};
Graph.prototype.remove = function () {
    if (this.chart_) {
        this.chart_.dispose();
        this.chart_ = null;
    }
    if (this.div_ && this.div_.parentNode) {
        this.hide();
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    }
    this.setMap(null);
};
// This method is called once following a call to setMap(null).
Graph.prototype.onRemove = function () { };
Graph.prototype.show = function () {
    if (this.div_) {
        var pos = this.getPosFromLatLng_(this.center_);
        this.div_.style.cssText = this.createCss(pos);
        this.div_.style.display = '';
    }
    this.visible_ = true;
};
Graph.prototype.initChart = function (id) {
    var center = this.size_.max / 2;
    var symbolSize = (this.size_.max - this.size_.min) / (this.totalNum_ - 2) *
        this.sums_ + this.size_.min;
    var data = [{
        name: this.sums_ + '',
        // value: [20, 20],
        value: [center, center],
        // offset: [0, 0],
        // symbolSize: (40 - 30) / (2749 - 2) * this.sums_ + 30 // min size 30, max size 40
        symbolSize: symbolSize,
    }];
    var chart = echarts.init(document.getElementById(id), "macarons");
    var option = {
        tooltip: {
            trigger: 'item',
            formatter: "{b}"
        },
        grid: {
            show: false,
            top: 5,
            bottom: 5,
            left: 5,
            right: 5,
        },
        xAxis: [{
            gridIndex: 0,
            min: 0,
            max: this.size_.max,
            // show: true,
            show: false,
            nameLocation: 'middle',
        }],
        yAxis: [{
            min: 0,
            max: this.size_.max,
            gridIndex: 0,
            // show: true,
            show: false,
            nameLocation: 'middle',
        }],
        series: [{
            type: 'scatter',
            symbol: 'circle',
            symbolSize: this.size_.max,
            label: {
                normal: {
                    show: true,
                    formatter: '{b}',
                    color: '#fff',
                    textStyle: {
                        fontSize: '11'
                    }
                },
            },
            itemStyle: {
                normal: {
                    // color: '#00acea',
                    opacity: 0.8,
                }
            },
            data: data,
            animationDelay: parseInt(id.split('_')[1]) * 20,
        }],
        // animationEasing: 'elasticOut',
        animationDelayUpdate: parseInt(id.split('_')[1]) * 20,
    };
    chart.setOption(option);
    return chart
};
Graph.prototype.createCss = function (pos) {
    var style = [];
    var txtSize = 11;
    var txtColor = 'black';
    if (pos) {
        style.push('cursor:pointer;color:' + txtColor + '; font-size:' +
            txtSize + 'px; font-family:Arial,sans-serif; font-weight:bold;');
        style.push('height:' + this.height_ + 'px; line-height:' +
            this.height_ + 'px; width:' + this.width_ + 'px; text-align:center; position:absolute;');
        style.push('top:' + pos.y + 'px; left:' +
            pos.x + 'px;');
    }
    return style.join('');
};

/**
 * Triggers the clusterclick event and zoom's if the option is set.
 */
Graph.prototype.triggerClusterClick = function () {
    var graphCluster = this.cluster_.getGraphCluster();
    // TODO: Trigger the clusterclick event. 
    google.maps.event.trigger(graphCluster.map_, 'clusterclick', this.cluster_);
    if (graphCluster.isZoomOnClick()) {
        //Zoom into the cluster.
        this.map_.fitBounds(this.cluster_.getBounds());
    }
};
/**
 * Class of ClickControl
 * @param {*} map 
 * Cluster click control to switch between showing spider or zoom in
 */
function ClickControl(map) {
    this.clickControlUI_ = document.getElementById('click-control');
    if (!this.clickControlUI_) {
        this.clickControlUI_ = document.createElement('div');
        this.clickControlUI_.id = "click-control";
        this.clickControlUI_.index = 1;
        this.clickControlUI_.style['margin-top'] = '10px';
        this.clickControlUI_.style['display'] = 'flex';
        this.clickControlUI_.style['border-radius'] = '2px';
        this.clickControlUI_.style['background-color'] = 'white';
        this.clickControlUI_.style['padding'] = '5px';
        map.controls[google.maps.ControlPosition.TOP_CENTER].push(this.clickControlUI_);

    }

    this.zoomin_ = true;
    var zoominUI = document.createElement('div');
    zoominUI.id = "zoominUI";
    zoominUI.title = "cluster click zoom in";
    var zoominUrl = '../images/zoom_in.png'
    zoominUI.style.cssText = this.createControlCss(zoominUrl);
    zoominUI.style['border-right'] = '1px solid #888888';
    zoominUI.style['opacity'] = '1';

    this.clickControlUI_.appendChild(zoominUI);

    var spiderUI = document.createElement('div');
    spiderUI.id = "spiderUI";
    spiderUI.title = "cluster click expand spider";
    var spiderUrl = '../images/spider.png'
    spiderUI.style.cssText = this.createControlCss(spiderUrl);
    this.clickControlUI_.appendChild(spiderUI);
    // Setup the click event listeners: simply set the map to Chicago.
    var that = this;
    zoominUI.addEventListener('click', function () {
        zoominUI.style['opacity'] = '1';
        spiderUI.style['opacity'] = '0.5';
        that.setZoomin(true);
    });
    // Setup the click event listeners: simply set the map to Chicago.
    spiderUI.addEventListener('click', function () {
        spiderUI.style['opacity'] = '1';
        zoominUI.style['opacity'] = '0.5';
        that.setZoomin(false);
    });

}
ClickControl.prototype.createControlCss = function (url) {
    var style = [];
    var height = 18;
    var width = 18;
    style.push('background-image:url(' + url + ');');
    style.push('height:' + height + 'px; line-height:' +
        this.height_ + 'px; width:' + width + 'px; text-align:center;');
    style.push('cursor:pointer;opacity:0.5;padding: 6px;');
    style.push('background-color: white;background-repeat: no-repeat;background-position: center;')
    return style.join('');
};
ClickControl.prototype.setZoomin = function (zoomin) {
    this.zoomin_ = zoomin;
}
ClickControl.prototype.getZoomin = function () {
    console.log('get control zoom in', this.zoomin_);
    return this.zoomin_;
}

function MarkerTooltip(graphCluster) {
    graphCluster.extend(MarkerTooltip, google.maps.OverlayView);
    this.graphCluster_ = graphCluster;
    this.map_ = this.graphCluster_.map_;
    this.div_ = null;
    this.visible_ = null;
    this.setMap(this.map_);
}
MarkerTooltip.prototype.onAdd = function () {
    this.div_ = document.createElement('div');
    this.div_.id = "marker-tooltip";
    this.div_.style.display = 'none';
    this.div_.style.cssText = this.createTooltipCss();
    // Add the element to the "overlayLayer" pane (API method).
    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this.div_);
};
MarkerTooltip.prototype.draw = function () {
    this.hide();
}
MarkerTooltip.prototype.onRemove = function () {
    if (this.div_ && this.div_.parentNode) {
        this.hide();
        this.div_.parentNode.removeChild(this.div_);
        this.div_ = null;
    }
}
MarkerTooltip.prototype.createTooltipCss = function () {
    var style = [];
    var height = 80;
    var width = 80;
    style.push('background-color:rgba(50,50,50,0.7);border-radius: 4px; color: rgb(255,255,255);');
    style.push('padding: 5px;z-index:99999;white-space: nowrap;');
    style.push('transition: left 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s, top 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s;');
    style.push('height:' + height + 'px; line-height:' +
        this.height_ + 'px; width:' + width + 'px; position:absolute;');
    return style.join('');
};
MarkerTooltip.prototype.show = function (latlng) {
    var pos = this.getPosFromLatLng_(latlng);
    if (this.div_ && pos) {
        this.div_.style.top = pos.y + 'px';
        this.div_.style.left = pos.x + 'px';
        this.div_.style.display = '';
    }
    this.visible_ = true;
}
MarkerTooltip.prototype.hide = function () {
    if (this.div_) {
        this.div_.style.display = 'none'
    }
}

MarkerTooltip.prototype.getPosFromLatLng_ = function (latlng) {
    return this.graphCluster_.getProjection().fromLatLngToDivPixel(latlng);
}
MarkerTooltip.prototype.getVisible = function () {
    return this.visible_;
}

