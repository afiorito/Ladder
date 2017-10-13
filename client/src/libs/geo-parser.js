import config from '../config';
import { includes } from 'lodash';

export function getCurrentPosition(callback) {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(async position => {
      let { latitude, longitude } = position.coords;
      resolve({ latitude, longitude });
    }, reject);
  });
}

export function displayLocationError(error) {
  let errMessage = "";
  switch(error.code) {
    case error.PERMISSION_DENIED:
    errMessage = "You must enable geolocation."
      break;
    case error.POSITION_UNAVAILABLE:
    errMessage = "Cannot get location information."
      break;
    case error.TIMEOUT:
    errMessage = "Request tp get location timed out."
      break;
    default:
      errMessage = "An unknown error occurred."
      break;
  }
  return errMessage;
}

export async function reverseGeocode({ latitude, longitude }) {
  const latlng = `${latitude},${longitude}`;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latlng}&key=${config.googleMaps.apiKey}`;
  const response = await fetch(url);
  const json = await response.json();
  
  let locationName;

  for(let i = 0; i < json.results.length; i++) {
    let result = json.results[i];
    if(includes(result.types, "political")) {
      locationName = result.formatted_address;
      break;
    }
  }

  if (locationName === undefined) return latlng;

  return locationName;
}
