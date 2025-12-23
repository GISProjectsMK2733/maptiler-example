import * as maptilersdk from "@maptiler/sdk";

import "@maptiler/sdk/dist/maptiler-sdk.css";

maptilersdk.config.apiKey = import.meta.env.VITE_MAPTLER_API_KEY || "";

const urlParams = new URLSearchParams(window.location.search);

const options: maptilersdk.MapOptions = {
  container: document.getElementById("map") as HTMLElement, // container's id or the HTML element in which SDK will render the map
  style: maptilersdk.MapStyle.STREETS,
  center: [-97.7485, 30.2711], // starting position [lng, lat]
  zoom: 11.7, // starting zoom
};

// Instanciating a map
const map: maptilersdk.Map = new maptilersdk.Map(options);

map.on("load", async () => {
  map.addSource("search-results", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  map.addLayer({
    id: "point-result",
    type: "circle",
    source: "search-results",
    paint: {
      "circle-radius": 8,
      "circle-color": "#B42222",
      "circle-opacity": 0.5,
    },
    filter: ["==", "$type", "Point"],
  });

  const query = urlParams.get("q");
  if (query) {
    const results = await maptilersdk.geocoding.forward(query);
    const source = map.getSource("search-results") as
      | maptilersdk.GeoJSONSource
      | undefined;
    if (source) {
      source.setData(results);
    }
    if (results.features[0]) {
      const bbox = results.features[0].bbox;
      if (bbox && bbox.length >= 4) {
        // Use only the first 4 elements if bbox has more than 4
        map.fitBounds(bbox.slice(0, 4) as [number, number, number, number], {
          maxZoom: 19,
        });
      }
    }
  }
});
