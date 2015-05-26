/* 
 * Author: 	Denisa Skantarova & Sule Serubugo
			Bachelor Project 
			Aalborg University - Medialogy
			2015 
 */

/*function getElms(){
    var elms = document.createElement("object");
    elms.type = "image/svg+xml";
    elms.data = "svg/audio_box.svg";
    elms.style.left = "250px";
    elms.style.top = "100px";
    document.getElementById("playground").appendChild(elms);
    return elms;
}*/
//var here = null;
function init() {
    /*var el = getElms();
    el.onload = function(){
        var svg = el.contentDocument;
        svg.getElementById("box").setAttribute("fill", "red");
        svg.getElementById("output-circle").setAttribute("r", "20");
        alert("here");
        here = svg.getElementById("output-circle");console.log(svg);
    };*/
    var unselect = [];
    var header = document.getElementById("header");
    unselect.push(header);
    var onoff = document.getElementById("onoff");
    unselect.push(onoff);
    var speech = document.getElementById("speech");
    unselect.push(speech);
    var examplep = document.getElementById("example_popup");
    unselect.push(examplep);
    for(var i=0; i<unselect.length; i++){
        unselect[i].unselectable='on'; 
        unselect[i].onselectstart='return false;';
        unselect[i].onmousedown='return false;';
    }
    
    var model = new AALModel();
    var elements = [];
    var menus = [];
    var controls = [];
    var examples = [];
    
    var audio = document.getElementById('audio');
    elements.push(audio);
    var osc = document.getElementById('oscil');
    elements.push(osc);
    var gain = document.getElementById('gain');
    elements.push(gain);
    var lfogain = document.getElementById('lfogain');
    elements.push(lfogain);
    var delay = document.getElementById('delay');
    elements.push(delay);
    var vardelay = document.getElementById('vardelay');
    elements.push(vardelay);
    var add = document.getElementById('add');
    elements.push(add);
    var speaker = document.getElementById('speaker');
    elements.push(speaker);
     var analyzer = document.getElementById('analyzer');
    elements.push(analyzer);
    
    var clear = document.getElementById('clear');
    menus.push(clear);
    var del = document.getElementById('delete');
    menus.push(del);
    var playL = document.getElementById('playL');
    menus.push(playL);
    var analyzerL = document.getElementById('analyzerL');
    menus.push(analyzerL);
    
    var onoff = document.getElementById('on-off');
    controls.push(onoff);
    var toolTab = document.getElementById('tab-menu');
    controls.push(toolTab);
    
    var voice = document.getElementById('voice');
    examples.push(voice);
    var flanger = document.getElementById('flanger');
    examples.push(flanger);
    var about = document.getElementById('about');
    examples.push(about);
    
    var view = new AALView(model, elements, menus, controls, examples);
    var controller = new AALController(model, view);
    
    
    //view.show();
}

window.addEventListener('load', init, false);
