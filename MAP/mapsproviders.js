var markers = [];
var polygons = [];
var lastMarker = 0;
var map;
var mapControl;
var mapContainer;
var tsp;

/************************ GOOGLE PROVIDER CODE **********************************/
/********************************************************************************/


function GoogleShow(GoogleMapControl) {

    mapControl = GoogleMapControl;			
    //Map Options Config
    var mapType = mapControl.GoogleMap.MapType || mapControl.Type;    
    mapType = GoogleMapGetType(mapType);    
    var myLatlng = GetGoogleMapCenter(mapControl);
    var mapPrecision = parseInt(mapControl.GoogleMap.MapZoom || mapControl.Precision);     
    var mapScrollwheel = gx.lang.gxBoolean(mapControl.ScrollWheel);    
    var mapScaleControl = (mapControl.Scale_Control == "GScale_False") ?false:true;
    var mapTypeControlVisible = (mapControl.Type_Control == "GType_False")?false:true;
    var mapNavigationControlStyle = GoogleMapGetNavigationStyle(mapControl.Navigation_Control_Style);
    var mapMapTypeControlStyle = GoogleMapGetTypeStyle(mapControl.MapType_Control_Style);

    var myOptions = {
        center: myLatlng,
        mapTypeId: mapType,
        zoom: mapPrecision,
        mapTypeControl: mapTypeControlVisible,
        mapTypeControlOptions: {
            style: mapMapTypeControlStyle
        },
        scaleControl: mapScaleControl,
        navigationControl: true,
        navigationControlOptions: {
            style: mapNavigationControlStyle
        },
        scrollwheel: mapScrollwheel
    };
    if (!mapControl.Ready)
    {
		var container = document.getElementById(mapControl.ContainerName);
		container.style.width = gx.dom.addUnits(mapControl.Width);
		container.style.height = gx.dom.addUnits(mapControl.Height);
		mapContainer = document.createElement("div");
		mapContainer.setAttribute("id", mapControl.ContainerName + "_MAP");
		mapContainer.style.width = gx.dom.addUnits(mapControl.Width);
		mapContainer.style.height = gx.dom.addUnits(mapControl.Height);
		container.appendChild(mapContainer);
		mapControl.Ready = true;

	
		map = new google.maps.Map(mapContainer, myOptions);		 
		if(mapControl.GoogleMap.Routing) {
				tsp = new BpTspSolver(map, null);}
				
	}else{
			map.setOptions(myOptions);    
			clearAllMarkers();			
		}
	 
	
    if (mapControl.GoogleMap && mapControl.GoogleMap.Points) {
        // Points
        var point;
        
        for (var i = 0; mapControl.GoogleMap.Points[i] != undefined; i++) {
			var infowin = null;
            myLatlng = new google.maps.LatLng(mapControl.GoogleMap.Points[i].PointLat, mapControl.GoogleMap.Points[i].PointLong);
            pointTitle = mapControl.GoogleMap.Points[i].PointInfowinTit;

			var buildAnchor = function (text, linkUrl, target) {
				target = target || "";
				return "<a href='" + linkUrl + "' target='" + target  +  "'>" + text + "</a>";
			};
			
			var aTarget = (mapControl.OpenLinksInNewWindow == "OpenNew_True")? '_blank':'';  			
			var aLink = mapControl.GoogleMap.Points[i].PointInfowinLink;
			
            if (!gx.lang.emptyObject(pointTitle)) {
				if (!mapControl.GoogleMap.Points[i].PointInfowinLink || mapControl.GoogleMap.Points[i].PointInfowinLinkDsc)
					infowin = "<B>" + pointTitle + "</B><Br>";			
				else
					infowin = buildAnchor(pointTitle, aLink, aTarget);
			}
            if (!gx.lang.emptyObject(mapControl.GoogleMap.Points[i].PointInfowinDesc)) 
				infowin += mapControl.GoogleMap.Points[i].PointInfowinDesc + "<Br>";

			if (!gx.lang.emptyObject(mapControl.GoogleMap.Points[i].PointInfowinLink) && mapControl.GoogleMap.Points[i].PointInfowinLinkDsc) 
				infowin += buildAnchor(mapControl.GoogleMap.Points[i].PointInfowinLinkDsc, aLink, aTarget) + "<Br><Br>";
            
            var varUrl = mapControl.GoogleMap.Points[i].PointInfowinImg;
            if (!gx.lang.emptyObject(varUrl)) 
				infowin += "<img src=" + '"' + varUrl + '"' + "/>" + "<Br>";

            var htmlInfowin = mapControl.GoogleMap.Points[i].PointInfowinHtml;
            if (!gx.lang.emptyObject(htmlInfowin)) 
				infowin = htmlInfowin;
						
            //Marker
			var pointClickable = !gx.lang.emptyObject(mapControl.GoogleMap.Points[i].PointClickable)?
											gx.lang.gxBoolean(mapControl.GoogleMap.Points[i].PointClickable):true; 

            var pointVisible = !gx.lang.emptyObject(mapControl.GoogleMap.Points[i].PointVisible)?
											gx.lang.gxBoolean(mapControl.GoogleMap.Points[i].PointVisible):true;           
            var pointFlat = gx.lang.gxBoolean(mapControl.GoogleMap.Points[i].PointFlat);          
            var pointDraggable = gx.lang.gxBoolean(mapControl.GoogleMap.Points[i].PointDraggable);  
            var pointIcon = mapControl.GoogleMap.Points[i].PointIcon || mapControl.Icon;
            pointIcon = GoogleGetIcon(pointIcon);

			if (infowin == null)
				infowin = createInfoWin(myLatlng);
				
            var marker = new google.maps.Marker({
                position: myLatlng,
                map: map,                
                title: pointTitle,
				icon: pointIcon,
                draggable: pointDraggable,
                flat: pointFlat,
                clickable: pointClickable,
                visible: pointVisible,
                htmlinfo: infowin
            });
			marker.idx = i;
            //Save Marker object
            markers[i] = marker;

            ////////////////Config Marker Listeners
            //Associate Marker to infowin
            google.maps.event.addListener(marker, 'click', function () {
                if (this.htmlinfo != undefined) {
                    var infowindow = new google.maps.InfoWindow();
                    infowindow.setContent(this.htmlinfo);
                    infowindow.setPosition(this.position);
                    infowindow.open(marker.map);
                }
            });

            SetMarkerDragEndListeners(marker);

            if (mapControl.GoogleMap.Points[i].Deletable) {
                SetMarkerDobleClickListener(marker);
            }

        }

        //Set center in the last marker
        //map.setCenter(myLatlng);
    }
	
// Lines
	if (mapControl.GoogleMap.Lines!=undefined)
	{
		var opacity;
		var weight;
		var color;
		for(var i=0;mapControl.GoogleMap.Lines[i]!=undefined;i++)
		{
			var polygonLinePath = [];
			for(var j=0;mapControl.GoogleMap.Lines[i].Points[j]!=undefined;j++)
			{
				polygonLinePath[j] = new google.maps.LatLng(mapControl.GoogleMap.Lines[i].Points[j].PointLat, mapControl.GoogleMap.Lines[i].Points[j].PointLong);   
			}
			opacity = (mapControl.GoogleMap.Lines[i].LineStrokeOpacity==0)?1.0:mapControl.GoogleMap.Lines[i].LineStrokeOpacity;
			weight = (mapControl.GoogleMap.Lines[i].LineStrokeWeight==0)?2:mapControl.GoogleMap.Lines[i].LineStrokeWeight;
			color = (mapControl.GoogleMap.Lines[i].LineStrokeColor=="")?"#FF0000":mapControl.GoogleMap.Lines[i].LineStrokeColor;
			
			var polyline = new google.maps.Polyline({path:polygonLinePath , strokeColor:color, strokeWeight:weight, strokeOpacity:opacity,map: map}    );    
			polyline.setMap(map);
			//polygons.push(polyline);
		}
	}
	
	if (mapControl.GoogleMap.Polygons) {
        //Polygons
        for (var i = 0; !gx.lang.emptyObject(mapControl.GoogleMap.Polygons[i]); i++) {
            var polygonPath = [];

            //Get Paths
            for (var j = 0; mapControl.GoogleMap.Polygons[i].Paths[j] != undefined; j++) {
                polygonPath[j] = new google.maps.LatLng(mapControl.GoogleMap.Polygons[i].Paths[j].PathLat, mapControl.GoogleMap.Polygons[i].Paths[j].PathLong);

            }

            polFillColor = mapControl.GoogleMap.Polygons[i].PolygonFill; //"#00AAFF"
            polFillOpacity = mapControl.GoogleMap.Polygons[i].PolygonFillOpacity; //0.60
            polStrokeColor = mapControl.GoogleMap.Polygons[i].PolygonStroke; //"#FFAA00"
            polStrokeOpacity = mapControl.GoogleMap.Polygons[i].PolygonStrokeOpacity; //0.50
            polStrokeWeight = mapControl.GoogleMap.Polygons[i].PolygonStrokeWeight; //2
            polygonInfowin = mapControl.GoogleMap.Polygons[i].PolygonInfowinHtml;
            var polygon = new google.maps.Polygon({
                fillColor: polFillColor,
                fillOpacity: polFillOpacity,
                map: map,
                strokeColor: polStrokeColor,
                strokeOpacity: polStrokeOpacity,
                strokeWeight: polStrokeWeight,
                paths: polygonPath,
                htmlinfo: polygonInfowin
            });

			polygons.push(polygon);
            //Associate Polygon to infowin				   		
            if (!gx.lang.emptyObject(polygonInfowin)) {

                //InfoWin
                google.maps.event.addListener(polygon, 'click', function (event) {
                    var infowindow = new google.maps.InfoWindow();
                    infowindow.setContent(this.htmlinfo);
                    infowindow.setPosition(event.latLng);
                    infowindow.open(polygon.map);
					
					//agregar el marker SOLO para dentro del poligono, sino no lo toma
					var location = event.latLng;            
					var markerOpts = {
					position: location,
					map: map,
					draggable: true,
					clickable: false,                
					title: ""
					};
					var marker = createMarker(markerOpts);
			
					//Replace Marker object
					markers.push(marker);
					ControlAddMarker(marker, mapControl);
			
                });
            }
        }
    }
	
	//Routing
	if(mapControl.GoogleMap.Routing) {
		//alert("Es un objeto"+mapControl.Travel_Mode);
		//tsp = new BpTspSolver(map, null);
		for (var i = 0; mapControl.GoogleMap.Routing[i] != undefined; i++) {
	            //alert( mapControl.GoogleMap.Ruta[i].Latitud + ", " + mapControl.GoogleMap.Ruta[i].Longitud);
			addWaypointWithLabel(new google.maps.LatLng(mapControl.GoogleMap.Routing[i].Latitude, mapControl.GoogleMap.Routing[i].Longitude), mapControl.GoogleMap.Routing[i].Description, mapControl.GoogleMap.Routing[i].Pin);
		}
		if (mapControl.Travel_Mode == 1)
		{
			directions(0, false, true);
		}
		if (mapControl.Travel_Mode == 2)
		{
			directions(0, true, true);
		}
	}

	
	//KML 
	if (mapControl.KML=true){
		var ctaLayer = new google.maps.KmlLayer({
		url: 'http://' + mapControl.KMLURL});
		ctaLayer.setMap(map);	 
	}
	//if (!GoogleMapControl.IsPostBack)
		initializeMapHandlers();
    
    //}
}
////////////////Config Marker Listeners

