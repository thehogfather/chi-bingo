#!/usr/bin/env node

/**
 This hook copies the resource files needed for each platform
 
 !!!***AT THE MOMENT ONLY COPIES FILES FOR ANDROID***!!!!
*/

var exec = require("child_process").exec,
	path = require("path"),
	root_dir = process.argv[2],
	prefix = "www/res/icon/";
var platforms = ["android", "ios"];

var android = {
	"icon-36-ldpi.png": "drawable/icon.png",
	"icon-48-mdpi.png": "drawable-mdpi/icon.png",
	"icon-72-hdpi.png": "drawable-hdpi/icon.png",
	"icon-96-xhdpi.png": "drawable-xhdpi/icon.png"
}, ios = {

	};

console.log("COPYING RESOURCES...");
Object.keys(android).forEach(function(source) {
	var sourcePath = path.join(root_dir, prefix + "android/" + source),
		destinationPath = path.join(root_dir, "platforms/android/res/" + android[source]);
	var command = "cp " + sourcePath + " " + destinationPath;
	exec(command);
});

var plugins = [
	"org.apache.cordova.camera",
	"org.apache.cordova.dialogs",
	"org.apache.cordova.device",
	"https://github.com/devgeeks/Canvas2ImagePlugin.git",
	"https://github.com/EddyVerbruggen/SocialSharing-PhoneGap-Plugin.git",
	"https://github.com/cogitor/PhoneGap-OrientationLock.git"
];

plugins.forEach(function(p) {
	//remove the plugin 
	console.log("installing " + p);
	exec("phonegap plugin add " + p);
});