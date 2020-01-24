
//Call the APU key to see the map layout form MapBox
var APIKEY = "pk.eyJ1IjoidHlsZXJqb25lczMzMyIsImEiOiJjazQ0c2lveXUwMjNpM2VvMWIzY3JqYjdlIn0.qs167bl3hZgXnXr52A8OYA";

var defaultMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 17,
  id: "mapbox.streets",
  accessToken: APIKEY
});
//Make a map element
var map = L.map("map", {
  center: [
    39.7, -95.5],
  	zoom: 4
});
//Add tile layer to the map element
defaultMap.addTo(map);

//Call the geojson api
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {
  		
      function view(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      //apply color fill function with a blank default color
      fillColor: addColor(feature.properties.mag),
      radius: addRad(feature.properties.mag),
      color: "#000000",
      //initiate the stroke and the weight
      stroke: true,
      weight: 0.5
    };
  }

  function addColor(magnitude) {
  //make the color depth for each magnitude on the map
  var colors = ['#ea2c2c','#ee00ab','#d200ee','#9b00ee','#6300ee','#0077ee'];

  return  magnitude > 5? colors[5]:
          magnitude > 4? colors[4]:
          magnitude > 3? colors[3]:
          magnitude > 2? colors[2]:
          magnitude > 1? colors[1]:
                      colors[0];
};


  //This determines the radius of the function
 function addRad(m) {
    if (m === 0) {
      return 1;}
    return m * 4;
  }

//Add a GeoJSON layer to the map
L.geoJson(data, {pointToLayer: function(feature, coord) {
      return L.circleMarker(coord);
    },
    //The style for each circleMarker using our style function.
    style: view,
    //Create a group of each marker and layer
    onEachFeature: function(feature, tile) {
    tile.bindPopup("Magnitude: " + feature.properties.mag 
        + "<br>Location: " + feature.properties.place);
    }
  }).addTo(map);

  //Here we create a legend control object.
  var controler = L.control({position: "bottomright"});

  // Apply the colors and details for the legend
  controler.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");
    //assign the levels of magnitude to the colors  
    var grades = [0, 1, 2, 3, 4, 5];
    var colors = ['#ea2c2c','#ee00ab','#d200ee','#9b00ee','#6300ee','#0077ee'];

    //Create a color square for each interval in the loop bellow
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML +="<i style='background: " 
        + colors[i] + "'></i> " +
        grades[i] + (grades[i + 1]  
        ? "&ndash;" + grades[i + 1] 
          + "<br>" : "+");
      }
    return div;
  };

  // Add the legend to the map.
  controler.addTo(map);
});