function initializeMapHandlers()
{
////////////////Config Map Listeners
    google.maps.event.addListener(map, 'zoom_changed', function () {
        var zoomLevel = map.getZoom();
        if (zoomLevel == 0) {
            zoomLevel = 10;
            map.setZoom(zoomLevel);
        }
    });


    if (mapControl.Onclick == 'add_Marker') //center and add a marker on the map 
    {
        google.maps.event.addListener(map, 'click', function (event) {
            var location = event.latLng;     
				
			var markerOpts = {
				position: location,
                map: map,
                draggable: true,
                clickable: false,                
                title: ""
            };
			var marker = createMarker(markerOpts);

            //Save Marker object
            markers.push(marker);			
			ControlAddMarker(marker, mapControl);
            //Center the map
            if (mapControl.CenterWhenClick) map.setCenter(location);

            SetMarkerDragEndListeners(marker);
            SetMarkerDobleClickListener(marker);
            ControlSetLocation(location);
			if (mapControl.Click)
				mapControl.Click();
        });
    }
    if (mapControl.Onclick == 'getvalue') {
	
		 google.maps.event.addListener(map, 'click', function (event) {
            var location = event.latLng;            
			clearAllPoints();    //ClearAllMarkers();
	
			var markerOpts = {
				position: location,
                map: map,
                draggable: true,
                clickable: false,                
                title: ""
            };
			var marker = createMarker(markerOpts);
			
            //Replace Marker object
            markers.push(marker);
			ControlAddMarker(marker, mapControl);
            if (mapControl.CenterWhenClick) map.setCenter(location);

            SetMarkerDragEndListeners(marker);
            SetMarkerDobleClickListener(marker);
            ControlSetLocation(location);
			if (mapControl.Click)
				mapControl.Click();
        });		   
    }
    if (mapControl.Onclick == 'set_return') //Return for prompts. 
    {
        google.maps.event.addListener(map, 'click', function (event) {
            var returnValue = event.latLng.lat() + "," + event.latLng.lng();
            gx.popup.gxReturn([returnValue]);
        });
    }
}
function SetMarkerDragEndListeners(marker) {
    //Allows drag and set the latLng when dragend
    google.maps.event.addListener(marker, 'dragend', function (event) {
        var location = event.latLng;
        marker.map.setCenter(location);
        ControlSetLocation(location);
		ControlAddMarker(marker, mapControl);  
    });
}
function createInfoWin(position){
	var infowin2 = "<B>Latitude: </B>" + position.lat() + "<Br>";
	infowin2 += "<B>Longitude: </B>" + position.lng() + "<Br>";
	return infowin2;
}
function createMarker(markerOpts){	
	infowin2 = createInfoWin(markerOpts.position);;
	var infowindow = new google.maps.InfoWindow({
		content: infowin2,
		position:markerOpts.position
	});
	
	var marker = new google.maps.Marker(markerOpts);
	
	google.maps.event.addListener(marker, 'click', function() {
		infowindow.open(map,marker);
	});
	return marker;
}

