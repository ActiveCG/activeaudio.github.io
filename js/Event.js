/* 
 * Author: 	Denisa Skantarova & Sule Serubugo
			Bachelor Project 
			Aalborg University - Medialogy
			2015 
 */

function Event(sender){
    this._sender = sender;
    this._listeners = [];
}

Event.prototype = {
    attach: function(listener) {
        this._listeners.push(listener);
    },
    
    notify: function(event) {
        for(var index = 0, length = this._listeners.length; index < length; index++){
            this._listeners[index].call(this, event);
        }
    },
    
    detach: function(listener) {
        for(var index = 0, length = this._listeners.length; index < length; index++){
            if(this._listeners[index] === listener){
                this._listeners.splice(index, 1);
                break;
            }
        }
    }
};