import React, { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "./MapBox.css";

const axios = require("axios");

mapboxgl.accessToken =
  "pk.eyJ1IjoiZGllZ29sZW9ybyIsImEiOiJjbDN4ZnV5enUwdHo0M2RxaDJ1ZWoxdjh0In0.LF-oI9_49zOGCGxCCHgYKA";

const MapBox = ({ displayMap, selectedNhood, triggerZoom }) => {
  const mapContainerRef = useRef(null);
  const [lng, setLng] = useState(-74.006);
  const [lat, setLat] = useState(40.7128);
  const [zoom, setZoom] = useState(8.5);

  const display_map = displayMap === false ? "no-display" : "display-element";
  const display_label = displayMap === false ? "display-element" : "no-display";

  //------------------------------------------------------------------- //

  useEffect(() => {
    setTimeout(() => {
      // map();
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/diegoleoro/cl3xszwup008y14l1b2kcmww9",
        center: [lng, lat],
        zoom: zoom
      });

      map.resize();
    }, 2000);
  }, []);

  //------------------------------------------------------------------- //

  //---- AXIOS REQUEST ----//
  let coordinates;
  if (selectedNhood != "" && selectedNhood && triggerZoom) {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/diegoleoro/cl3xszwup008y14l1b2kcmww9",
      center: [lng, lat],
      zoom: zoom
    });
    axios
      .get(
        "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
          `${selectedNhood} New York, New York` +
          ".json?access_token=" +
          "-------------" +
          "&limit=1"
      )
      .then(res => {
        // console.log(res);

        coordinates = res.data.features[0].center;

        map.flyTo({
          center: coordinates,
          zoom: 12
        });

        map.on("load", function() {
          map.addLayer({
            id: "nyc-neighborhoods",
            source: {
              type: "vector",
              url: "mapbox://diegoleoro.aff9tmlv" // <--- Add the Map ID you copied here
            },
            "source-layer": "nyc-neighborhoods-2qrfoq", // <--- Add the source layer name you copied here
            type: "fill",
            paint: {
              "fill-color": "#f9f75d", //this is the color you want your tileset to have (I used a nice purple color),
              "fill-opacity": 0.2,
              "fill-outline-color": "#F2F2F2" //this helps us distinguish individual countries a bit better by giving them an outline
            }
          });

          console.log(selectedNhood)

          map.setFilter(
            "nyc-neighborhoods",
            ["in", "name"].concat([selectedNhood])
          );
        });

      });
  }

  // console.log(selectedNhood);

  return (
    <div className={"mbox-container " + display_map}>
      <div
        className={"_map_Box-container " + display_map}
        ref={mapContainerRef}
      ></div>
    </div>
  );
};

export default MapBox;

/*
      <div className={"tooltip " + display_label}>
        <div className="arrow_box">
          <p>This information is important so we can connect you </p>
          <p> to potential visitors to your neighborhood </p>
        </div>
      </div>

*/
