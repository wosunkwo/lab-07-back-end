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
    let searchQuery = request.query.data;
    let googleGeocode = `https://maps.googleapis.com/maps/api/geocode/json?address=${searchQuery}&key=${process.env.GEOCODE_API_KEY}`;
    superagent.get(googleGeocode)
      .end((err, googleMapsApiResponse)=>{
        const locationInstance = new Place(searchQuery, googleMapsApiResponse.body.results[0].formatted_address, googleMapsApiResponse.body.results[0].geometry.location.lat, googleMapsApiResponse.body.results[0].geometry.location.lng);
        response.send(locationInstance);
        weatherFunc(googleMapsApiResponse.body.results[0].geometry.location.lat, googleMapsApiResponse.body.results[0].geometry.location.lng);
      });

  } catch( error ) {
    console.log('Sorry, There was an Error');
    response.status(500).send('Sorry, There was an Error');
  }
});

function weatherFunc(lat, lng){
  app.get('/weather', (request, response) => {
    weatherArr = [];
    try {
      let darkskyWeatherData = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${lat},${lng}`;
      superagent.get(darkskyWeatherData)
        .end((err, darkskyApiResponse)=>{
          for(let i =0; i < 8; i++){
            new Weather(darkskyApiResponse.body.daily.data[i].summary, darkskyApiResponse.body.daily.data[i].time);
            console.log(darkskyApiResponse.body.daily.data[i].summary);
          }
        });
      response.send(weatherArr);
    } catch( error ) {
      console.log('Sorry, There was an Error');
      response.status(500).send('Sorry, There was an Error');
    }
  });
}

app.listen(PORT,()=> console.log(`Listening on port ${PORT}`));

//Location constructor
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
