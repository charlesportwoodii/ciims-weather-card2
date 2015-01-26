;(function() {
	/**
	 * Weather Card
	 */
	var WeatherCard = new CardPrototype({

		/**
		 * @var string 	The name of this card
		 */
		name: "WeatherCard",

		/**
		 * @var string 	OpenStreetMap API endpoint
		 */
		openStreetMapURL: "https://nominatim.openstreetmap.org/reverse?format=json&zoom=18",

		/**
		 * @var string 	The OpenWeatherMap API endpoint
		 */
		openWeatherApiURL: "http://api.openweathermap.org/data/2.5/weather",

		/**
		 * @var timeout 	Status timeout
		 */
		completionTimeout: null,

		/**
		 * @var array		Status indicator
		 */
		ajaxStatus: {
			"location": false,
			"weather": false
		},

		/**
		 * Icon conversion
		 * @var object
		 */
		icons: {
			"01d": [ "sun" ],
			"01n": [ "moon" ],
			"02d": [ "cloud", "sun" ],
			"02n": [ "cloud", "moon" ],
			"03d": [ "cloud" ],
			"03n": [ "cloud" ],
			"04d": [ "cloud" ],
			"04n": [ "cloud" ],
			"09d": [ "cloud", "showers" ],
			"09n": [ "cloud", "showers" ],
			"10d": [ "cloud", "sun", "showers" ],
			"10n": [ "cloud", "moon", "showers" ],
			"11d": [ "cloud", "lightning" ], 
			"11n": [ "cloud", "lightning" ],
			"13d": [ "cloud", "snowflake" ], 
			"13n": [ "cloud", "snowflake" ],
			"50d": [ "haze", "sun" ],
			"50n": [ "haze", "moon" ]
		},

		init: function() {
			this.getGeoLoc();
		},

		startTimeout: function() {
			var self = this;
			$("#" + self.id + " #card-settings-button").addClass("fa-spin");

			self.completionTimeout = setTimeout(function() {
				if (self.ajaxStatus.weather == true && self.ajaxStatus.location == true)
					$("#" + self.id + " #card-settings-button").removeClass("fa-spin");
				else
					self.startTimeout()
			}, 1000);
		},

		/**
		 * Gets the geolocation from Navigator
		 * @param object self 	(this)
		 */
		getGeoLoc : function () {
	        var self = this,
	        	date = new Date,
	        	locData = self.getLocalStorageItem(self, "lat/lng");

	        self.startTimeout();

	        // Cache the lat/long data for 10 minutes
	        if (locData == null || locData.timestamp+600000 < date.getTime())
	        {
		        navigator.geolocation.getCurrentPosition(function(position) {
		        	var lat = parseFloat(position.coords.latitude).toFixed(2),
		        		lng = parseFloat(position.coords.longitude).toFixed(2);

		        	self.setLocalStorageItem(self, "lat/lng", {
			    		"lat": lat,
			    		"lng": lng,
			    		"timestamp": date.getTime()
			    	});
		        	
		        	self.foundLocation(self, lat, lng);
		        });
		    }
		    else
		    	self.foundLocation(self, locData.lat, locData.lng);
	    },

	    /**
	     * Utility wrapper method to call getLocationData and getWeatherData
	     * @param object self 	This object
	     * @param float lat 	The latitude
	     * @param float lng 	The longitude
	     */
	    foundLocation : function(self, lat, lng) {
	    	self.getLocationData(self, lat, lng);
	    	self.getWeatherData(self, lat, lng); 	
	    },

	    /**
	     * Converts kelvin to farenheit
	     * @param float kelvin
	     * @return float
	     */
	    kelvinToFarenheit: function(k) {
	    	return ((k - 273.15) * 1.8 + 32.00).toFixed(0);
	    },

	    /**
	     * Converts kelvin to celsius
	     * @param float kelvin
	     * @return float
	     */
	    kelvinToCelsius: function(k) {
	    	return (k - 273.15).toFixed(0);
	    },

	    /**
	     * Gets the location data
	     * @param object self 	This object
	     * @param float lat 	The latitude
	     * @param float lng 	The longitude
	     */
	    getLocationData: function(self, lat, lng) {
	    	var location = self.getLocalStorageItem(self, lat+"/"+lng+"-location");

	    	if (location == null)
	    	{
    			$.get(self.openStreetMapURL+"&lat="+lat+"&lon="+lng, function(data) {
    				self.setLocalStorageItem(self, lat+"/"+lng+"-location", data.address);
    				self.setLocationData(self, data.address);
    			});
	    	}
	    	else
		    	self.setLocationData(self, location);
	    },

	    /**
	     * Applies the location data
	     * @param object self 		(this)
	     * @param json data 	The JSON location data	
	     */
	    setLocationData: function(self, data) {
	    	var location = null;
	    	self.ajaxStatus.location = true;

	    	if (data.city != null && data.city != "")
	    		location = data.city;
	    	else if (data.state != null && data.state != "")
	    		location = data.state;

	    	setTimeout(function() {
	    		$("#" + self.id + " .header .location").text(location);
	    	}, 100);
	    },

	    /**
	     * Gets the weather data
	     * @param object self 	This object
	     * @param float lat 	The latitude
	     * @param float lng 	The longitude
	     */
	    getWeatherData: function(self, lat, lng) {
	    	var weather = self.getLocalStorageItem(self, lat+"/"+lng+"-weather"),
	    		date = new Date;

	    	if (weather == null || weather.timestamp+600000 < date.getTime())
	    	{
	    		$.ajax({
	    			url: window.location.origin + '/api/default/jsonProxy',
					type: 'POST',
					headers: CiiMSDashboard.getRequestHeaders(),
	    			data: {
	    				"url": self.openWeatherApiURL+"?lat="+lat+"&lon="+lng
	    			},
	    			success: function(data, textStatus, jqXHR) {
	    				weather = data.response;
	    				weather["timestamp"] = date.getTime();
	    				self.setLocalStorageItem(self, lat+"/"+lng+"-weather", weather);
    					self.setWeatherData(self, weather);
	    			}
	    		});
	    	}
	    	else
	    		self.setWeatherData(self, weather);
	    },

	    /**
	     * Applies the weather data
	     * @param object self 		(this)
	     * @param json data 		The JSON location data	
	     */
	    setWeatherData: function(self, data) {

	    	self.ajaxStatus.weather = true;

	    	var f = self.kelvinToFarenheit(data.main.temp),
	    		c = self.kelvinToCelsius(data.main.temp),
	    		icons = self.getIcon(self, data.weather[0].icon);

	    	setTimeout(function() {
	    		$.each(icons, function(i) {
    				$("#" + self.id + " .weather").addClass(icons[i]);
	    		});

	    		$("#" + self.id + " .header .temperature .degrees").text(f);
	    	}, 100);
	    },

	    getIcon: function(self, icon) {
	    	return self.icons[icon];
	    },

	    /**
	     * Retrieves a local storage data, utility method for this class
	     * @param object self 	This object
	     * @param string name	The name of the object to retrieve
	     * @return json
	     */
	    getLocalStorageItem: function(self, name) {
	    	return JSON.parse(localStorage.getItem(self.name+"/"+name));
	    },

	    /**
	     * Sets a local storage item, utility function
	     * @param object self	This object
	     * @param string name	The name of the object to save
	     * @param json json  	The data
	     * @return boolean
	     */
	    setLocalStorageItem: function(self, name, json) {
	    	return localStorage.setItem(self.name+"/"+name, JSON.stringify(json));
	    }
	});
}(this));
