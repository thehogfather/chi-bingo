/**
 * 
 * @author Patrick Oladimeji
 * @date 3/21/14 15:17:54 PM
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, d3, require, $, brackets, window, MouseEvent */
define(function (require, exports, module) {
    "use strict";
    var Storage = require("Storage");
    
    var _id;//this is private
    function BingoTile(id, name, img) {
        _id = id;
        this.name = name;
        this.imageData = img;
        
    }
    
    BingoTile.prototype.getId = function () {
        return _id;
    };
    
    BingoTile.prototype.getJSON = function () {
        return {
            name: this.name,
            imageData: this.imageData,
            id: _id
        };
    };
    
    
    BingoTile.get = function (id) {
        var data =  Storage.get(id);
        if (data) {
            return new BingoTile(data.id, data.name, data.imageData);
        } else {
            return undefined;
        }
    };
    
    module.exports = BingoTile;
});
