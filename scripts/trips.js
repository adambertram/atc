var lastOverlay = '';
var polygons=[];
var markerMapArray = [];
var heatMapArray = [];
var all_overlays = [];
var map, heatmap, drawingManager;

function initMap() {
	$('#info').toggle();
	map = new google.maps.Map(document.getElementById('map'), {
		center: {lat: 40.728229, lng: -73.988602},
		zoom: 10,
		maxZoom: 14
	});

	drawingManager = new google.maps.drawing.DrawingManager({
		drawingControl: true,
		drawingControlOptions: {
			position: google.maps.ControlPosition.TOP_CENTER,
			drawingModes: ['polygon']
		}
	});
	drawingManager.setMap(map);

	google.maps.event.addDomListener(drawingManager, "polygoncomplete", function(polygon) {
		polygons=null;
		polygons=polygon;
		checkMarker(polygons);
	});
	google.maps.event.addDomListener(drawingManager, "overlaycomplete", function(event){
		all_overlays.push(event);
		event.overlay.overlayType = event.type;
		lastOverlay = event.overlay; // Save it
		drawingManager.setDrawingMode(null);
		drawingManager.setOptions({
			drawingControl: true
		}); // Return to 'hand' mode 
	}); 
	google.maps.event.addListener(drawingManager, "drawingmode_changed", function() {
		if (drawingManager.getDrawingMode() != null && all_overlays.length) 
		  clearMap();
	});
	google.maps.event.addListener(map, 'click', clearMap);
	buildMarkers();
}

function clearHeatMap () {
	if(typeof(heatmap) == 'object'){
		heatMapArray = [];
		heatmap.setMap(null);
		heatmap = {};
	}
}

function clearMap() {
	clearHeatMap();
	for (var i=0; i < all_overlays.length; i++){
		all_overlays[i].overlay.setMap(null);
	}
	for(var j = 0; j < markerMapArray.length; j++){
		markerMapArray[j].setVisible(true);
		heatMapArray.push(new google.maps.LatLng(markerMapArray[j].position.lat(), markerMapArray[j].position.lng()));
	}
	all_overlays = [];
	$('#info').toggle();
	if(lastOverlay != '')
		lastOverlay.setMap(null)
	//rebuild heatmap to show everything
	buildHeatMap();
}

function checkMarker (polygons) {
	//check if markers are within drawn shape
	var mrkloc = '';
	var infoContent = '<ul>';
	var totalPickups = 0;
	var recCnt = 1;
	var contentHTML = '';
	var nullage = 'null';
	var derp = [];
	clearHeatMap();
	for(var j = 0; j < markerMapArray.length; j++){
		mrkloc = new google.maps.LatLng(markerMapArray[j].position.lat(), markerMapArray[j].position.lng());
		if(!google.maps.geometry.poly.containsLocation(mrkloc,polygons)){
			//removes visible markers not within shape
			markerMapArray[j].setVisible(false);
		}else{
			//build top 10 list and make sure markers that are within shape are showing
			if(recCnt < 11){
				infoContent += "<li style='display:block'>" + recCnt + '. <span onmouseover="markerMapArray['+markerMapArray[j].alocation+'].setAnimation(google.maps.Animation.BOUNCE);" onmouseout="markerMapArray['+markerMapArray[j].alocation+'].setAnimation(' + nullage + ')"><strong>' + markerMapArray[j].tripcount.toLocaleString() + "</strong>   ";
				infoContent += "(" + markerMapArray[j].coords + ")</span></li>";
			}
			totalPickups += markerMapArray[j].tripcount;
			recCnt++;
			markerMapArray[j].setVisible(true);
			heatMapArray.push(mrkloc);
		}
	}
	buildHeatMap();
	contentHTML += "<h4>Total Pickups For Area:</h4> " + totalPickups.toLocaleString() + "<br><br><h4> Top 10 Pickups: </h4>";
	contentHTML += '' + infoContent + '</ul>'
	$('#info').toggle();
	$('#info').html(contentHTML);
	
}

function buildMarkers () {
	$('#loading').toggle();
	$('#info').html('');
	var pickUpLoc = '';
	var dropOffLoc = '';
	var apiAction = 'tripstop'
	var startDate = $('#startdate').val();
	var endDate = $('#enddate').val();
	if(startDate == "" || enddate ==""){
		alert('Please select a start and end date');
		$('#loading').toggle();
		return false;
	}
	//remove any markers currently on map (if any)
	for(var j = 0; j < markerMapArray.length; j++){
		markerMapArray[j].setMap(null);
	}
	clearHeatMap();
	markerMapArray = [];

	$.ajax({
		method: "POST",
		url: "http://atc.adambertram.net:5000/" + apiAction,
		data: { startdate: startDate, enddate: endDate },
		error : function() {
			alert('There was an error fetching events.  Please try again');
		},
		success: function(data) {
			$('#loading').toggle();
			for(var j = 0; j < data.Items.length; j++){
				var thisRec = data.Items[j];
				thisRecLat = thisRec.coords.split(",")[0];
				thisRecLon = thisRec.coords.split(",")[1];
				pickUpLoc = new google.maps.LatLng(thisRecLat, thisRecLon);
				heatMapArray.push(pickUpLoc);
				var marker = new google.maps.Marker({
					position: pickUpLoc,
					icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
					map: map,
					tripcount: thisRec.count,
					alocation: j,
					coords: thisRec.coords
				});
				markerMapArray.push(marker);
			}
			buildHeatMap()
			
		}
	});
}

function buildHeatMap () {
	heatmap = {};
	heatmap = new google.maps.visualization.HeatmapLayer({
		data: heatMapArray,
		map: map
	});
	toggleHeatmap();
}


function toggleHeatmap() {
	var theval = $('#heatmaptoggle option:selected').val()
	var toggle = (theval == 'on' ? true : false)
	heatmap.setMap(toggle ? map : null);
}

var dateFormat = "yy-mm-dd",
	from = $( "#startdate" )
		.datepicker({
		  minDate: new Date(2014, 3, 1),
			maxDate: new Date(2014, 8, 30),
			defaultDate: new Date(2014, 3, 1),
			dateFormat: 'yy-mm-dd' 
		})
		.on( "change", function() {
			to.datepicker( "option", "minDate", getDate( this ) );
		}),
	to = $( "#enddate" ).datepicker({
		minDate: new Date(2014, 3, 1),
			maxDate: new Date(2014, 8, 30),
			defaultDate: new Date(2014, 4, 1),
			dateFormat: 'yy-mm-dd' 
	})
	.on( "change", function() {
		from.datepicker( "option", "maxDate", getDate( this ) );
	});

function getDate( element ) {
	var date;
	try {
		date = $.datepicker.parseDate( dateFormat, element.value );
	} catch( error ) {
		date = null;
	}

	return date;
}
