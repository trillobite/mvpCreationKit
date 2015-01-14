

var $db = {
	preventCache: function(url) {
		return url + '&Rand='+Math.floor((Math.random() * 1000) + 1).toString();
	},

	getCanvas: function(pricingFormID, photographerID) {
		var dfd = new $.Deferred();
		var request = "http://www.mypicday.com/Handlers/CanvasGetPricingFormCanvases.aspx?PricingFormID=" + pricingFormID + ",&PhotographerID=" + photographerID;

                $.ajax({
                        type: 'GET',
                        dataType: 'jsonp',
                        url: request,
                        success: function(data) {
                                dfd.resolve(data);
                        },              
                        error: function(data) {
                                dfd.resolve(data);
                        },
                        
                });

		/*$sql($db.preventCache(url)).get(function(data) {
			dfd.resolve(data); //returns the resulting data within the resolve.
		});*/
		return dfd.promise();
	},

	mkNwCanDef: function(PricingFormID, PricingFormCanvasDescription, PhotographerID) {
		var dfd = new $.Deferred();
		var request = "http://www.mypicday.com/Handlers/CanvasNewPricingFormCanvas.aspx?";
		request += 'PricingFormID=' + PricingFormID;
		request += ('&' + 'PricingFormCanvasDescription=' + PricingFormCanvasDescription);
		request += ('&' + 'PhotographerID=' + PhotographerID);

                $.ajax({
                        type: 'GET',
                        dataType: 'jsonp',
                        url: request,
                        success: function(data) {
                                dfd.resolve(data);
                        },              
                        error: function(data) {
                                dfd.resolve(data);
                        },
                        
                });

		/*$sql($db.preventCache(url)).get(function(data) {
			dfd.resolve(data); //returns the resulting data within the resolve.
		});*/
		return dfd.promise();
	},

	getCanJson: function(PricingFormCanvasID, PhotographerID) {
		var dfd = new $.Deferred();
		var request = "http://www.mypicday.com/Handlers/CanvasGetPricingFormCanvas.aspx?";
		request += 'PricingFormCanvasID=' + PricingFormCanvasID;
		request += '&PhotographerID=' + PhotographerID;

                $.ajax({
                        type: 'GET',
                        dataType: 'jsonp',
                        url: request,
                        success: function(data) {
                                dfd.resolve(data);
                        },              
                        error: function(data) {
                                dfd.resolve(data);
                        },
                        
                });

		/*$sql($db.preventCache(url)).get(function(data) {
			dfd.resolve(data); //returns the resulting data within the resolve.
		});*/
		return dfd.promise();
	},	
	
	svCanJson: function(PricingFormCanvasID, PhotographerID, DesignData) {
		var dfd = new $.Deferred();
		var request = 'http://www.mypicday.com/Handlers/CanvasSavePricingFormCanvas.aspx?';
		request += 'PricingFormCanvasID=' + PricingFormCanvasID;
		request += '&PhotographerID=' + PhotographerID;
		request += '&DesignData=' + DesignData;
		console.log(request);

		$.ajax({
			type: 'GET',
			dataType: 'jsonp',
			url: request,
			success: function(data) {
				dfd.resolve(data);
			},		
			error: function(data) {
				dfd.resolve(data);
			},
			
		});

		/*$sql($db.preventCache(request)).get(function(data) {
			dfd.resolve(data); //returns the resulting data within the resolve.
		});*/
		return dfd.promise();
	},
};