function clearAllPoints(){
	for (var i = 0; i< markers.length; i++)
	{		
		this.markers[i].setMap(null);		
	}
	this.markers = [];
	mapControl.GoogleMap.Points = [];
}

function clearAllMarkers(){
	for (var i = 0; i< markers.length; i++)
	{		
		this.markers[i].setMap(null);		
	}
	this.markers = [];
	for (var i = 0; i< polygons.length; i++)
	{		
		this.polygons[i].setMap(null);		
	}
	this.polygons = [];
}
function SetMarkerDobleClickListener(marker) {
    //Delete when dobleclick
    google.maps.event.addListener(marker, 'dblclick', function (event) {
        marker.setMap(null);
		mapControl.GoogleMap.Points.splice(marker.idx, 1);
    });
}
function ControlSetLocation(location) {
    mapControl.SetClickLatitude(location.lat().toString());
    mapControl.SetClickLongitude(location.lng().toString());
	
    if (document.getElementById(mapControl.InformationControl.toUpperCase())) 
		document.getElementById(mapControl.InformationControl.toUpperCase()).innerHTML = location;
}
function GetGoogleMapCenter(GoogleMapControl) {  
	var myLatLng;
    Coord = GoogleMapControl.City;    
    if (!gx.lang.emptyObject(Coord) && Coord != "0,0"){
		Coord = Coord.split(',');
		myLatLng = new google.maps.LatLng(Coord[0], Coord[1]);
	}
    else
	{
		var latitude  = GoogleMapControl.Latitude  || GoogleMapControl.GoogleMap.MapLatitude;
		var longitude = GoogleMapControl.Longitude || GoogleMapControl.GoogleMap.MapLongitude;
		if ( !gx.lang.emptyObject(latitude) && !gx.lang.emptyObject(longitude) ) 
			myLatLng = new google.maps.LatLng(latitude, longitude);   
	}
    return myLatLng;
}

