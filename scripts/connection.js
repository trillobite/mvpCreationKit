

var $db = {
	preventCache: function(url) {
		return url + '&Rand='+Math.floor((Math.random() * 1000) + 1).toString();
	},

	getCanvas: function(pricingFormID, photographerID) {
		var dfd = new $.Deferred();
		var url = "http://www.mypicday.com/Handlers/CanvasGetPricingFormCanvases.aspx?PricingFormID=" + pricingFormID + ",&PhotographerID=" + photographerID;
		$sql($db.preventCache(url)).get(function(data) {
			dfd.resolve(data); //returns the resulting data within the resolve.
		});
		return dfd.promise();
	},

	getCanJson: function(PricingFormCanvasID, PhotographerID) {
		var dfd = new $.Deferred();
		var url = "http://www.mypicday.com/Handlers/CanvasGetPricingFormCanvas.aspx?";
		url += 'PricingFormCanvasID=' + PricingFormCanvasID;
		url += ('&' + 'PhotographerID=' + PhotographerID);
		$sql($db.preventCache(url)).get(function(data) {
			dfd.resolve(data); //returns the resulting data within the resolve.
		});
		return dfd.promise();
	},	
};
