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
            tileWidth = width / 3,
            tileHeight = height / 3,
            textHeight = 20;
        $("div.tile").css({width: tileWidth + "px", height: tileHeight + "px"});
       // $(".tile img").css({height: (tileHeight - textHeight) + "px"});
    }
    
    function registerTileEvents() {
//        $(".front").on("click", function (event) {
//            event.stopPropagation();
//            $(event.target).addClass("flip");
//        });
        
        $(".row .tile").on("click", function (event) {
            event.stopPropagation();
            var tile = $(event.target);
            var tileId = tile.attr("id");
            
            function cameraSuccess(imageData) {
                $("#" + tileId).css({"background-image": "data:image/jpeg;base64," + imageData, "background-position": "50% 50%"});
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
            var buttons = ["Okay", "Cancel"],
                txtName = $(event.target);
            navigator.notification.prompt("Selfie Name", function (results) {
                if (results.buttonIndex === 1) {
                    txtName.html(results.input1);
                }
            }, "Selfie Name", buttons, txtName.html());
            
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