function GetGoogleMapData(GoogleMapControl) {
    if(GoogleMapControl.Provider=='GOOGLE')
	{
		GoogleMapControl.GoogleMap.MapZoom = map.getZoom();
		GoogleMapControl.GoogleMap.MapLatitude = map.center.lat();
		GoogleMapControl.GoogleMap.MapLongitude = map.center.lng();
		GoogleMapControl.GoogleMap.MapType = ControlMapGetType(map.mapTypeId);
	}
    return GoogleMapControl.GoogleMap;
}


function ControlAddMarker(marker, mapControl) {
	if (!mapControl.GoogleMap.Points)
		mapControl.GoogleMap.Points = [];
	var idx = (marker.idx != undefined)? marker.idx : mapControl.GoogleMap.Points.length;
    mapControl.GoogleMap.Points[idx] = {
        PointLat: marker.position.lat(),
        PointLong: marker.position.lng(),
        PointDraggable: marker.draggable,
        PointInfowinTit: marker.title,
        PointInfowinHTML: marker.htmlinfo,
        PointInfowinDesc: "",
        PointInfowinLink: "",
        PointInfowinImg: ""
    };
	marker.idx = idx;
}

function GoogleMapGetType(ControlType) {
    // Map Type
    switch (ControlType) {
    case TYPE_NORMAL:
        type = google.maps.MapTypeId.ROADMAP;
        break;
    case TYPE_SATELLITE:
        type = google.maps.MapTypeId.SATELLITE;
        break;
    case TYPE_HYBRID:
        type = google.maps.MapTypeId.HYBRID;
        break;
    case TYPE_TERRAIN:
        type = google.maps.MapTypeId.TERRAIN;
        break;
    default:
        type = google.maps.MapTypeId.ROADMAP;
    }
    return type;
}

