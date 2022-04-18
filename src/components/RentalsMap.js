import React, { useState, useEffect } from "react";
import {
  Map,
  Marker,
  GoogleApiWrapper,
} from "google-maps-react";

function RentalsMap({ locations, google, setHighlight }) {
  const [center, setCenter] = useState();

  useEffect(() => {
    let arr = Object.keys(locations);
    let getLat = (key) => locations[key]["lat"];
    let avgLat = arr.reduce((a, c) => a + Number(getLat(c)), 0) / arr.length;
    let getLong = (key) => locations[key]["long"];
    let avgLong = arr.reduce((a, c) => a + Number(getLong(c)), 0) / arr.length;

    setCenter({
      lat: avgLat,
      lng: avgLong,
    })
  }, [locations]);

  return (
    <>
      {
        center && (
          <Map
            google={google}
            containerStyle={{
              width: "50vw",
              height: "calc(100vh - 135px)"
            }}
            center={center}
            initialCenter={locations[0]}
            zoom={13}
            disabledDefaultUI={true}
          >
            {
              locations.map((coord, coordKey) => {
                return (
                  <Marker
                    position={coord}
                    onClick={() => {
                      setHighlight(coordKey);
                    }}
                  />
                )
              })
            }
          </Map>
        )
      }
    </>
  );
}

export default GoogleApiWrapper({
  apiKey: ""
})(RentalsMap);
