/**
 *
 * @author Patrick Oladimeji
 * @date 3/19/14 14:49:12 PM
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, d3, require, $, brackets, window, MouseEvent */
define(function(require, exports, module) {
	"use strict";
    var d3 = require("lib/d3");
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
    
    // Called when a photo is successfully retrieved
	function onPhotoDataSuccess(imageData, gridNumber) {
        //set the image data as background of the div
        
        ///TODO need to do something clever? to figure out how much of the picture is shown
        var imgStr = "data:image/jpeg;base64," + imageData;
        $("#" + gridNumber + " img").remove();//remove any old img tags
        //$("#" + gridNumber).append("<img src='" + imgStr + "'/>");
        d3.select("#" + gridNumber).append("img").attr("src", imgStr)
            .style("height", tileHeight + "px");
        
//		// Get image handle
//		var smallImage = document.getElementById('smallImage');
//
//		// Unhide image elements
//		smallImage.style.display = 'block';
//
//		// Show the captured photo
//		// The inline CSS rules are used to resize the image
//		smallImage.src = "data:image/jpeg;base64," + imageData;
	}

	function capturePhoto(gridNumber) {
		if (navigator.camera) {
			//Take picture using device camera and retrieve image as base64-encoded string
            //creating a closure over the gridNumber variable so that we retain access to it
			navigator.camera.getPicture(function (imageData) {
                onPhotoDataSuccess(imageData, gridNumber);   
            }, onFail, {
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
    function setName(span) {
        var currentName = span.html();
        var msg = "Enter the name of the person you want to meet: ",
            title = "Bingo";
        _prompt(msg, function (newName) {
            if (newName !== null) {
                span.html(newName);
            }
        }, title, currentName);
    }

	
	function onFail(message) {
		alert('Failed because: ' + message);
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
                setName(span);
            } else {
                //get picture
                capturePhoto(this.id);
            }
        });
        //register click handler for the name 
        $(".name").on("click", function (event) {
            event.stopPropagation();//stop event propagation so that parent div does not receive event
            setName($(this));
        });
    }
	/*
       
       // Called when a photo is successfully retrieved
       //
       function onPhotoFileSuccess(imageData) {
       // Get image handle
       console.log(JSON.stringify(imageData));
       
       // Get image handle
       //
       var smallImage = document.getElementById('smallImage');
       
       // Unhide image elements
       //
       smallImage.style.display = 'block';
       
       // Show the captured photo
       // The inline CSS rules are used to resize the image
       //
       smallImage.src = imageData;
       }
       
       // Called when a photo is successfully retrieved
       //
       function onPhotoURISuccess(imageURI) {
       // Uncomment to view the image file URI
       // console.log(imageURI);
       
       // Get image handle
       //
       var largeImage = document.getElementById('largeImage');
       
       // Unhide image elements
       //
       largeImage.style.display = 'block';
       
       // Show the captured photo
       // The inline CSS rules are used to resize the image
       //
       largeImage.src = imageURI;
       }
       
       // A button will call this function
       //
       function capturePhotoWithData() {
       // Take picture using device camera and retrieve image as base64-encoded string
       navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 50 });
       }
       
       function capturePhotoWithFile() {
       navigator.camera.getPicture(onPhotoFileSuccess, onFail, { quality: 50, destinationType: Camera.DestinationType.FILE_URI });
       }
       
       // A button will call this function
       //
       function getPhoto(source) {
       // Retrieve image file location from specified source
       navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50,
                                   destinationType: destinationType.FILE_URI,
                                   sourceType: source });
       }
       
       // Called if something bad happens.
       // 
       function onFail(message) {
       alert('Failed because: ' + message);
       }
       */

	var app = {
		// Application Constructor
		initialize: function() {
			this.bindEvents();
            registerTileEvents();
            //try to set the width and height of the tiles based on device
            fixTileWidthAndHeight();
		},
		// Bind Event Listeners
		//
		// Bind any events that are required on startup. Common events are:
		// 'load', 'deviceready', 'offline', and 'online'.
		bindEvents: function() {
			document.addEventListener('deviceready', this.onDeviceReady, false);
		},
		// deviceready Event Handler
		//
		// The scope of 'this' is the event. In order to call the 'receivedEvent'
		// function, we must explicity call 'app.receivedEvent(...);'
		onDeviceReady: function() {
			app.receivedEvent('deviceready');
		},
		// Update DOM on a Received Event
		receivedEvent: function(id) {

		}

	};
	module.exports = app;
});