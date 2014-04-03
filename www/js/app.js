/**
 *
 * @author Patrick Oladimeji
 * @date 3/19/14 14:49:12 PM
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, d3, require, $, brackets, window, Camera */
define(function (require, exports, module) {
	"use strict";
    var d3 = require("lib/d3"),
        db = require("Storage");
    var tileHeight, tileWidth;
    
    /**
        Uses native alert to notify and falls back on html alert
    */
    function _alert(msg) {
        if (navigator.notification) {
            navigator.notification.alert(msg);
        } else {
            alert(msg);
        }
    }
    
	function onFail(message) {
		alert('Failed because: ' + message);
	}
    
    function _prompt(msg, promptCallback, title, defaultText) {
        title = title || "";// if title is falsy make it an empty string
        if (navigator.notification) {
            navigator.notification.prompt(msg, function (result) {
                if (result.buttonIndex === 1) {//ok was clicked
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
    
    function renderImage(tiles) {
        var canvas = d3.select("canvas").node();
        var context = canvas.getContext("2d");
        tiles.forEach(function (imgStr, index) {
            var img = new Image();
            img.addEventListener("load", function () {
                var x = (index % 3) * img.width,
                    y = Math.floor(index / 3) * img.height;
                context.drawImage(this, x, y);
                //when we draw the final tile, save the picture to the photos library or do something else
                if (index === 8) {
                    window.canvas2ImagePlugin.saveImageDataToLibrary(function (sucess) {
                        _alert(sucess);
                    }, function (err) {
                        _alert(err);
                    }, canvas);
                }
            });
            img.src = imgStr;
        });
    }
    
    function checkIfBingoCompleted() {
        var tiles = [];
        d3.selectAll(".tile").each(function () {
            var img = d3.select(this).style("background-url");
            if (img && img.length) {
                tiles.push(img);
            }
        });
        //if there are nine itmes in the list the bingo is complete for now pop up a dialog to ask to save the image
        if (tiles.length === 9) {
            renderImage(tiles);
        }
    }
    
    // Called when a photo is successfully retrieved
	function onPhotoDataSuccess(imageData, gridNumber) {
        //set the image data as background of the div
        
        ///TODO need to do something clever? to figure out how much of the picture is shown
        var imgStr = "data:image/jpeg;base64," + imageData;
        d3.select("#" + gridNumber).style("background-image", "url(" + imgStr + ")");
        db.set(gridNumber + "image", imgStr);
        //checkIfBingoCompleted();
	}

	function capturePhoto(gridNumber) {
		if (navigator.camera) {
			//Take picture using device camera and retrieve image as base64-encoded string
            //creating a closure over the gridNumber variable so that we retain access to it
			navigator.camera.getPicture(function (imageData) {
                onPhotoDataSuccess(imageData, gridNumber);
            }, onFail, {
                correctOrientation: false,
                targetHeight: 200,
                targetWidth: 200,
				quality: 50,
                destinationType: Camera.DestinationType.DATA_URL
			});
		} else {
			_alert("whoops!");
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
            title = "Bingo";
        _prompt(msg, function (newName) {
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
            height = window.screen.height,
            textHeight = 20;
        //initialise tile heigh tand width
        tileWidth = width / 3;
        tileHeight = height / 3;
        $("div.tile").css({width: tileWidth + "px", height: tileHeight + "px"});
    }
    
    function registerTileEvents() {
        //register click handler for tiles
        $(".tile").on("click", function (event) {
            event.stopPropagation();
            //if the name has never been set and user clicks on tile, set the name else take a picture??
            var span = $("#" + this.id + " .name");
            var name = span.html();
            if (name.trim().length === 0) {
                setName(this.id);
            } else {
                //get picture
                capturePhoto(this.id);
            }
        });
        //register click handler for the name 
        $(".name").on("click", function (event) {
            event.stopPropagation();//stop event propagation so that parent div does not receive event
            setName(this.parentNode.id);
        });
    }
    
    function updateName(tileId, name) {
        d3.select("#" + tileId + " .name").html(name);
    }
    
    function updateImage(tileId, imageData) {
        d3.select("#" + tileId).style("background-image", "url(" + imageData + ")");
    }
    
    function loadSavedImages() {
        d3.selectAll(".tile").each(function () {
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
		initialize: function () {
			this.bindEvents();
		},
		// Bind Event Listeners
		//
		// Bind any events that are required on startup. Common events are:
		// 'load', 'deviceready', 'offline', and 'online'.
		bindEvents: function () {
			document.addEventListener('deviceready', this.onDeviceReady, false);
		},
		// deviceready Event Handler
		//
		// The scope of 'this' is the event. In order to call the 'receivedEvent'
		// function, we must explicity call 'app.receivedEvent(...);'
		onDeviceReady: function () {
			app.receivedEvent('deviceready');
            loadSavedImages();
            registerTileEvents();
            //try to set the width and height of the tiles based on device
            fixTileWidthAndHeight();
		},
		// Update DOM on a Received Event
		receivedEvent: function (id) {

		}

	};
	module.exports = app;
});