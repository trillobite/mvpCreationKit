

var $db = {
	preventCache: function(url) {
		return url + '&Rand='+Math.floor((Math.random() * 1000) + 1).toString();
	},

	imageExists: function(url) {
		var dfd = new $.Deferred();
		var test = function() {
			var nImg = document.createElement('img');
			nImg.onload = function() {
			    // image exists and is loaded
			    dfd.resolve(true);
			}
			nImg.onerror = function() {
			    // image did not load
			    dfd.resolve(false);
			}
			nImg.src = url;	
		};
		test();
		return dfd.promise();
	},

	getCanvas: function(pricingFormID, photographerID) {
		var dfd = new $.Deferred();
		var request = "http://54.69.133.73/Handlers/CanvasGetPricingFormCanvases.aspx?";
		request += "PricingFormID=" + pricingFormID;
		request += ",&PhotographerID=" + photographerID;

		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: $db.preventCache(request), //preventCache prevents browsers like internet explorer from caching the previous results.
			success: function(data) {
				dfd.resolve(data);
			},              
			error: function(data) {
				dfd.resolve(data);
			},
		});

		return dfd.promise();
	},

	mkNwCanDef: function(PricingFormID, PricingFormCanvasDescription, PhotographerID) {
		var dfd = new $.Deferred();
		var request = "http://54.69.133.73/Handlers/CanvasNewPricingFormCanvas.aspx?";
		request += 'PricingFormID=' + PricingFormID;
		request += ('&' + 'PricingFormCanvasDescription=' + PricingFormCanvasDescription);
		request += ('&' + 'PhotographerID=' + PhotographerID);

		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: $db.preventCache(request), //preventCache prevents browsers like internet explorer from caching the previous results.
			success: function(data) {
				dfd.resolve(data);
			},              
			error: function(data) {
				dfd.resolve(data);
			},
		});

		return dfd.promise();
	},

	getCanJson: function(PricingFormCanvasID, PhotographerID) {
		var dfd = new $.Deferred();
		var request = "http://54.69.133.73/Handlers/CanvasGetPricingFormCanvas.aspx?";
		request += 'PricingFormCanvasID=' + PricingFormCanvasID;
		request += '&PhotographerID=' + PhotographerID;

		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: $db.preventCache(request), //preventCache prevents browsers like internet explorer from caching the previous results.
			success: function(data) {
				dfd.resolve(data);
			},              
			error: function(data) {
				dfd.resolve(data);
			},
		});

		return dfd.promise();
	},	
	
	svCanJson: function(PricingFormCanvasID, PhotographerID, DesignData) {
		var dfd = new $.Deferred();
		var request = 'http://54.69.133.73/Handlers/CanvasSavePricingFormCanvas.aspx?';
		request += 'PricingFormCanvasID=' + PricingFormCanvasID;
		request += '&PhotographerID=' + PhotographerID;

		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: $db.preventCache(request), //preventCache prevents browsers like internet explorer from caching the previous results.
			data: DesignData,
			success: function(data) {
				dfd.resolve(data);
			},		
			error: function(data) {
				dfd.resolve(data);
			},
			
		});
		
		return dfd.promise();
	},

	svCanImg: function(PhotographerID, FileName, content) {
		var dfd = new $.Deferred();
		var request = 'http://54.69.133.73/handlers/CanvasSavePricingFormCanvasImage.aspx?';
		request += 'PhotographerID=' + PhotographerID;
		request += '&Filename=' + FileName;
		//remove the base64 header for Chrome compatibility.
		content = content.substring(content.indexOf('base64') + 6, content.length);
		//add compatible base64 header for Chrome compatibility.
		content = 'data:application/octet-stream;base64' + content;

		$.ajax({
			type: 'POST',
			dataType: 'json',
			url: $db.preventCache(request), //preventCache prevents browsers like internet explorer from caching the previous results.
			data: content,
			success: function(data) {
				dfd.resolve(data);
			},		
			error: function(data) {
				dfd.resolve(data);
			},
			
		});

		return dfd.promise();
	},
};
