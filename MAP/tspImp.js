/*
  These are the implementation-specific parts of the OptiMap application at
  http://www.gebweb.net/optimap

  This should serve as an example on how to use the more general BpTspSolver.js
  from http://code.google.com/p/google-maps-tsp-solver/

  Author: Geir K. Engdahl
*/

var tsp; // The BpTspSolver object which handles the TSP computation.
var mode;
//var markers = new Array();  // Need pointers to all markers to clean up.
var dirRenderer;  // Need pointer to path to clean up.
var ico;

function drawMarker(latlng, addr, label, num) {//.......
    var icon;
    icon = new google.maps.MarkerImage(ico+ (num + 1) + ".png");
    var marker = new google.maps.Marker({ 
        position: latlng, 
        icon: icon, 
        map: map });
    google.maps.event.addListener(marker, 'click', function(event) {
        var addrStr = (addr == null) ? "" : addr + "<br>";
        var labelStr = (label == null) ? "" : "<b>" + label + "</b><br>";
        var markerInd = -1;
        for (var i = 0; i < markers.length; ++i) {
            if (markers[i] != null && marker.getPosition().equals(markers[i].getPosition())) {
                markerInd = i;
                break;
            }
        }
        var infoWindow = new google.maps.InfoWindow({ 
            content: labelStr + addrStr,
            position: marker.getPosition() });
        marker.infoWindow = infoWindow;
        infoWindow.open(map);
        //    tsp.removeWaypoint(marker.getPosition());
        //    marker.setMap(null);
    });
    markers.push(marker);
}

function setViewportToCover(waypoints) {//...
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < waypoints.length; ++i) {
        bounds.extend(waypoints[i]);
    }
    map.fitBounds(bounds);
}

function addWaypointWithLabel(latLng, label, ico) {//....
    tsp.addWaypointWithLabel(latLng, label, addWaypointSuccessCallbackZoom);
	this.ico = ico;
}

function addWaypointSuccessCallbackZoom(latlng) {//..........
    if (latlng) {
        drawMarkers(true);
    }
}

function drawMarkers(updateViewport) {//.............
    removeOldMarkers();
    var waypoints = tsp.getWaypoints();
    var addresses = tsp.getAddresses();
    var labels = tsp.getLabels();
    for (var i = 0; i < waypoints.length; ++i) {
        drawMarker(waypoints[i], addresses[i], labels[i], i);
    }
    if (updateViewport) {
        setViewportToCover(waypoints);
    }
}

function directions(m, walking, avoid) {
    mode = m;
    tsp.setAvoidHighways(avoid);
    if (walking)
        tsp.setTravelMode(google.maps.DirectionsTravelMode.WALKING);
    else
        tsp.setTravelMode(google.maps.DirectionsTravelMode.DRIVING);
    if (m == 0)
        tsp.solveRoundTrip(onSolveCallback);
    else
        tsp.solveAtoZ(onSolveCallback);
}

function removeOldMarkers() {//....
    for (var i = 0; i < markers.length; ++i) {
        markers[i].setMap(null);
    }
    markers = new Array();
}

function onSolveCallback(myTsp) {
    var dirRes = tsp.getGDirections();
    var dir = dirRes.routes[0];
	var labels = tsp.getLabels();
    removeOldMarkers();

    // Add nice, numbered icons.
    if (mode == 1) {
        var myPt1 = dir.legs[0].start_location;
        var myIcn1 = new google.maps.MarkerImage(ico);
        var marker = new google.maps.Marker({ 
            position: myPt1, 
            icon: myIcn1, 
            map: map });
        markers.push(marker);
    }
    for (var i = 0; i < dir.legs.length; ++i) {
        var route = dir.legs[i];
        var myPt1 = route.end_location;
        var myIcn1;
        if (i == dir.legs.length - 1 && mode == 0) {
            myIcn1 = new google.maps.MarkerImage(ico);
        } else {
            myIcn1 = new google.maps.MarkerImage(ico);
        }
        var marker = new google.maps.Marker({
            position: myPt1,
            icon: myIcn1,
            map: map });
		infoWindowsMarker(marker, labels[i])
        markers.push(marker);
    }
    // Clean up old path.
    if (dirRenderer != null) {
        dirRenderer.setMap(null);
    }
    dirRenderer = new google.maps.DirectionsRenderer({
        directions: dirRes,
        hideRouteList: true,
        map: map,
        panel: null,
        preserveViewport: false,
        suppressInfoWindows: true,
        suppressMarkers: true });
}

function infoWindowsMarker(marker, label) {
	google.maps.event.addListener(marker, 'click', function(event) {
        var labelStr = (label == null) ? "" : "<b>" + label + "</b><br>";
        var markerInd = -1;
        for (var i = 0; i < markers.length; ++i) {
            if (markers[i] != null && marker.getPosition().equals(markers[i].getPosition())) {
                markerInd = i;
                break;
            }
        }
        var infoWindow = new google.maps.InfoWindow({ 
            content: labelStr,
            position: marker.getPosition()
		});
        marker.infoWindow = infoWindow;
        infoWindow.open(map);
	});
}