function ControlMapGetType(GoogleType) {
    // Map Type
    switch (GoogleType) {
    case google.maps.MapTypeId.ROADMAP:
        type = TYPE_NORMAL;
        break;
    case google.maps.MapTypeId.SATELLITE:
        type = TYPE_SATELLITE;
        break;
    case google.maps.MapTypeId.HYBRID:
        type = TYPE_HYBRID;
        break;
    case google.maps.MapTypeId.TERRAIN:
        type = TYPE_TERRAIN;
        break;
    }
    return type;
}

function GoogleMapGetNavigationStyle(style) {
    // Navigation Style
    switch (style) {
    case "DEFAULT":
        googleStyle = google.maps.NavigationControlStyle.DEFAULT;
        break;
    case "ANDROID":
        googleStyle = google.maps.NavigationControlStyle.ANDROID;
        break;
    case "SMALL":
        googleStyle = google.maps.NavigationControlStyle.SMALL;
        break;
    case "ZOOM_PAN":
        googleStyle = google.maps.NavigationControlStyle.ZOOM_PAN;
        break;
    }
    return googleStyle;
}

function GoogleMapGetTypeStyle(style) {
    // Navigation Style
    switch (style) {
    case "DEFAULT":
        googleStyle = google.maps.MapTypeControlStyle.DEFAULT;
        break;
    case "DROPDOWN_MENU":
        googleStyle = google.maps.MapTypeControlStyle.DROPDOWN_MENU;
        break;
    case "HORIZONTAL_BAR":
        googleStyle = google.maps.MapTypeControlStyle.HORIZONTAL_BAR;
        break;
    }
    return googleStyle;
}

