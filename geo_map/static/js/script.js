var map = null;
var posReal = null;
var geocoder = null;
var marker_array = [];
var infowindow_array = [];
var overlay = null;
var marker_move = null;

$(document).on('ready',function(){

	//$('#ubigeo').val('150140 - SANTIAGO DE SURCO - LIMA - LIMA');
	//$('#direccion').val('CL 1 195 2 A MONTERRICO CHICO REF ALTURA CUADRA 2 3 DE CALL 3 MARIAS ESP HIPOD');
	var lat;
	var lng;
	var myLatlng;
		
	/*var options = {
	 	enableHighAccuracy: true,
	 	timeout: 5000,
	 	maximumAge: 0
	};*/

	//navigator.geolocation.getCurrentPosition(success, error, options);
	geocoder =  new google.maps.Geocoder();
	myLatlng = new google.maps.LatLng(-12.1167, -77.05);

	var myOptions = {
   		zoom: 13,
     	center: myLatlng,
     	mapTypeId: google.maps.MapTypeId.ROADMAP
   	};

   	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
   	overlay = new google.maps.OverlayView();
    overlay.draw = function() {};
    overlay.setMap(map);

    $("#image").draggable({
    	helper: 'clone',
		stop: function(e) {
	    	var point = new google.maps.Point(e.pageX-406,e.pageY-40);
	        var loca = overlay.getProjection().fromContainerPixelToLatLng(point);
	        placeMarker(loca);
	        get_PlaceMarker();
	        $("#image").draggable('disable');
	    }
    });

   	posReal =  add_marker(map, myLatlng);

   	$( "#ubigeo" ).autocomplete({
      	source: "cargar-autocomplete-ubigeo/",
      	minLength: 3,
      	select: function( event, ui ) {
        	$(this).val(ui.item.label);
        	$('#id_ubigeo').val(ui.item.id);
      	}
    });

});

function placeMarker(location) {
    marker_move = new google.maps.Marker({
	    position: location, 
	    map: map,
	    icon:'/static/img/common_pin.png',
	    draggable: true
    });

    marker_array.push(marker_move);
    google.maps.event.addListener(marker_move, 'dragend', function() 
	{
	    get_PlaceMarker();
	});
}

function get_PlaceMarker(){
	$('#xGeocoding').val(marker_move.getPosition().A);
	$('#yGeocoding').val(marker_move.getPosition().k);
}

function success(pos) {
	
 	var crd = pos.coords;
 	lat = crd.latitude;
 	lng = crd.longitude;

 	myLatlng = new google.maps.LatLng(lat, lng);

 	var myOptions = {
     	zoom: 13,
     	center: myLatlng,
     	mapTypeId: google.maps.MapTypeId.ROADMAP
   	};

   	map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
   	add_marker(map, myLatlng);
};

function error(err) {
 	console.warn('ERROR(' + err.code + '): ' + err.message);
};


function add_marker(map, myLatlng){
	var marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		icon: 'https://mts.googleapis.com/vt/icon/name=icons/spotlight/spotlight-waypoint-a.png&text=A&psize=16&font=fonts/Roboto-Regular.ttf&color=ff333333&ax=44&ay=48&scale=1'
	});
	marker_array.push(marker)
}

function send_peticion(){
	$("#image").draggable('enable');
	remove_marker();
	$.ajax({
		type: "GET",
		url: 'consume_web_service/',
		contentType: "text/xml",	
		dataType: "text",
		data: {
			ubigeo: $('#ubigeo').val().trim().substr(0, 6),
			adress: $('#direccion').val()
		},
		success: function (data){
			var d = data;
			var xmlHtml = $.parseHTML(data);
			$('#adress').html('');
			try{
				var sw = $(xmlHtml).find('ListofPuntosGeocodificados').text();
				if (sw != ""){
					var conter = 0;
					$(xmlHtml).find('ListofPuntosGeocodificados').children().each(function (index, value){
						conter ++;
						//var render = conter+'.-'+$(this).find('direcciongeocodificada').text() + ' ' + $(this).find('tipourbanizacion').text() + ' ' +$(this).find('nombreurbanizacion').text();
						var render = conter+'.-'+$(this).find('direcciongeocodificada').text();
						var renderAdress = $(this).find('direcciongeocodificada').text() + ' ' + $(this).find('tipourbanizacion').text() + ' ' +$(this).find('nombreurbanizacion').text();
						var parm = conter;
						$('#adress').append('<a href="#" onclick="coord(\''+$(this).find('xgeocodificado').text()+'\',\''+$(this).find('ygeocodificado').text()+'\',\''+parm+'\',\'' + render +'\')"><p>'+ render +'</p></a>');
						//$('#adress').append('<a onclick="test(\''+parm+'\')"><p>'+ render +'</p></a>');
						var lat = $(this).find('xgeocodificado').text();
						var lng = $(this).find('ygeocodificado').text();
						add_markers(lat, lng);

					});
					ZoomTotal();
				}else{
					codeAddress();
				}
				
			}catch(exp){
				var render = 'No hay direcciones disponibles ...'
				$('#adress').append('<p>'+ render +'</p>');
			}
		},
		error: function (request, status, error){
		}	
	});
}

function coord (x, y, post, adress){
	var latLng = new google.maps.LatLng(y,x);
	map.setCenter(latLng);
	map.setZoom(16);
	
	if (infowindow_array.length > 0){
		infowindow_array[0].close();
		infowindow_array = infowindow_array.splice(1, 1);
	}

	var infoWindow = new google.maps.InfoWindow({ 
		content: adress
	});
	infoWindow.open(map, marker_array[post]);
	infowindow_array.push(infoWindow)

	$('#adress_form').val(adress);
	$('#lat_form').val(y);
	$('#lng_form').val(x);
}

function codeAddress() {
	var ubigeo = $('#ubigeo').val().split('-');
  	var address = ubigeo[3].trim()+',' + ubigeo[1].trim()+','+ document.getElementById('direccion').value;
  	geocoder.geocode( { 'address': address}, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
    	for (var i = 0; i < results.length; i++){
    		var render = results[i].formatted_address;
    		var parm = i + 1;
			var lng = results[i].geometry.location.k;
    		var lat = results[i].geometry.location.A;
    		
    		$('#adress').append('<a href="#" onclick="coord(\''+lat+'\',\''+lng+'\',\''+parm+'\',\'' + render +'\')"><p>'+ render +'</p></a>');
    		//$('#adress').append('<p>'+ render +'</p>');
    		add_markers(lat,lng);
    	}
    } else {
      	alert('Geocode was not successful for the following reason: ' + status);
    }
    ZoomTotal();
  });
}

function add_markers(lat, lng){
	var myLatlng = new google.maps.LatLng(lng, lat)
	var marker = new google.maps.Marker({
		position: myLatlng,
		map: map,
		animation: google.maps.Animation.DROP
	});
	marker_array.push(marker);
}


function remove_marker(){
	for (var x = 1 ; x < marker_array.length; x++){
		marker_array[x].setMap(null)
	}
	marker_array = marker_array.splice(0, 1);
}

function ZoomTotal(){
	var boundsAll = new google.maps.LatLngBounds();
	for (var i = 0 ; i < marker_array.length ; i++ )
	{
		boundsAll.extend(marker_array[i].getPosition());
	}
	map.fitBounds(boundsAll);
	console.log(marker_array.length);
}
