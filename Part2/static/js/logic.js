
//Allocate the API key here to view map
var apiKey = "pk.eyJ1IjoidHlsZXJqb25lczMzMyIsImEiOiJjazQ0c2lveXUwMjNpM2VvMWIzY3JqYjdlIn0.qs167bl3hZgXnXr52A8OYA";

//The provides a gray background for this map
var defaultMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 19,
  id: "mapbox.light",
  accessToken: apiKey
});

//This applies the outdoor attribute
var outdoorsMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 19,
  id: "mapbox.outdoors",
  accessToken: apiKey
});

//This layer applies the sattilite attribute
var satelliteMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href='https://www.openstreetmap.org/'>OpenStreetMap</a> contributors, <a href='https://creativecommons.org/licenses/by-sa/2.0/'>CC-BY-SA</a>, Imagery © <a href='https://www.mapbox.com/'>Mapbox</a>",
  maxZoom: 19,
  id: "mapbox.streets-satellite",
  accessToken: apiKey
});

//I added the tile layers to an array of layers
var map = L.map("map", {
  center: [
  39.7, -95.5
],
  zoom: 4,
  //Add new layers
  layers: [defaultMap, satelliteMap, outdoorsMap]
});

// Add defaultMap tile layer to the map
defaultMap.addTo(map);

//Add the datasets to the earthquake layer
var earthquake = new L.LayerGroup();
//Add the datasets to the tectonic layer
var tectonic = new L.LayerGroup();

//I chained all of the maps together here
var layeredMaps = { Satellite: satelliteMap, Grayscale: defaultMap, Outdoors: outdoorsMap };

//Apply all of the overlays towards this function
var overlayers = { "Tectonic Plates": tectonic, Earthquakes: earthquake };

//A switch board for the user to switch between layers
L.control.layers(layeredMaps, overlayers).addTo(map);

// Get the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function(data) {

  function view(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      //apply color fill function with a blank default color
      fillColor: addColor(feature.properties.mag),
      radius: addRad(feature.properties.mag),
      //Setting color to black
      color: "#000000",
      //initiate the stroke and the weight
      stroke: true,
      weight: 0.5
    };
  }

  // Function to assign color depends on the Magnitude
function addColor(magnitude) {

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

  // Here we add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {pointToLayer: function(feature, coord) {
      return L.circleMarker(coord);
    },
    //The style for each circleMarker using our style function.
    style: view,
    //Create a group of each marker and layer
    onEachFeature: function(feature, layer) {
      layer.bindPopup("Magnitude: " + feature.properties.mag 
        + "<br>Location: " + feature.properties.place);
    }
  }).addTo(earthquake);

  // Then we add the earthquake layer to our map.
  earthquake.addTo(map);

  // Here we create a legend control object.
  var controler = L.control({position: "bottomright"});

  // Apply the colors and details for the legend
  controler.onAdd = function() {
    var div = L
      .DomUtil
      .create("div", "info legend");
    //assign the levels of magnitude to the colors
    var grades = [0, 1, 2, 3, 4, 5];
    var colors = ["#0077ee", "#6300ee", "#9b00ee", "#d200ee", "#ee00ab", "#ea2c2c"];

    //Create a color square for each interval in the loop bellow    for (var i = 0; i < grades.length; i++) {
    for (var i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " 
      + colors[i] + "'></i> " 
      + grades[i] + (grades[i + 1] 
      ? "&ndash;" + grades[i + 1] 
        + "<br>" : "+");
    }
    return div;
  };

  // We add our legend to the map.
  controler.addTo(map);

  // Here we make an AJAX call to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(data) {
      // add JSON information to the tectonicplates
      
      L.geoJson(data, {color: "red",weight: 2}).addTo(tectonic);

      // Then add the tectonic layer to the map.
      tectonic.addTo(map);
    });
});
