/**
 * 
 * @author Patrick Oladimeji
 * @date 3/19/14 14:49:12 PM
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, d3, require, $, brackets, window, Camera */
define(function (require, exports, module) {
    "use strict";
    
    var Store = require("./Storage");
    
    function show(msg) {
        if (navigator.notification) {
            navigator.notification.alert("native" + msg);
        } else {
            alert(msg);
        }
    }
    
    /**
        Figures out the width and height of the screen and updates the tile sizes
    */
    function fixTileWidthAndHeight() {
        var width = window.screen.width,
            height = window.screen.height,
            tw = width / 3,
            th = height / 3;
        $("div.tile").css({width: tw + "px", height: th + "px"});
    }
    
    function registerTileEvents() {
        $(".row .tile").on("click", function (event) {
            event.stopPropagation();
            var tileId = event.target.getAttribute("id");
            function cameraSuccess(imageData) {
                $("#" + tileId + " img").attr("src", "data:image/jpeg;base64," + imageData);
                //save image data in local store
                Store.set("tile" + tileId, {imageData: imageData});
            }
            
            function cameraError() {
                //show a default error image on the tile?
                
            }
            navigator.camera.getPicture(cameraSuccess, cameraError, {quality: 50, destinationType: Camera.DestinationType.DATA_URL});
        });
        
        $(".tile .name").on("click", function (event) {
            event.stopPropagation();
            var buttons = ["Okay", "Cancel"];
            navigator.notification.prompt("Selfie Name", function (results) {
                if (results.buttonIndex === 1) {
                    $(event.target).html(results.input1);
                }
            }, "Selfie Name", buttons);
            
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
       
        onDeviceReady: function () {
            registerTileEvents();
            fixTileWidthAndHeight();
        }
    };
    module.exports = app;
});