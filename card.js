(function(){new CardPrototype({name:"WeatherCard",openStreetMapURL:"https://nominatim.openstreetmap.org/reverse?format=json&zoom=18",openWeatherApiURL:"http://api.openweathermap.org/data/2.5/weather",icons:{"01d":["sun"],"01n":["moon"],"02d":["cloud","sun"],"02n":["cloud","moon"],"03d":["cloud"],"03n":["cloud"],"04d":["cloud"],"04n":["cloud"],"09d":["cloud","showers"],"09n":["cloud","showers"],"10d":["cloud","sun","showers"],"10n":["cloud","moon","showers"],"11d":["cloud","lightning"],"11n":["cloud","lightning"],"13d":["cloud","snowflake"],"13n":["cloud","snowflake"],"50d":["haze","sun"],"50n":["haze","moon"]},init:function(){this.getGeoLoc()},getGeoLoc:function(){var t=this,e=new Date,o=t.getLocalStorageItem(t,"lat/lng");null==o||o.timestamp+6e5<e.getTime()?navigator.geolocation.getCurrentPosition(function(o){var a=parseFloat(o.coords.latitude).toFixed(2),n=parseFloat(o.coords.longitude).toFixed(2);t.setLocalStorageItem(t,"lat/lng",{lat:a,lng:n,timestamp:e.getTime()}),t.foundLocation(t,a,n)}):t.foundLocation(t,o.lat,o.lng)},foundLocation:function(t,e,o){t.getLocationData(t,e,o),t.getWeatherData(t,e,o)},kelvinToFarenheit:function(t){return(1.8*(t-273.15)+32).toFixed(0)},kelvinToCelsius:function(t){return(t-273.15).toFixed(0)},getLocationData:function(t,e,o){var a=t.getLocalStorageItem(t,e+"/"+o+"-location");null==a?$.get(t.openStreetMapURL+"&lat="+e+"&lon="+o,function(a){t.setLocalStorageItem(t,e+"/"+o+"-location",a.address),t.setLocationData(t,a.address)}):t.setLocationData(t,a)},setLocationData:function(t,e){var o=null;null!=e.city&&""!=e.city?o=e.city:null!=e.state&&""!=date.state&&(o=date.state),setTimeout(function(){$("#"+t.id+" .header .location").text(o)},100)},getWeatherData:function(t,e,o){var a=t.getLocalStorageItem(t,e+"/"+o+"-weather");null==a?$.ajax({url:window.location.origin+"/api/default/jsonProxy",type:"POST",headers:CiiMSDashboard.getRequestHeaders(),data:{url:t.openWeatherApiURL+"?lat="+e+"&lon="+o},success:function(n){a=n.response,t.setLocalStorageItem(t,e+"/"+o+"-weather",a),t.setWeatherData(t,a)}}):t.setWeatherData(t,a)},setWeatherData:function(t,e){var o=t.kelvinToFarenheit(e.main.temp),a=(t.kelvinToCelsius(e.main.temp),t.getIcon(t,e.weather[0].icon));setTimeout(function(){$.each(a,function(t){$("#5xpwrx65dx7gmn29 .weather").addClass(a[t])}),$("#"+t.id+" .header .temperature .degrees").text(o)},100)},getIcon:function(t,e){return t.icons[e]},getLocalStorageItem:function(t,e){return JSON.parse(localStorage.getItem(t.name+"/"+e))},setLocalStorageItem:function(t,e,o){return localStorage.setItem(t.name+"/"+e,JSON.stringify(o))}})})(this);