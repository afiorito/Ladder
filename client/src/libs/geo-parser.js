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
    errMessage = "You must enable geolocation to make a post."
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