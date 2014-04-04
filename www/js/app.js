/**
 *
 * @author Patrick Oladimeji
 * @date 3/19/14 14:49:12 PM
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, d3, require, $, brackets, window, Camera */
define(function(require, exports, module) {
	"use strict";
	var d3 = require("lib/d3"),
		db = require("Storage");
	var tileHeight, tileWidth;

	/** Uses native alert to notify and falls back on html alert */
	function _alert(msg) {
		if (navigator.notification) {
			navigator.notification.alert(msg);
		} else {
			alert(msg);
		}
	}

	/** Pop up an input dialog and return the result to promptCallback */
	function _prompt(msg, promptCallback, title, defaultText) {
		title = title || ""; // if title is false make it an empty string
		if (navigator.notification) {
			navigator.notification.prompt(msg, function(result) {
				if (result.buttonIndex === 1) { // ok was clicked
					promptCallback(result.input1);
				} else {
					promptCallback(null);
				}
			}, title, ["Ok", "Cancel"], defaultText);
		} else {
			var result = prompt(msg, defaultText, title);
			promptCallback(result);
		}
	}

	/** Pop up an input dialog to confirm a message */
	function _confirm(msg, promptCallback, title, okButton, cancelButton) {
		title = title || ""; // if title is false make it an empty string
		if (navigator.notification) {
			navigator.notification.confirm(msg, function(buttonIndex) {
				promptCallback(buttonIndex === 1); // index of 1 is ok; anything else is cancel
			}, title, [okButton, cancelButton]);
		} else {
			var result = confirm(msg);
			promptCallback(result);
		}
	}

	function share(imgDir) {
		function success(msg) {
			_alert(msg);
		}

		function error(err) {
			_alert("error " + err);
		}
		var names = d3.range(1, 10).map(function(d) {
			return db.get("box" + d + "name");
		}).join(",");
		window.plugins.socialsharing.share(names + " are in my #chi2014 Bingo", null, imgDir, null, success, error);
	}

	function renderImageAndShare(tiles) {
		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		tiles.forEach(function(imgStr, index) {
			var img = new Image();
			img.onload = function() {
				var x = (index % 3) * img.width,
					y = Math.floor(index / 3) * img.height;
				//set the size of the canvas based on the actual image size
				//only need to set it once at the beginning of the array loop
				if (index === 0) {
					canvas.width = img.width * 3;
					canvas.height = img.height * 3;
				}
				context.drawImage(img, x, y);
				//when we draw the final tile, save the picture to the photos library or do something else
				if (index === 8) {
					window.canvas2ImagePlugin.saveImageDataToLibrary(function(imgDir) {
						share(canvas.toDataURL());
					}, function(err) {
						_alert(err);
					}, canvas);
				}
			};
			img.src = imgStr;
		});
	}

	function getCompletedTiles() {
		//get the tiles saved in the store and filter any non truthy values (ie those that are undefined or null)
		var tiles = d3.range(1, 10).map(function(d) {
			var key = "box" + d + "image";
			return db.get(key);
		}).filter(function(d) {
			return d;
		});

		return tiles;
	}

	function updateShareButtonState() {
		var tiles = getCompletedTiles();
		if (tiles.length === 9) {
			// (not necessary, but left here after removing  disabled)
			d3.select("#share").classed("disabled", false);
		}
	}

	// Called when a photo is successfully retrieved
	function onPhotoDataSuccess(imageData, gridNumber) {
		//set the image data as background of the div

		///TODO need to do something clever? to figure out how much of the picture is shown
		var imgStr = "data:image/jpeg;base64," + imageData;
		d3.select("#" + gridNumber).style("background-image", "url(" + imgStr + ")");
		db.set(gridNumber + "image", imgStr);
		updateShareButtonState();
	}

	function capturePhoto(gridNumber) {
		if (navigator.camera) {
			//Take picture using device camera and retrieve image as base64-encoded string
			//creating a closure over the gridNumber variable so that we retain access to it
			navigator.camera.getPicture(function(imageData) {
				onPhotoDataSuccess(imageData, gridNumber);
			}, onPhotoFail, {
				correctOrientation: true,
				targetHeight: 200,
				targetWidth: 200,
				quality: 80,
				destinationType: Camera.DestinationType.DATA_URL
			});
		} else {
			_alert("Sorry, you need a camera to use CHI Bingo!");
		}
	}

	function onPhotoFail(message) {
		if (message != "Camera cancelled.") {
			alert("Couldn't take a picture because: " + message);
		}
	}

	/**
        sets the text in the span provided.
        @param span a jquery selection object  (e.g the result of a $("span.name"))
    */
	function setName(id) {
		var span = d3.select("#" + id + " .name");
		var currentName = span.html();
		var msg = "Enter the name of the person you want to meet: ",
			title = "Name a face";
		_prompt(msg, function(newName) {
			if (newName !== null) {
				span.html(newName);
				db.set(id + "name", newName);
			}
		}, title, currentName);
	}

	/**
        Figures out the width and height of the screen and updates the tile sizes
    */
	function fixTileWidthAndHeight() {
		var width = window.screen.width,
			bottomToolbarHeight = 40,
			height = window.screen.height - bottomToolbarHeight;
		//initialise tile height and width
		tileWidth = width / 3;
		tileHeight = height / 3;
		$("body").css({
			width: width + "px",
			height: height + "px"
		});
		$("div.tile").css({
			width: tileWidth + "px",
			height: tileHeight + "px"
		});
	}

	function registerTileEvents() {
		//register click handler for tiles
		$(".tile").on("click", function(event) {
			event.stopPropagation();
			//if the name has never been set and user clicks on tile, set the name else take a picture??
			var span = $("#" + this.id + " .name");
			var name = span.html();
			if (name.trim().length === 0) {
				setName(this.id);
			} else {
				capturePhoto(this.id); //get picture
			}
		});

		//register click handler for the name 
		$(".name").on("click", function(event) {
			event.stopPropagation(); //stop event propagation so that parent div does not receive event
			setName(this.parentNode.id);
		});

		//register handler for share and about buttons
		$("#share").on("click", function(event) {
			event.stopPropagation();
			var tiles = getCompletedTiles();
			if (tiles.length === 9) {
				renderImageAndShare(tiles);
			} else {
				_confirm("Are you sure you don't want to get a full house before sharing?", function(continueSharing) {
					if (continueSharing) {
						renderImageAndShare(tiles);
					}
				}, "Share your image", "Share anyway", "Ok, I'll wait");
			}
		});

		$("#about").on("click", function(event) {
			_alert("todo...");
		});
	}

	function updateName(tileId, name) {
		d3.select("#" + tileId + " .name").html(name);
	}

	function updateImage(tileId, imageData) {
		d3.select("#" + tileId).style("background-image", "url(" + imageData + ")");
	}

	function loadSavedImages() {
		d3.selectAll(".tile").each(function() {
			var id = this.id;
			var name = db.get(id + "name"),
				image = db.get(id + "image");
			if (name) {
				updateName(id, name);
			}
			if (image) {
				updateImage(id, image);
			}
		});
		updateShareButtonState();
	}

	var app = {
		// Application Constructor
		initialize: function() {
			this.bindEvents();
		},
		// Bind Event Listeners
		//
		// Bind any events that are required on startup. Common events are:
		// 'load', 'deviceready', 'offline', and 'online'.
		bindEvents: function() {
			document.addEventListener("deviceready", this.onDeviceReady, false);
		},
		// deviceready Event Handler
		//
		// The scope of 'this' is the event. In order to call the 'receivedEvent'
		// function, we must explicity call 'app.receivedEvent(...);'
		onDeviceReady: function() {
			app.receivedEvent("deviceready");
			loadSavedImages();
			registerTileEvents();
			//try to set the width and height of the tiles based on device
			fixTileWidthAndHeight();
			window.addEventListener("orientationchange", fixTileWidthAndHeight, true);
		},
		// Update DOM on a Received Event
		receivedEvent: function(id) {

		}

	};
	module.exports = app;
});