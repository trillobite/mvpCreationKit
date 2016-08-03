

var $db = {
	ip: '54.69.133.73',

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

	send: function(request, dta) {
		var dfd = new $.Deferred();
		var send = {
			type: 'POST',
			dataType: 'json',
			url: $db.preventCache(request),
			success: function(data) {
				dfd.resolve(data);
			},
			error: function(data) {
				dfd.resolve(data);
			},
		};
		if(dta) {
			send.data = dta;
		}
		$.ajax(send);
		return dfd.promise();
	},

	getPackageList: function(group) {
		var dfd = new $.Deferred();
		var request = "http://"+$db.ip+"/Handlers/GetPackageList.aspx?";
		request += "Data=" + group.toString();
		console.log('request URL:', request);

		$db.send(request).done(function(data) {
			dfd.resolve(data);
		});

		return dfd.promise();
	},

	getCanvas: function(pricingFormID, photographerID) {
		var dfd = new $.Deferred();
		var request = "http://"+$db.ip+"/Handlers/CanvasGetPricingFormCanvases.aspx?";
		request += "PricingFormID=" + pricingFormID;
		request += ",&PhotographerID=" + photographerID;

		$db.send(request).done(function(data) {
			dfd.resolve(data);
		});

		return dfd.promise();
	},

	mkNwCanDef: function(PricingFormID, PricingFormCanvasDescription, PhotographerID) {
		var dfd = new $.Deferred();
		var request = "http://"+$db.ip+"/Handlers/CanvasNewPricingFormCanvas.aspx?";
		request += 'PricingFormID=' + PricingFormID;
		request += ('&' + 'PricingFormCanvasDescription=' + PricingFormCanvasDescription);
		request += ('&' + 'PhotographerID=' + PhotographerID);

		$db.send(request).done(function(data) {
			dfd.resolve(data);
		});

		return dfd.promise();
	},

	getCanJson: function(PricingFormCanvasID, PhotographerID) {
		var dfd = new $.Deferred();
		var request = "http://"+$db.ip+"/Handlers/CanvasGetPricingFormCanvas.aspx?";
		request += 'PricingFormCanvasID=' + PricingFormCanvasID;
		request += '&PhotographerID=' + PhotographerID;

		$db.send(request).done(function(data) {
			dfd.resolve(data);
		});

		return dfd.promise();
	},	
	
	svCanJson: function(PricingFormCanvasID, PhotographerID, DesignData) {
		var dfd = new $.Deferred();
		var request = 'http://'+$db.ip+'/Handlers/CanvasSavePricingFormCanvas.aspx?';
		request += 'PricingFormCanvasID=' + PricingFormCanvasID;
		request += '&PhotographerID=' + PhotographerID;

		$db.send(request, DesignData).done(function(data) {
			dfd.resolve(data);
		});
		
		return dfd.promise();
	},


	//fixed typo: 07/27/2016 handlers --> Handlers
	svCanImg: function(PhotographerID, FileName, content) {
		var dfd = new $.Deferred();
		var request = 'http://'+$db.ip+'/Handlers/CanvasSavePricingFormCanvasImage.aspx?';
		request += 'PhotographerID=' + PhotographerID;
		request += '&Filename=' + FileName;
		//remove the base64 header for Chrome compatibility.
		content = content.substring(content.indexOf('base64') + 6, content.length);
		//add compatible base64 header for Chrome compatibility.
		content = 'data:application/octet-stream;base64' + content;

		$db.send(request, content).done(function(data) {
			dfd.resolve(data);
		});

		return dfd.promise();
	},
};
