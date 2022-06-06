import React, { useState, useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "./MapBox.css";

const axios = require("axios");

mapboxgl.accessToken =
  "----ygsdfg----";

const MapBox = ({ displayMap,selectedNhood }) => {
  const mapContainerRef = useRef(null);
  const [lng, setLng] = useState(-74.006);
  const [lat, setLat] = useState(40.7128);
  const [zoom, setZoom] = useState(10);

  const display_map = displayMap === false ? "no-display" : "display-element";
  const display_label = displayMap === false ? "display-element" : "no-display";


  console.log(selectedNhood);

  let map;
  useEffect(() => {
    setTimeout(() => {
      map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: "mapbox://styles/diegoleoro/cl3xszwup008y14l1b2kcmww9",
        center: [lng, lat],
        zoom: zoom
      });

      map.resize();
    }, 2000);
  }, []);

  //---- AXIOS REQUEST ----//
  axios
    .get(
      "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
      `${selectedNhood}` +
        ".json?access_token=" +
        "----ygsdfg----" +
        "&limit=1"
    )

  //--------//

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


