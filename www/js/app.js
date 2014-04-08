/**
 *
 * @author Patrick Oladimeji
 * @date 3/19/14 14:49:12 PM
 */
/* jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, white:true */
/* global define, d3, require, $, brackets, window, Camera, Promise, Touche */
define(function(require, exports, module) {
	"use strict";
	var d3 = require("lib/d3"),
		db = require("Storage");
	var tileHeight, tileWidth, imageWidth = 300,
		imageHeight = 300,
		imageQuality = 80;

	/**
		Uses native alert to notify and falls back on html alert.
	*/
	function _alert(msg, title) {
		if (navigator.notification) {
			navigator.notification.alert(msg, null, title);
		} else {
			alert(msg);
		}
	}

	function onFail(message) {
		//alert('Failed because: ' + message);
        console.log(message);
	}

	/**
		Pops up an input dialog and returns the result to promptCallback.
	*/
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

	/**
		Pops up an input dialog to confirm a message.
	*/
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

	function share(imageData) {
		function success(msg) {
			console.log(msg ? "Successfully shared image" : "Some problem sharing. ..");
		}

		function error(err) {
			_alert(err, "Sharing error");
		}
		var people = d3.range(1, 10).map(function(d) {
			return db.get("box" + d + "name");
		}).filter(function (d) {return d; });
        var names = people.reduce(function (previous, current, index, array) {
            var sep = ", ";
            if (index === array.length - 1) {
                sep = " and ";
            }
            return previous ? previous.concat(sep).concat(current) : current;
        });
        var verb = people.length > 1 ? " are " : " is ";
        var msg = names + verb + "in my #chi2014 Bingo";
        if (window.device.platform.toLowerCase().indexOf("win") === 0) {
            window.plugins.socialsharing.share(msg, null, null, null);
        } else {
            window.plugins.socialsharing.share(msg, null, imageData, null, success, error);
        }
	}

	function renderImageAndShare(tiles) {
		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");

		var images = [];

		function render(tiles) {
			// calculate grid dimension to get the right size for rendering final canvas
			// if there is no image on tile use zero tile dimensions
			var dimensions = tiles.map(function(tile, index, tiles) {
				return tile.image ? {
					width: tileWidth,
					height: tile.image.height * tileWidth / tile.image.width
				} : {
					width: 0,
					height: 0
				};
			});
            //fold the dimensions into rows of three
            var rows = dimensions.reduce(function (p, c, i, arr) {
                var r = p[p.length - 1];
                if (r.length < 3) {
                    r.push(c);
                } else {
                    p.push([c]);
                }                
                return p;
            },[[]]);
            console.log(JSON.stringify(rows));
            var rowHeights = rows.map(function (d) {
                return d3.max(d.map(function (e) { return e.height; })) || tileHeight;
            });
            console.log(rowHeights);
            
			var	maxW = tileWidth; // (since we are fitting the image to the width of the tile)
			// set the size of the canvas based on the tile size
			canvas.width = maxW * 3;
			canvas.height = rowHeights[0] + rowHeights[1] + rowHeights[2];
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height);
            
			tiles.forEach(function(tile, index) {
				var colIndex = index % 3,
                    rowIndex = Math.floor(index / 3),
                    x = colIndex * maxW,
					y = rowHeights.slice(0, rowIndex).reduce(function (a, b) {
                        return a + b;  
                    }, 0);
				if (tile.image) {
					context.drawImage(tile.image, x, y, maxW, rowHeights[rowIndex]);
				} else {
					// just render a white background with the name?
					context.save();
					context.textAlign = "center";
					context.fillStyle = "white";
                    context.fillRect(x, y, dimensions[index].width, dimensions[index].height);
                    context.fillStyle = "black";
					context.fillText(tile.name || "?", x + maxW / 2, y + rowHeights[rowIndex] / 2, maxW);
					context.restore();
				}
				if (index === 8) {
					share(canvas.toDataURL());
				}
			});
		}

		function loadImage(tile) {
			return new Promise(function(resolve, reject) {
				var img = new Image();
				if (tile.image) {
					img.onload = function() {
						resolve({
							name: tile.name,
							image: img
						});
					};
					img.onerror = function(event) {
						reject(event);
					};
					img.src = tile.image;
				} else {
					resolve({
						name: tile.name
					});
				}
			});
		}
		Promise.all(tiles.map(function(tile) {
			return loadImage(tile);
		})).then(function(tiles) {
			render(tiles);
		}, function(err) {
			_alert(JSON.stringify(err), "Error");
		});
	}

	/**
        Returns a list of all nine tiles on the board
        returns [{name:string, image:string}]
    */
	function getAllTiles() {
		// get the tiles saved in the store and filter any non truthy values (ie those that are undefined or null)
		var tiles = d3.range(1, 10).map(function(d) {
			var imageKey = "box" + d + "image",
				nameKey = "box" + d + "name";
			return {
				name: db.get(nameKey),
				image: db.get(imageKey)
			};
		});

		return tiles;
	}

	/**
        Returns a list of objects containing the tiles that have pictures in them
        returns [{name:string, image:string}]
    */
	function getCompletedTiles() {
		return getAllTiles().filter(function(d) {
			return d.image;
		});
	}

	function updateImage(tileId, imageData) {
		var img = new Image();
		img.onload = function() {
			// we can reposition the image if needed to properly centralise the captured image
			// using background-position-x or -y
			var xpos = (tileWidth - img.width) / 2,
				ypos = (tileHeight - img.height) / 2;
            var h = img.height * (tileWidth / img.width);
            d3.select("#" + tileId).style("background-image", "url(" + imageData + ")")
                .style("background-size", tileWidth + "px " + h + "px");
//			$("#" + tileId).css({
//				"background-image": "url(" + imageData + ")",
//				// "background-position-x": xpos + "px",
//				"background-size": tileWidth + "px auto"
//			});
		};

		img.src = imageData;
	}

    function showImageAlert(src) {
        var top = (document.documentElement.clientHeight - tileWidth * 3) / 2;//using tileWidth because we are scaling the bingo image to the screen width and the image is a square
        var alertContainer = d3.select("#alertContainer");
        alertContainer.style("display", "block").style("top", "-" + (tileWidth * 3) + "px").on("click", null);
        var img = d3.select("#alertContainer img").attr("src", src).style("width", (tileWidth * 3) + "px");
        //img.classed("rotate-text", true);
        console.log("top is " + top);
        alertContainer.on("click", function () {
            alertContainer.transition().duration(500).style("top", "-1300px")
                .each("end", function () {
                    alertContainer.style("display", "none");
                });
        });
        alertContainer.transition().duration(2000).style("top", top + "px").ease("bounce");
    }
    
    function celebrate() {
        console.log("done - bingo!");
        showImageAlert("img/bingo.png");
    }
	// Called when a photo is successfully retrieved
	function onPhotoDataSuccess(imageData, gridNumber) {
		// set the image data as background of the div
		var imgStr = "data:image/jpeg;base64," + imageData;
		updateImage(gridNumber, imgStr);
		db.set(gridNumber + "image", imgStr);
        //check if bingo is complete, if so celebrate
        if (getCompletedTiles().length === 9) {
            celebrate();
        }
	}

	function onPhotoFail(message) {
		if (message !== "Camera cancelled." && message != "no image selected") {
			//_alert("Couldn't take a picture because: " + message, "Oops!");
		}
	}

	function capturePhoto(gridNumber) {
		if (navigator.camera) {
			// Take picture using device camera and retrieve image as base64-encoded string
			// creating a closure over the gridNumber variable so that we retain access to it
			navigator.camera.getPicture(function(imageData) {
				onPhotoDataSuccess(imageData, gridNumber);
			}, onPhotoFail, {
                cameraDirection: 1,
				correctOrientation: true,
				targetHeight: imageHeight,
				targetWidth: imageWidth,
				quality: imageQuality,
				destinationType: Camera.DestinationType.DATA_URL
			});
		} else {
			_alert("Sorry, you need a camera to use CHI Bingo!", "Oops!");
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
		var pixelCorrection = 1;
        var scale = 1, cWidth = document.documentElement.clientWidth,
            cHeight = document.documentElement.clientHeight,
            sWidth = window.screen.width,
            sHeight = window.screen.height;
    
		var width = cWidth,// (window.screen.width / pixelCorrection),
			bottomToolbarHeight = 40,
			height = /*(window.screen.height / pixelCorrection)*/ cHeight - bottomToolbarHeight;
        
        if (window.device && window.device.platform.toLowerCase().indexOf("win") === 0) {
            width = window.screen.availWidth;
            height = window.screen.availHeight;
        }
		
		// initialise tile height and width
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
		// register click handler for tiles
		$(".tile").on("click", function(event) {
            if (event.target === this) {
                // if the name has never been set and user clicks on tile, set the name else take a picture??
                var span = $("#" + this.id + " .name");
                var name = span.html();
                if (name.trim().length === 0) {
                    setName(this.id);
                } else {
                    capturePhoto(this.id); // get picture
                }
            }
            
		});

		// register click handler for the name
		$(".name").on("click", function(event) {
			event.stopPropagation(); // stop event propagation so that parent div does not receive event
			setName(this.parentNode.id);
		});

		// register handler for share and about buttons
		$("#share").on("click", function(event) {
			//event.stopPropagation();
			var tiles = getCompletedTiles();
			if (tiles.length === 9) {
				renderImageAndShare(tiles);
			} else {
				_confirm("Are you sure you don't want to get a full house before sharing?", function(continueSharing) {
					if (continueSharing) {
						renderImageAndShare(getAllTiles());
					}
				}, "Share your image", "Share anyway", "Ok, I'll wait");
			}
		});

		$("#about").on("click", function(event) {
			event.stopPropagation();
			_alert("CHI Bingo was Gary Marsden's idea. The app was developed by Jennifer Pearson, Simon Robinson and Patrick Oladimeji.", "About");
		});
	}

	function updateName(tileId, name) {
		d3.select("#" + tileId + " .name").html(name);
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
			fixTileWidthAndHeight(); // try to set the width and height of the tiles based on device
			window.plugins.orientationLock.lock("portrait"); // Android not supported in phonegap config.xml pref
			FastClick.attach(document.body);
		},
		// Update DOM on a Received Event
		receivedEvent: function(id) {}
	};
	module.exports = app;
});