function GoogleGetIcon(pointicon) {
    // Create our "tiny" marker icon
    switch (pointicon) {
    case "Blue":
        iconImage = "https://github.com/googlemaps/js-v2-samples/tree/gh-pages/markers/blue/blank.png";
        break;
    case "Green":
        iconImage = "https://github.com/googlemaps/js-v2-samples/tree/gh-pages/markers/green/blank.png";
        break;
    case "Orange":
        iconImage = "https://github.com/googlemaps/js-v2-samples/tree/gh-pages/markers/orange/blank.png";
        break;
    case "Red":
        iconImage = "https://github.com/googlemaps/js-v2-samples/tree/gh-pages/markers/red/blank.png";
        break;
    case "Pink":
        iconImage = "https://github.com/googlemaps/js-v2-samples/tree/gh-pages/markers/pink/blank.png";
        break;
    case "BlueC":
        iconImage = "https://github.com/googlemaps/js-v2-samples/tree/gh-pages/markers/circular/bluecirclemarker.png";
        break;
    case "GreenC":
        iconImage = "https://github.com/googlemaps/js-v2-samples/tree/gh-pages/markers/circular/greencirclemarker.png";
        break;
    case "YellowC":
        iconImage = "https://github.com/googlemaps/js-v2-samples/tree/gh-pages/markers/circular/yellowcirclemarker.png";
        break;
	case "Default":
        iconImage = "http://maps.gstatic.com/mapfiles/markers2/marker_sprite.png";
        break;
	case "":
        iconImage = "http://maps.gstatic.com/mapfiles/markers2/marker_sprite.png";
        break;
    default:
        iconImage = pointicon;
        break;
    }

    //Si se quiere agregar más argumentos MarkerImage(url:string, size?:Size, origin?:Point, anchor?:Point, scaledSize?:Size)
	markerImage = new google.maps.MarkerImage(iconImage,
      // This marker is 20 pixels wide by 32 pixels tall.
      //new google.maps.Size(20, 32),
	  new google.maps.Size(mapControl.IconWidth, mapControl.IconHeigth),
      // The origin for this image is 0,0.
      new google.maps.Point(0,0),
      // The anchor for this image is the base of the flagpole at 0,32.
      new google.maps.Point(mapControl.AnchorLeft, mapControl.AnchorTop));
    return markerImage;
}

/************************ YAHOO PROVIDER CODE ***********************************/
/********************************************************************************/

function YahooCreateMarker(point, title) {
  var marker= new YMarker(point);
  YEvent.Capture(marker, EventsList.MouseClick, function(){marker.openSmartWindow(title);});
  return marker;
}

           
function YahooShow(GxMapControl){
    var mapControl=GxMapControl;
    document.getElementById(mapControl.ContainerName).innerHTML = '<div id="' + mapControl.ContainerName + '_MAP" style="width: ' + mapControl.Width + 'px; height: ' + mapControl.Height + 'px;"></div>';
    var map = new YMap(document.getElementById(GxMapControl.ContainerName + '_MAP'));

    Coord = mapControl.City;
    Coord = Coord.split(',');
        
    if (Coord!="0,0") map.drawZoomAndCenter(new YGeoPoint(Coord[0],Coord[1]),parseInt(mapControl.Precision));
    else map.drawZoomAndCenter(new YGeoPoint(mapControl.Latitude,mapControl.Longitude),parseInt(mapControl.Precision));


    // Controls
    if (mapControl.Type_Control==CONTROL_TYPE_VISIBLE) map.addTypeControl();
    if (mapControl.Small_Zoom_Control==CONTROL_SMALL_ZOOM_VISIBLE) map.addZoomShort();
    if (mapControl.Scale_Control==CONTROL_SCALE_VISIBLE) map.addZoomScale(); else map.removeZoomScale();
    if (mapControl.Large_Control==CONTROL_LARGE_VISIBLE) {
        map.addPanControl();
        map.addZoomLong();
    }
    if (mapControl.Small_Control==CONTROL_SMALL_VISIBLE) {
        map.addPanControl();
        map.addZoomShort();
    }
    
    // Map Type
    switch (mapControl.Type)
    {
        case TYPE_NORMAL:
            map.setMapType(YAHOO_MAP_REG);        
            break;
        case TYPE_SATELLITE:
            map.setMapType(YAHOO_MAP_SAT);
            break;
        case TYPE_HYBRID:             
            map.setMapType(YAHOO_MAP_HYB);
            break;
    }
    
    // Points
    var point;
    var infowin;
    for(var i=0;mapControl.GoogleMap.Points[i]!=undefined;i++){
        point = new YGeoPoint(mapControl.GoogleMap.Points[i].PointLat, mapControl.GoogleMap.Points[i].PointLong);
        infowin = "<B>" + mapControl.GoogleMap.Points[i].PointInfowinTit + "</B><Br>";
        infowin += mapControl.GoogleMap.Points[i].PointInfowinDesc + "<Br>";
        infowin += "<A HREF=" + mapControl.GoogleMap.Points[i].PointInfowinLink + ">" + mapControl.GoogleMap.Points[i].PointInfowinLinkDsc + "</A>" + "<Br>";
        var varUrl = mapControl.GoogleMap.Points[i].PointInfowinImg;
        infowin += "<img src=" + '"' + varUrl + '"' + "/>" + "<Br>";
        map.addOverlay(YahooCreateMarker(point,infowin));
    }
}




