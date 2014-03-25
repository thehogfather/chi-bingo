/**
 *
 * @author Patrick Oladimeji
 * @date 3/19/14 14:49:12 PM
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, d3, require, $, brackets, window, MouseEvent */
define(function(require, exports, module) {
	"use strict";

	function capturePhoto() {
		if (navigator.camera) {
			// Take picture using device camera and retrieve image as base64-encoded string
			navigator.camera.getPicture(onPhotoDataSuccess, onFail, {
				quality: 50
			});
		} else {
			alert("whoops!");
		}
	}

	function setName(gridNumber) {
		var currentName = document.getElementById(gridNumber).innerHTML;
		var newName = prompt("Enter the name of the person you want to meet: ", currentName, "Enter name");
		if (newName != null) {
			document.getElementById(gridNumber).innerHTML = newName;
		}
	}

	// Called when a photo is successfully retrieved
	function onPhotoDataSuccess(imageData) {
		// Get image handle
		var smallImage = document.getElementById('smallImage');

		// Unhide image elements
		smallImage.style.display = 'block';

		// Show the captured photo
		// The inline CSS rules are used to resize the image
		smallImage.src = "data:image/jpeg;base64," + imageData;
	}

	function onFail(message) {
		alert('Failed because: ' + message);
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
			document.getElementById("camera-control").onclick = function(event) {
				capturePhoto();
			};

			for (var i = 1; i < 10; i++) {
				document.getElementById("box" + i).onclick = function(event) {
					setName(this.id);
				};
			}

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