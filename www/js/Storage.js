/**
 * Handles storage of json data to the phone. Override methods in this module to use other storage providers e.g. websql or ...
 * @author Patrick Oladimeji
 * @date 3/21/14 15:05:50 PM
 */
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, d3, require, $, brackets, window, MouseEvent */
define(function (require, exports, module) {
    "use strict";

    function set(key, val) {
        localStorage.setItem(key, val);
    }
    
    function get(key) {
        localStorage.getItem(key);
    }
    
    function remove(key) {
        localStorage.removeItem(key);
    }
    
    
    module.exports = {
        set: set,
        get: get,
        remove: remove
    };
});
