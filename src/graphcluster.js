/*
 * Created Date: Monday, August 20th 2018, 00:15:02 am
 * Author: cheriefu
 * 
 * Copyright (c) 2018 Cherie Fu
 */
function GraphCluster(map, opt_data, opt_options) {
    this.extend(GraphCluster, google.maps.OverlayView);
    // Initialize all properties.
    this.map_ = map;
    this.markers_ = [];
    this.clusters_ = [];
    this.ready_ = false;
    this.opts_ = opt_options || {};
    this.data_ = opt_data;
    this.gridSize_ = this.opts_.gridSize || 60;
    this.size_ = this.opts_.size;
    this.markerImg_ = this.opts_.markerImg || {
        url: '../images/marker1.png',
        scaledSize: new google.maps.Size(40, 40),
    };
    this.prevZoom_ = this.map_.getZoom();
    this.totalNum_ = opt_data ? opt_data.length : 0;
    this.clusterId_ = 0;
    // Explicitly call setMap on this overlay.
    this.setMap(map);
    var that = this;
    if (this.opts_.typeControl) {
        this.typeControl_ = new TypeControl(this.map_);
    }
    if (this.opts_.clickControl) {
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

    google.maps.event.addListener(this.map_, 'type_changed', function () {
        that.resetViewport();
        that.createClusters();
    })
    // init cluster
    if (this.data_ && this.data_.length > 0) {
        this.initMarkers(this.data_);
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
GraphCluster.prototype.initMarkers = function (data) {
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, d; d = data[i]; i++) {
        var position = new google.maps.LatLng(d.lat, d.lng);
        var marker = new google.maps.Marker({
            position: position,
            label: d.label,
            icon: this.markerImg_,
            map: this.map_,
            oData: d,
        });
        bounds.extend(marker.getPosition());
        this.markers_.push(marker);
    }
    this.map_.fitBounds(bounds);
};
// private method
GraphCluster.prototype.createClusters = function () {
    if (!this.ready_) {
        return;
    }
    var bounds = new google.maps.LatLngBounds(this.map_.getBounds().getSouthWest(),
        this.map_.getBounds().getNorthEast());
    for (var i = 0, m; m = this.markers_[i]; i++) {
        if (!m.isAdded && bounds.contains(m.getPosition())) {
            this.addToClosestCluster_(m);
        }
    }
    this.cleanCluster_();
    this.addMarkersListener();
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
        cluster.setId('cluster_' + this.getClusterId());
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
    this.clusterId_ = 0;
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
GraphCluster.prototype.getCluserType = function () {
    return this.typeControl_ && this.typeControl_.getCluserType();
}
GraphCluster.prototype.getTooltip = function () {
    return this.tooltip_;
}
GraphCluster.prototype.addMarkersListener = function () {
    var that = this;
    for (var i = 0, m; m = this.markers_[i]; i++) {
        if (m.map) {
            this.attachTooltipEvent_(m);
        }
    }
}
GraphCluster.prototype.attachTooltipEvent_ = function (marker, handle) {
    var that = this;
    marker.addListener('mouseover', function () {
        if (marker.getMap()) {
            that.getTooltip().show(marker.getPosition(),
                that.getTooltipContent_(marker.oData));
        }
    });
    marker.addListener('mouseout', function () {
        if (that.getTooltip().getVisible()) {
            that.getTooltip().hide();
        }
    });
}
GraphCluster.prototype.getTooltipContent_ = function (oData) {
    var html = [];
    html.push('<table>');
    for (var i = 0, key; key = Object.keys(oData)[i]; i++) {
        html.push('<tr>');
        html.push('<td>' + key + '</td>');
        html.push('<td>' + oData[key] + '</td>');
        html.push('</tr>');
    }
    html.push('</table>');
    return html.join('');

}
GraphCluster.prototype.getChartSettings = function () {
    return this.opts_.chartSettings ? this.opts_.chartSettings : {};
}
GraphCluster.prototype.getClusterId = function () {
    this.clusterId_++;
    return this.clusterId_;
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
Cluster.prototype.getMarkers = function () {
    return this.markers_;
}
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
    this.chartSettings_ = cluster.getGraphCluster().getChartSettings();
    this.totalNum_ = cluster.totalNum_;
    this.width_ = this.size_.max + 10;
    this.height_ = this.size_.max + 10;
    this.expand_ = false;
    this.setMap(this.map_);
    this.chart_ = null;
    this.scatterOpt_ = null;
    this.graphOpt_ = null;
    this.pieOpt_ = null;
    this.spiderOpen_ = false;
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
        this.div_.style.cssText = this.createCss(pos);
    }
    // Add the element to the "overlayLayer" pane (API method).
    var panes = this.getPanes();
    panes.overlayMouseTarget.appendChild(this.div_);

    var that = this;
    google.maps.event.addDomListener(this.div_, 'click', function () {
        that.triggerClusterClick();
    });
    if (!this.chart_ && this.visible_) {
        this.chart_ = this.initChart(this.div_.id);
    }
};
// draw function will be called ever "idle" event
Graph.prototype.draw = function () {
    // pos will changed ever "idle" event
    if (this.visible_) {
        var pos = this.getPosFromLatLng_(this.center_);
        this.div_.style.top = pos.y + 'px';
        this.div_.style.left = pos.x + 'px';
        this.div_.style.zIndex = google.maps.Marker.MAX_ZINDEX + 1;
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
        oData: this.cluster_.getMarkers().map(function (m) { return m.oData }),
    }];
    var chart = echarts.init(document.getElementById(id), "macarons");
    this.scatterOpt_ = {
        tooltip: {
            trigger: 'item',
            formatter: function (obj) {
                // var html = ['<dl style="margin: 20px 20px;"><dd style="margin: 0;">'];
                // for (var i = 0, m; (m = obj.data.oData[i]) && i < 100; i++) {
                //     html.push('id:' + m.id + '; ');
                //     if ((i - 4) % 5 === 0) {
                //         html.push('</dd><dd style="margin: 0;">')
                //     }
                // }
                // html.push('</dd>');
                // if (obj.data.oData.length > 100) {
                //     html.push('<dd style="margin: 0;"> . . . . . . . .  </dd>');
                // }
                // html.push('</dl>')
                var html = ['<table style="font-size: 10px"><thead><tr>']
                for (var i = 0, key; key = Object.keys(obj.data.oData[0])[i]; i++) {
                    html.push('<th>' + key + '</th>');
                }
                html.push('</tr></thead><tbody>');
                for (var i = 0, m; (m = obj.data.oData[i]) && i < 10; i++) {
                    html.push('<tr>');
                    for (var j = 0, key; key = Object.keys(m)[j]; j++) {
                        html.push('<td>' + obj.data.oData[i][key] + '</td>');
                    }
                    html.push('</tr>');
                }
                if (obj.data.oData.length > 10) {
                    html.push('<tr><td> . . . . . . . .  </td>');
                }
                html.push('</tbody></table>');
                return html.join('');
            }
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
            show: false,
            nameLocation: 'middle',
        }],
        yAxis: [{
            min: 0,
            max: this.size_.max,
            gridIndex: 0,
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
                    color: this.chartSettings_.scatter && this.chartSettings_.scatter.color ?
                        this.chartSettings_.scatter.color : '#c23531',
                    opacity: 0.8,
                }
            },
            data: data,
            animationDelay: parseInt(id.split('_')[1]) * 20,
        }],
        animationDelayUpdate: parseInt(id.split('_')[1]) * 20,
    };

    var spiderKey = this.chartSettings_.spider && this.chartSettings_.spider.group &&
        this.chartSettings_.spider.group.key ? this.chartSettings_.spider.group.key : null;
    if (spiderKey) {
        // var spiderGroupKeys = [];
        var spiderColors = this.chartSettings_.spider.group.colorMap;
    }
    var spiderData = this.cluster_.getMarkers().map(function (m) {
        // if (spiderKey && spiderGroupKeys.indexOf(m.oData[spiderKey]) < 0) {
        //     spiderGroupKeys.push(m.oData[spiderKey]);
        // }
        return {
            name: m.oData.id,
            symbolSize: 15,
            oData: m.oData,
        };
    });
    spiderData = spiderData.map(d => {
        return Object.assign({ itemStyle: { color: spiderColors ? spiderColors[d.oData[spiderKey]] : '#c23531' } }, d);
    })
    spiderData.unshift({
        name: 'cluster',
        symbolSize: 1,
    });
    var spiderLinks = spiderData.map(function (d, i) {
        return {
            source: 0,
            target: i,
        };
    });
    var tooltipFn = this.cluster_.getGraphCluster().getTooltipContent_;
    this.graphOpt_ = {
        tooltip: {
            trigger: 'item',
            formatter: function (obj, ticket) {
                if (obj.dataType === 'node' && obj.data.oData) {
                    return tooltipFn(obj.data.oData);
                }
            }
        },
        series: [{
            name: id,
            type: 'graph',
            layout: 'force',
            force: {
                gravity: 1,   // the larger the center     
                repulsion: 350,
                // edgeLength: 10,
                layoutAnimation: false // node more than 200 may cause browse crush
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
            data: spiderData,
            links: spiderLinks,
        }]
    };

    var pieKey = this.chartSettings_.pie && this.chartSettings_.pie.group &&
        this.chartSettings_.pie.group.key ? this.chartSettings_.pie.group.key : null;
    if (pieKey) {
        var pieColors = this.chartSettings_.pie.group.colorMap;
    }
    var pieData = [];
    var pieGroupMap = new Map();
    this.cluster_.getMarkers().map(function (m) {
        if (!pieGroupMap.has(m.oData[pieKey])) {
            pieGroupMap.set(m.oData[pieKey], 1);
        } else {
            pieGroupMap.set(m.oData[pieKey], pieGroupMap.get(m.oData[pieKey]) + 1);
        }
    });
    pieGroupMap.forEach(function (value, key) {
        pieData.push({
            name: key,
            value: value,
            itemStyle: {
                normal: { color: pieColors[key] }
            }
        });
    })
    this.pieOpt_ = {
        grid: {
            top: 5,
            left: 5,
            right: 5,
            bottom: 5
        },
        title: {
            text: this.sums_,
            x: 'center',
            y: 'center',
            textStyle: {
                // fontWeight:'normal',
                fontSize: '12',
                color: '#ff6347'
            }
        },
        tooltip: {
            show: true,
            formatter: function (a) {
                var html = ['<div>'];
                html.push(a.marker);
                html.push('<span>' + a.name + ':    ' + a.value + '</span></div>');
                return html.join('');
            }
        },
        series: [{
            name: id,
            type: 'pie',
            radius: [this.sums_ / (this.totalNum_ - 2) * (70 - 40) + 40 + '%', this.sums_ / (this.totalNum_ - 2) * (86 - 55) + 55 + '%',],
            hoverOffset: 5,
            itemStyle: { normal: { label: { show: false } } },
            data: pieData,
            animationDelay: parseInt(id.split('_')[1]) * 20,
        }],
        animationDelayUpdate: parseInt(id.split('_')[1]) * 20,
    };

    var type = this.cluster_.getGraphCluster().getCluserType();
    if (type === 'pie') {
        chart.setOption(this.pieOpt_);
    } else {
        chart.setOption(this.scatterOpt_);
    }

    return chart
};
Graph.prototype.createCss = function (pos) {
    var style = [];
    var txtSize = 11;
    var txtColor = 'black';
    if (pos) {
        style.push('cursor:pointer;color:' + txtColor + '; font-size:' + txtSize + 'px;');
        // style.push('border: 1px solid purple;');
        style.push('height:' + this.height_ + 'px; line-height:' +
            this.height_ + 'px; width:' + this.width_ + 'px;');
        style.push(' position:absolute;top:' + pos.y + 'px; left:' +
            pos.x + 'px;');
    }
    return style.join('');
};
Graph.prototype.resetOption = function (option) {
    this.width_ = this.size_.max + 10;
    this.height_ = this.size_.max + 10;
    if (!this.spiderOpen_) {
        // this.sums_ * 3 + this.size_.max + 80
        var s = Math.floor(this.sums_ / 1000);
        var r = this.sums_ % 1000;
        var h = Math.floor(r / 100);
        var r1 = r % 100;
        var t = Math.floor(r1 / 10);
        var l = r1 % 10;
        this.width_ = (s * 500 + h * 320 + t * 50 + l * 10 + 100);
        this.height_ = (s * 500 + h * 320 + t * 50 + l * 10 + 100);
    }
    if (this.div_) {
        var pos = this.getPosFromLatLng_(this.center_);
        this.div_.style.cssText = this.createCss(pos);
        if (!this.spiderOpen_) {
            this.div_.style.zIndex = google.maps.Marker.MAX_ZINDEX + 1000;
        } else {
            this.div_.style.zIndex = google.maps.Marker.MAX_ZINDEX + 1;
        }
    }
    this.chart_.resize({
        width: this.width_,
        height: this.height_,
    });
    this.chart_.clear();
    this.chart_.setOption(option);
    this.spiderOpen_ = !this.spiderOpen_;
};
/**
 * Triggers the clusterclick event and zoom's if the option is set.
 */
