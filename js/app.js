//https://developers.google.com/maps/documentation/javascript/tutorial
var map;
let parko = "https://data.kortrijk.be/parko/shopandgo.xml";
let response
let timerid
let arrMarkers = ["Free", "Unknown", "Occupied"];
let markers = [];
let json

function initMenu() {
  //document.getElementById("menu").style.left = "-300px";
}

function setEvents() {
  document.getElementById("menu").addEventListener("mouseover", function() {
    slideOut();
  }, false);
  document.getElementById("menu").addEventListener("mouseout", function() {
    slideIn();
  }, false);
  document.getElementById("Free").addEventListener("change", function(e) {
    reDraw(e.target.value);
  }, false);
  document.getElementById("Occupied").addEventListener("change", function(e) {
    reDraw(e.target.value);
  }, false);
  document.getElementById("Unknown").addEventListener("change", function(e) {
    reDraw(e.target.value);
  }, false);
}

function reDraw(value) {
  console.info(value);
  //Indien de waarde nog niet aanwezig is.
  if (arrMarkers.indexOf(value) == -1) {
    console.log(value + " toegevoegd aan array")
    arrMarkers.push(value);
  }
  //Indien de waarde al in de array aanwezig is.
  else {
    if (arrMarkers.indexOf(value) != -1) {
      console.log(value + " verwijderen uit pos " + arrMarkers.indexOf(value))
      arrMarkers.splice(arrMarkers.indexOf(value), arrMarkers.indexOf(value) + 1);
    }
  }
  console.info(arrMarkers);
  setMarkers();
}

function slideOut() {
  let left = parseInt(document.getElementById("menu").style.left);

  if (left <= -10) {
    document.getElementById("menu").style.left = left + 10 + "px";

    timerid = setTimeout(function() {
      slideOut();
    }, 20);
  } else {
    timerid = clearTimeout(timerid);
    console.log("Eindigt op " + left)
  }
}

function slideIn() {
  let left = parseInt(document.getElementById("menu").style.left);

  if (left >= -300) {
    document.getElementById("menu").style.left = left - 10 + "px";

    timerid = setTimeout(function() {
      slideIn();
    }, 20);
  } else {
    timerid = clearTimeout(timerid);
    console.log("Eindigt op " + left)
  }
}

function initMap() {
  initMenu();
  setEvents();
  console.log('init');
  var myLatLng = {
    lat: 50.8277352,
    lng: 3.2634012
  };

  map = new google.maps.Map(document.getElementById('map'), {
    center: myLatLng,
    zoom: 16
  });
  getData(parko);
}

function getData(data) {
  console.info('getting data');
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", data);
  xmlhttp.send();

  xmlhttp.addEventListener("readystatechange", function() {
    if (this.readyState == 4 && this.status == 200) {
      response = this.responseText;
      setMarkers();
    }
  });

  xmlhttp.addEventListener("error", function(error) {
    window.alert(error);
  });
}

function setMarkers() {
  clearMarkers();
  json = convertXml2JSon(response);
  //console.info(json);
  for (sensor in json.Sensoren.Sensor) {
    let cur_sensor = json.Sensoren.Sensor[sensor];
    //We maken enkel een marker indien deze aangevinkt is in het menu
    if (arrMarkers.indexOf(cur_sensor._State) != -1) {
      if (cur_sensor._Lat != "" && cur_sensor._Long != "") {
        var pos = {
          lat: parseFloat(cur_sensor._Lat.replace(",", ".")),
          lng: parseFloat(cur_sensor._Long.replace(",", "."))
        };
        //console.info(pos);

        var color = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
        if (cur_sensor._State == "Free") {
          color = "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
        }
        if (cur_sensor._State == "Unknown") {
          color = "http://maps.google.com/mapfiles/ms/icons/orange-dot.png"
        }

        var marker = new google.maps.Marker({
          map: map,
          icon: color,
          title: cur_sensor._Street,
          position: pos
        });

        markers.push(marker);

        //Uitbreiding
        var infowindow = new google.maps.InfoWindow();
        google.maps.event.addListener(marker, 'click', (function(marker) {
          return function() {
            var content = cur_sensor._Street;
            infowindow.setContent(content);
            infowindow.open(map, marker);
          }
        })(marker));
      }
    }
  }
}

function clearMarkers() {
  setMapOnAll(null);
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

function convertXml2JSon(input) {
  var x2js = new X2JS();
  return x2js.xml_str2json(input);
}