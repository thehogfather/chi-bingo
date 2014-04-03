#!/usr/bin/env node
 
/**
 This hook copies the resource files needed for each platform
 
 !!!***AT THE MOMENT ONLY COPIES FILES FOR ANDROID***!!!!
*/
 
var exec = require("child_process").exec,
    path = require("path"),
    root_dir = process.argv[2];
var platforms = ["android", "ios"];

console.log("CLEANING PLATFORM FOLDERS...");

var plugins = [
    "org.apache.cordova.camera",
    "org.apache.cordova.dialogs",
    "https://github.com/devgeeks/Canvas2ImagePlugin.git"
];

plugins.forEach(function (p) {
    //remove the plugin 
    console.log("removing " + p);
    exec("phonegap plugin remove " + p);
});

platforms.forEach(function (p) {
    console.log("removing platforms and plugins folder..");
    exec("rm -rf platforms/" + p);
    exec("rm  plugins/" + p + ".json");
    exec("cordova platform add " + p);
});