Graph.prototype.triggerClusterClick = function () {
    var graphCluster = this.cluster_.getGraphCluster();
    var graphType = this.cluster_.getGraphCluster().getCluserType();
    // TODO: Trigger the clusterclick event. 
    google.maps.event.trigger(graphCluster.map_, 'clusterclick', this.cluster_);
    if (graphCluster.isZoomOnClick()) {
        //Zoom into the cluster.
        this.map_.fitBounds(this.cluster_.getBounds());
    } else {
        if (parseInt(this.sums_) > 500) {
            // if count more than 500 will not open the spder instead will zoom into the cluster.
            this.map_.fitBounds(this.cluster_.getBounds());
        } else {
            var option = this.scatterOpt_;
            if (!this.spiderOpen_) {
                option = this.graphOpt_;
            } else if (graphType === 'pie') {
                option = this.pieOpt_;
            }
            // var option = this.spiderOpen_ ? this.scatterOpt_ : this.graphOpt_;
            this.resetOption(option);

        }
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
        this.clickControlUI_.style['margin-right'] = '20px';
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
    var zoominUrl = 'images/zoom_in.png'
    zoominUI.style.cssText = this.createControlCss(zoominUrl);
    zoominUI.style['border-right'] = '1px solid #888888';
    zoominUI.style['opacity'] = '1';

    this.clickControlUI_.appendChild(zoominUI);

    var spiderUI = document.createElement('div');
    spiderUI.id = "spiderUI";
    spiderUI.title = "cluster click expand spider(number less than 500)";
    var spiderUrl = 'images/spider.png'
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
    style.push('background-color: white;background-repeat: no-repeat;' +
        'background-position: center;')
    return style.join('');
};
ClickControl.prototype.setZoomin = function (zoomin) {
    this.zoomin_ = zoomin;
}
ClickControl.prototype.getZoomin = function () {
    return this.zoomin_;
}

/**
 * Class of TypeControl
 * @param {*} map 
 * Cluster tylpe control to switch between scatter or pie 
 */
function TypeControl(map) {
    this.map_ = map;
    this.typeControlUI_ = document.getElementById('click-control');
    if (!this.typeControlUI_) {
        this.typeControlUI_ = document.createElement('div');
        this.typeControlUI_.id = "click-control";
        this.typeControlUI_.index = 1;
        this.typeControlUI_.style['margin-top'] = '10px';
        this.typeControlUI_.style['margin-right'] = '20px';
        this.typeControlUI_.style['display'] = 'flex';
        this.typeControlUI_.style['border-radius'] = '2px';
        this.typeControlUI_.style['background-color'] = 'white';
        this.typeControlUI_.style['padding'] = '5px';
        this.map_.controls[google.maps.ControlPosition.TOP_CENTER].push(this.typeControlUI_);

    }
    this.clusterType_ = 'scatter';
    var scatterUI = document.createElement('div');
    scatterUI.id = "scatterUI";
    scatterUI.title = "show Scattor";
    var scatterUrl = 'images/bubble.png'
    scatterUI.style.cssText = this.createControlCss(scatterUrl);
    scatterUI.style['border-right'] = '1px solid #888888';
    scatterUI.style['opacity'] = '1';

    this.typeControlUI_.appendChild(scatterUI);

    var pieUI = document.createElement('div');
    pieUI.id = "pieUI";
    pieUI.title = "show Pie";
    var spiderUrl = 'images/pie.png'
    pieUI.style.cssText = this.createControlCss(spiderUrl);
    this.typeControlUI_.appendChild(pieUI);
    // Setup the click event listeners: simply set the map to Chicago.
    var that = this;
    scatterUI.addEventListener('click', function () {
        scatterUI.style['opacity'] = '1';
        pieUI.style['opacity'] = '0.5';
        that.setClusterType('scatter');
        google.maps.event.trigger(that.map_, 'type_changed', {});
    });
    // Setup the click event listeners: simply set the map to Chicago.
    pieUI.addEventListener('click', function () {
        pieUI.style['opacity'] = '1';
        scatterUI.style['opacity'] = '0.5';
        that.setClusterType('pie');
        google.maps.event.trigger(that.map_, 'type_changed', {});
    });

}
TypeControl.prototype.createControlCss = function (url) {
    var style = [];
    var height = 18;
    var width = 18;
    style.push('background-image:url(' + url + ');');
    style.push('height:' + height + 'px; line-height:' +
        this.height_ + 'px; width:' + width + 'px; text-align:center;');
    style.push('cursor:pointer;opacity:0.5;padding: 6px;');
    style.push('background-color: white;background-repeat: no-repeat;' +
        'background-position: center;')
    return style.join('');
};
TypeControl.prototype.setClusterType = function (type) {
    this.clusterType_ = type;
}
TypeControl.prototype.getCluserType = function () {
    return this.clusterType_;
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
    panes.floatPane.appendChild(this.div_);
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
    // var height = 80;
    // var width = 80;
    style.push('position:absolute;');
    style.push('background-color:rgba(50,50,50,0.7);' +
        'border-radius: 4px; color: rgb(255,255,255);');
    style.push('padding: 5px;z-index:99999;white-space: nowrap;');
    style.push('transition: left 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s, ' +
        'top 0.4s cubic-bezier(0.23, 1, 0.32, 1) 0s;');
    // style.push('height:' + height + 'px; line-height:' +
    //     this.height_ + 'px; width:' + width + 'px;');
    return style.join('');
};
MarkerTooltip.prototype.show = function (latlng, content) {
    var pos = this.getPosFromLatLng_(latlng);
    if (this.div_ && pos) {
        this.div_.style.top = pos.y + 'px';
        this.div_.style.left = pos.x + 'px';
        this.div_.style.display = '';
        this.div_.innerHTML = content;
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