/************************ BAIDU PROVIDER CODE ***********************************/
/********************************************************************************/






function BaiduShow(BaiduMapControl) {
    var mapControl = BaiduMapControl;		
	if (!mapControl.Ready)
    {
	
		var container = document.getElementById(mapControl.ContainerName);
		var mapContainer = document.createElement("div");
		mapContainer.setAttribute("id", mapControl.ContainerName + "_MAP");
		mapContainer.style.width = mapControl.Width + "px"
		mapContainer.style.height = mapControl.Height + "px";
		container.appendChild(mapContainer);
		map = new BMap.Map(mapContainer);		 
		mapControl.Ready = true;
	}
	else
	{	
			map.clearOverlays();  			
	}

	
	var Coord = mapControl.City;
	var point;
    Coord = Coord.split(',');    
    if (Coord!="0,0") 
	{
		point = new BMap.Point(Coord[1],Coord[0]); 
	}
    else 
	{
		point = new BMap.Point(mapControl.Longitude, mapControl.Latitude); 
	}
	map.centerAndZoom(point,parseInt(mapControl.Precision)); 
	map.enableScrollWheelZoom(); 
	BaiduDrawPoints(mapControl,map);
	BaiduDrawLines(mapControl,map);
}


function BaiduDrawLines(mapControl,map) {
	if (mapControl.GoogleMap.Lines!=undefined)
	{
		var opacity;
		var weight;
		var color;
		for(var i=0;mapControl.GoogleMap.Lines[i]!=undefined;i++)
		{
			var polygonPath = [];
			for(var j=0;mapControl.GoogleMap.Lines[i].Points[j]!=undefined;j++)
			{
				polygonPath[j] = new BMap.Point(mapControl.GoogleMap.Lines[i].Points[j].PointLong, mapControl.GoogleMap.Lines[i].Points[j].PointLat);   
			}
			opacity = (mapControl.GoogleMap.Lines[i].LineStrokeOpacity==0)?0.5:mapControl.GoogleMap.Lines[i].LineStrokeOpacity;
			weight = (mapControl.GoogleMap.Lines[i].LineStrokeWeight==0)?6:mapControl.GoogleMap.Lines[i].LineStrokeWeight;
			color = (mapControl.GoogleMap.Lines[i].LineStrokeColor=="")?"blue":mapControl.GoogleMap.Lines[i].LineStrokeColor;
			
			var polyline = new BMap.Polyline(polygonPath,  {strokeColor:color, strokeWeight:weight, strokeOpacity:opacity}    );    
			map.addOverlay(polyline);
		}
	}
}


function BaiduDrawPoints(mapControl,map)
{
	if (mapControl.GoogleMap.Points!=undefined)
	{
		for(var i=0;mapControl.GoogleMap.Points[i]!=undefined;i++)
		{
			var marker = new BMap.Marker(new BMap.Point(mapControl.GoogleMap.Points[i].PointLong, mapControl.GoogleMap.Points[i].PointLat));
			marker.addEventListener("click", function(obj){
				for(var i=0;mapControl.GoogleMap.Points[i]!=undefined;i++)
				{
					if ((mapControl.GoogleMap.Points[i].PointLong == obj.currentTarget.G.lng)&&(mapControl.GoogleMap.Points[i].PointLat == obj.currentTarget.G.lat))
					{
						var infowin = "<B>" + mapControl.GoogleMap.Points[i].PointInfowinTit + "</B><Br>";
						infowin += mapControl.GoogleMap.Points[i].PointInfowinDesc + "<Br>";
						infowin += "<A HREF=" + mapControl.GoogleMap.Points[i].PointInfowinLink + ">" + mapControl.GoogleMap.Points[i].PointInfowinLinkDsc + "</A>" + "<Br>";
						var varUrl = mapControl.GoogleMap.Points[i].PointInfowinImg;
						infowin += "<img src=" + '"' + varUrl + '"' + "/>" + "<Br>";
					}
				}
				
				var infoWindow1 = new BMap.InfoWindow(infowin);
				this.openInfoWindow(infoWindow1);}
			);	
			map.addOverlay(marker); 
		}
	}
}