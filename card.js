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
		 * @var string 	The unique card ID
		 */
		id: null,

		/**
		 * @var string 	OpenStreetMap API endpoint
		 */
		openStreetMapURL: "https://nominatim.openstreetmap.org/reverse?format=json&zoom=18",

		/**
		 * @var string 	The OpenWeatherMap API endpoint
		 */
		openWeatherApiURL: "http://api.openweathermap.org/data/2.5/weather",

		/**
		 * Init method
		 */
		init: function(id) {
			this.id = id;
			this.getGeoLoc(this);
		},

		/**
		 * Gets the geolocation from Navigator
		 * @param object self 	(this)
		 */
		getGeoLoc : function (self) {
	        var date = new Date,
	        	locData = self.getLocalStorageItem(self, "lat/lng");

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
	    	console.log(data);
	    },

	    /**
	     * Gets the weather data
	     * @param object self 	This object
	     * @param float lat 	The latitude
	     * @param float lng 	The longitude
	     */
	    getWeatherData: function(self, lat, lng) {
	    	var weather = self.getLocalStorageItem(self, lat+"/"+lng+"-weather");

	    	if (weather == null)
	    	{
	    		$.ajax({
	    			url: window.location.origin + '/api/default/jsonProxy',
					type: 'POST',
					headers: CiiMSDashboard.getRequestHeaders(),
	    			data: {
	    				"url": self.openWeatherApiURL+"?lat="+lat+"&lon="+lng
	    			},
	    			beforeSend: CiiMSDashboard.ajaxBeforeSend(),
	    			success: function(data, textStatus, jqXHR) {
	    				weather = data.response;
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
	    	console.log(data);
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
