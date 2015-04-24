Exit Now ionic mobile app
========================

Made for GoCodeCO hackathon 2015


# Installation
- Ensure Ionic CLI installed (and Cordova)

```sh
ionic start myMapDemo https://github.com/mikelockz/exit-now
cd myMapDemo
cordova plugin add org.apache.cordova.geolocation
ionic platform add ios
ionic platform add android
ionic serve
```

# Troubleshooting
You might need to remove and add mobile platforms again.

```sh
ionic platform remove android
ionic platform remove ios
ionic platform add android
ionic platform add ios
```
