'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;
var weatherArr = [];


app.get('/location', (request, response) => {
  try {
    // const locationData = require('./data/geo.json');
    let searchQuery = request.query.data;
    // let formattedAddress = locationData.results[0].formatted_address;
    // let latitude = locationData.results[0].geometry.location.lat;
    // let longitude = locationData.results[0].geometry.location.lng;

    // let locationInstance = new Place(searchQuery, formattedAddress, latitude, longitude);
    // response.status(200).send(locationInstance);
    // response.send(locationInstance);
    let googleGeocode = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GEOCODE_API_KEY}`;
    superagent.get(googleGeocode)
      .end((err, googleMapsApiResponse)=>{
        console.log(googleMapsApiResponse.body.results[0].geometry.location.lng);
        const locationInstance = new Place(searchQuery, googleMapsApiResponse.body.results[0].formatted_address, googleMapsApiResponse.body.results[0].geometry.location.lat, googleMapsApiResponse.body.results[0].geometry.location.lng);
        response.send(locationInstance);
      });

  } catch( error ) {
    console.log('Sorry, There was an Error');
    response.status(500).send('Sorry, There was an Error');
  }
});


app.get('/weather', (request, response) => {
  try {
    const weatherData = require('./data/darksky.json');
    weatherData.daily.data.map(function(weather) {
      new Weather(weather.summary, weather.time);
    });
    response.status(200).send(weatherArr);

  } catch( error ) {
    console.log('Sorry, There was an Error');
    response.status(500).send('Sorry, There was an Error');
  }
});


app.listen(PORT,()=> console.log(`Listening on port ${PORT}`));

function Place (searchQuery, formattedAddress, lat, lng) {
  this.search_query = searchQuery;
  this.formatted_query = formattedAddress;
  this.latitude = lat;
  this.longitude = lng;
}

function Weather (forecast, time) {
  this.forecast = forecast;
  this.time = new Date(time*1000).toDateString();
  weatherArr.push(this);
}
