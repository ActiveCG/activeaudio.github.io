/* 
 * Author: 	Denisa Skantarova & Sule Serubugo
			Bachelor Project 
			Aalborg University - Medialogy
			2015 
 */

function AALController(model, view){
    this._model = model;
    this._view = view;
    AALController._this = this;
    
    this._tempx = Math.floor(window.innerWidth/2) - 50;//300;
    this._tempy = Math.floor(window.innerHeight/2) - 50;//150;
    this._idNum = 0;
    this._zIndex = 0;
    
    this._svgns = "http://www.w3.org/2000/svg";
    this._drag = {};
    this._drag.boxesSelected = [];
    this._drag.lineSelected = null;
    this._drag.icon = null;
    this._drag.line = null;
    
    var _this = this;
    
    this.audioCommandReceived = new Event(this);
    var speechRecognizer = new SpeechRecognizer(this.audioCommandReceived);
    this._answer = document.getElementById("rec-answer");
    this._playing = false;
    
    this.audioCommandReceived.attach(function(event){
        //console.log(event.command);
        _this.processVoiceCommand(event.command);  
    });
    
    //events on boxes
    this._model.playImageChanged.attach(function(event){ 
        if(event.type === "stopIcon"){
            var imgs = document.getElementById("playground").querySelectorAll(".box .playButton");
            for(var i=0; i<imgs.length; i++){ 
                if(imgs[i].isPlaying === true){
                    imgs[i].removeEventListener("mouseenter", AALController._this.highlightPlay);
                    imgs[i].removeEventListener("mouseleave", AALController._this.unhighlightPlay);
                    imgs[i].addEventListener("mouseenter", AALController._this.highlightStop);
                    imgs[i].addEventListener("mouseleave", AALController._this.unhighlightStop);
                }
            }
        }
        else{
            var imgs = document.getElementById("playground").querySelectorAll(".box .playButton");
            for(var i=0; i<imgs.length; i++){
                if(imgs[i].isPlaying === false){
                    imgs[i].removeEventListener("mouseenter", AALController._this.highlightStop);
                    imgs[i].removeEventListener("mouseleave", AALController._this.unhighlightStop);
                    imgs[i].addEventListener("mouseenter", AALController._this.highlightPlay);
                    imgs[i].addEventListener("mouseleave", AALController._this.unhighlightPlay);
                }
            }
        }
    });
    
    this._view.playButtonClicked.attach(function(event){
        _this._model.playSound(event.type);//_this.playAudio(event.type);
    });
    
    /*this._view.boxDeleted.attach(function(event){
        _this.deleteBox(event.type);
    });*/
    
    this._view.oscillatorTypeSwitched.attach(function(event){
        _this._model.switchOscillatorType(event.type);
    });
    
    this._view.soundSourceSwitched.attach(function(event){
        _this._model.switchSoundSource(event.type);
    });
    
    this._view.analyzerTypeSwitched.attach(function(event){
        _this._model.switchAnalyzerType(event.type);
    });
    
    this._view.gainUpdated.attach(function(event){
        _this.onUpdateGain(event.type);
    });
    
    this._view.oscFrequencyUpdated.attach(function(event){
        _this.onUpdateOscFrequency(event.type);
    });
    
    this._view.delayUpdated.attach(function(event){
        _this.onUpdateDelay(event.type);
    });
    
    this._view.variableDelayUpdated.attach(function(event){
        _this.onUpdateVariableDelay(event.type);
    });
    
    this._view.LFOGainUpdated.attach(function(event){
        _this.onUpdateLFOGain(event.type);
    });
    
    this._view.boxSelected.attach(function(event){
        _this.selectBox(event.type);
    });
    
    this._view.boxDeselected.attach(function(event){
        _this.deselectBox(event.type);
    });
    
    this._view.selectedBoxDeleted.attach(function(event){
        _this.deleteSelectedBox(event.type);
    });
    
    this._view.loopChanged.attach(function(event){
        _this._model.changeLoop(event.type);
    });
    
    //create boxes on click
    this._view.audioIconClicked.attach(function(event){
            var box = _this.createAudioBox();
            _this.pickupIcon(event.type, box);
    });
    
    this._view.oscillatorIconClicked.attach(function(event){
        var box = _this.createOscillatorBox();
        _this.pickupIcon(event.type, box);
    });
    
    this._view.gainIconClicked.attach(function(event){
        var box = _this.createGainBox();
        _this.pickupIcon(event.type, box);
    });
    
    this._view.LFOGainIconClicked.attach(function(event){
        var box = _this.createLFOGainBox();
        _this.pickupIcon(event.type, box);
    });
    
    this._view.delayIconClicked.attach(function(event){
        var box = _this.createDelayBox();
        _this.pickupIcon(event.type, box);
    });
    
    this._view.variableDelayIconClicked.attach(function(event){
        var box = _this.createVariableDelayBox();
        _this.pickupIcon(event.type, box);
    });
    
    this._view.addIconClicked.attach(function(event){
        var box = _this.createAddBox();
        _this.pickupIcon(event.type, box);
    });
    
    this._view.speakerIconClicked.attach(function(event){
        var box = _this.createSpeakerBox();
        _this.pickupIcon(event.type, box);
    });
    this._view.analyzerIconClicked.attach(function(event){
        var box = _this.createAnalyzerBox();
        _this.pickupIcon(event.type, box);
    });
    
    this._view.iconDragged.attach(function(event){
        _this.dragIcon(event.type);
    });
    
    this._view.iconReleased.attach(function(event){
        _this.releaseIcon(event.type);
    });
    
    //menu links on click
    this._view.clearLinkClicked.attach(function(){
        _this.clearScreen();
    });
    
    //controlls on click
    this._view.onOffClicked.attach(function(){
        if(_this._playing === true){
            _this._playing = false;
        }
        else{
            _this._playing = true;
        }
        _this._model.playPlayground();
    });
    
    //deleting a line
    this._view.lineSelected.attach(function(event){
        _this.selectLine(event.type);
    });
    
    this._view.lineDeselected.attach(function(event){
        _this.deselectLine(event.type);
    });
    
    this._view.lineDeleted.attach(function(event){
        _this.deleteLine(event.type);
    });
    
    //making a line
    this._view.lineStarted.attach(function(event){
        _this.startLine(event.type);
    });
    
    this._view.lineDragged.attach(function(event){
        _this.dragLine(event.type);
    });
    
    this._view.lineDrawingAllowed.attach(function(){
        _this.allowDrawing();
    });
    
    this._view.lineDrawn.attach(function(event){
        _this.drawLine(event.type);
    });
    
    this._view.lineReleased.attach(function(){
        _this.releaseLine();
    });
    
    //dragging a box
    this._view.boxPickedUp.attach(function(event){
        _this.pickupBox(event.type);
    });
        
    this._view.boxDragged.attach(function(event){
        _this.dragBox(event.type);
    });
    
    this._view.boxReleased.attach(function(event){
        _this.releaseBox(event.type);
    });
    
    
}

AALController.prototype = {
    /*playAudio: function(event) {
        this._model.playSound(event);
    },*/
    
    processVoiceCommand: function(command) {
        switch(command){
            case "notunderstand":
                this._answer.innerHTML = "I did not understand!";
                this._model.playMessage("didnot_understand");
                break;
            case "audio play":
                if(this._playing === false){
                    this._playing = true;
                    this._answer.innerHTML = "Starting audio!";
                    this._model.playPlayground();
                }
                else{
                    this._answer.innerHTML = "Audio playing!";
                }
                break;
                
            case "audio stop":
                if(this._playing === true){
                    this._playing = false;
                    this._answer.innerHTML = "Stoping audio!";
                    this._model.playPlayground();
                }
                else{
                    this._answer.innerHTML = "Audio not playing!";
                }
                break;
                
            case "audio connect":
                if(this._drag.boxesSelected !== null && this._drag.boxesSelected.length === 2){
                    this._answer.innerHTML = this.createConnection(this._drag.boxesSelected);
                }
                else{
                    this._answer.innerHTML = "Select two components to connect!";
                    this._model.playMessage("sel_boxes_connect");
                }
                break;
                
            case "audio disconnect":
                if(this._drag.lineSelected !== null){
                    this._answer.innerHTML = "Disconnecting!";
                    this.deleteLine("disconnect");
                }
                else{
                    if(this._drag.boxesSelected !== null){
                        this._answer.innerHTML = this.disconnectBoxes(this._drag.boxesSelected);
                    }
                    else{
                        this._answer.innerHTML = "Select one or two components to disconnect!";
                        this._model.playMessage("sel_boxes_disconnect");
                    }
                }
                break;
            case "audio what is this":
                var over = this._view.getPointedElement();
                if(over.className === "" || !over.getAttribute("class")){
                    this._answer.innerHTML = "Can you hover over the component you want to know about?";
                    this._model.playMessage("hover_know_about");
                    return;
                }
                while (over && over.className.indexOf("box") === -1){
                    over = over.parentNode;
                }
                if (!over){
                    this._answer.innerHTML = "Can you hover over the component you want to know about?";
                    this._model.playMessage("hover_know_about");
                    return;
                }
                
                this._answer.innerHTML = over.getAttribute('audioNodeType');
                this._model.playMessage(over.getAttribute('audioNodeType'));
                console.log(over);
                
                var popup = document.createElement("div");
                popup.className = "whatisthis_popup";
                //popup.style.position = "absolute";
                var left = parseInt(over.style.left) + 50;
                var top = parseInt(over.style.top) + 30;
                popup.style.left = "" + left + "px";
                popup.style.top = "" + top + "px";
                //popup.style.width = "70px";
                //popup.style.background = "red";
                var text = document.createElement("h6");
                text.innerHTML = over.getAttribute('audioNodeType');
                popup.appendChild(text);
                document.getElementById("playground").appendChild(popup);
                
                var _this = this;
                window.addEventListener("mousedown", this.handlerHP = function(e){
                    window.removeEventListener("mousedown", _this.handlerHP);
                    var popups = document.getElementById("playground").querySelectorAll(".whatisthis_popup");
                    for(var i=0; i<popups.length; i++){
                        popups[i].parentNode.removeChild(popups[i]);
                    }
                });
                break;
        }
    },
    
    addThreeDots: function(text, limit){
        var dots = "...";
        if(text.length > limit){
            text = text.substring(0,limit) + dots;
        }
        return text;
    },
    
    ////creating new boxes
    createAudioBox: function() {
        var box = this.createNewBox("play", false, true);
        //var playButton = this.createNewButton("play", this._view.playButtonClicked);
        //playButton.innerHTML = "Play";
        //box.appendChild(playButton);
        
        //loop checkbox
        var looper = document.createElement("div");
        var label = document.createElement("label");
        var check = document.createElement("input");
        check.type = "checkbox";
        check.className = "checkbox";
        check.checked = false;
        
        var _this = this;
        check.onchange = function (e) {
            _this._view.loopChanged.notify({ type: e });
        };
        looper.appendChild(check);
        label.appendChild(document.createTextNode(" Loop"));
        label.className = "loop-label";
        looper.appendChild(label);
        looper.className = "loop";
        box.appendChild(looper);
        
        // Add footer element
	var footer = document.createElement("div");
        footer.className = "drop";
	var sel = document.createElement("select");
	sel.className = "sound-file";
        for(var i=0; i<this._model._soundFiles.length; i++){
            var opt = document.createElement("option");
            var optText = this.addThreeDots(this._model._soundFiles[i], 8);
            opt.appendChild( document.createTextNode(optText));
            sel.appendChild( opt );
        }
       
	//sel.onchange = switchOscillatorTypes;
        var _this = this;
        sel.onchange = function (e) {
            _this._view.soundSourceSwitched.notify({ type: e });
        };
	footer.appendChild(sel);
        var values = box.querySelector(".values");
	values.appendChild( footer );
        //values.style.width = "200%";
        
        box = this._model.createAudio(box); //console.log(box);
        //document.appendChild(box);
        return box;
    },
    
    createOscillatorBox: function() {
        var box = this.createNewBox("sine", false, true );
        //var playButton = this.createNewButton("play", this._view.playButtonClicked);
        //playButton.innerHTML = "Play";
        //box.appendChild(playButton);
        var values = box.querySelector(".values");
        this.createSlider( values, "Frequency", 440, 0, 8000, 1, "Hz", this._view.oscFrequencyUpdated);
        
        box.className += " has-footer";
        // Add footer element
	var drop = document.createElement("div");
	var sel = document.createElement("select");
	sel.className = "osc-type";
        for(var i=0; i<this._model._oscTypes.length; i++){
            var opt = document.createElement("option");
            //opt.className = "op";
            opt.appendChild( document.createTextNode(this._model._oscTypes[i]));
            sel.appendChild( opt );
        }
	/*opt.appendChild( document.createTextNode("sine"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("square"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("sawtooth"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("triangle"));
	sel.appendChild( opt );
	opt = document.createElement("option");
	opt.appendChild( document.createTextNode("wavetable"));*/
	//sel.onchange = switchOscillatorTypes;
        var _this = this;
        sel.onchange = function (e) {
            _this._view.oscillatorTypeSwitched.notify({ type: e });
        };
	//sel.appendChild( opt );
	drop.appendChild( sel );
        //drop.style.position = "absolute";
        //drop.style.top = "80px";
        
	values.appendChild( drop );
        
       
        
        box = this._model.createOscillator(box);
        return box;
    },
    
    createGainBox: function() {
        var box = this.createNewBox("gain", true, true );
        //var label = document.createElement("label");
            //label.appendChild(document.createTextNode("gain"));
           // box.parentNode.appendChild(label);
            //box.style.left = "0px";
            //box.style.top = "20px";
            //label.style.left = "0px";
            //label.style.top = "0px";
            //label.style.position = "absolute";
            //label.className += " boxValue";
        var values = box.querySelector(".values");
        this.createSlider( values, "Gain", 1.0, 0.0, 10.0, 0.01, "", this._view.gainUpdated);
        box = this._model.createGain(box);
        return box;
    },
    
    createDelayBox: function() {
        var box = this.createNewBox( "delay", true, true/*, "param_in" */);
        //this.createSlider( box, "delay time", 0.2, 0.0, 10.0, 0.01, "s", this._view.delayUpdated);
        var values = box.querySelector(".values");
        this.createSlider( values, "Samps", 1, 0.0, 480.0, 1, "", this._view.delayUpdated);
        this.createSlider( values, "ms", (1/this._model.getSampleRate()*1000).toFixed(2), 0.0, 3000.0, 1, "", this._view.delayUpdated);
        box = this._model.createDelay(box);
        return box;
    },
    
    createVariableDelayBox: function() {
        var box = this.createNewBox( "variabledelay", true, true );
        var values = box.querySelector(".values");
        this.createSlider( values, "LFO", 0.5, 0.0, 10.0, 0.1, "Hz", this._view.variableDelayUpdated);
        this.createSlider( values, "Depth", 30.0, 0.0, 70.0, 1, "ms", this._view.variableDelayUpdated);
        this.createSlider( values, "Delay", 20.0, 0.0, 70.0, 1, "ms", this._view.variableDelayUpdated);
        box = this._model.createVariableDelay(box);
        return box;
    },
    
    createLFOGainBox: function() {
        var box = this.createNewBox( "lfogain", true, true );
        var values = box.querySelector(".values");
        this.createSlider( values, "LFO", 0.5, 0.0, 10.0, 0.1, "Hz", this._view.LFOGainUpdated);
        this.createSlider( values, "Depth", 1.0, 0.0, 1.0, 0.01, "", this._view.LFOGainUpdated);//30.0, 0.0, 70.0, 1, "ms", this._view.LFOGainUpdated);
        this.createSlider( values, "Gain", 1.0, 0.0, 10.0, 0.01, "", this._view.LFOGainUpdated);
        box = this._model.createLFOGain(box);
        return box;
    },
    
    /*createLFOBox: function() {
        var box = this.createNewBox( "sine", false, false, "param_out" );
        var values = box.querySelector(".values");
        this.createSlider( values, "LFO", 0.5, 0.0, 10.0, 0.1, "Hz", this._view.variableDelayUpdated);
        this.createSlider( values, "Depth", 30.0, 0.0, 70.0, 1, "ms", this._view.variableDelayUpdated);
        box = this._model.createLFO(box);
        return box;
    },*/
    
    createAddBox: function() {
        var box = this.createNewBox("plus", true, true );
        var values = box.querySelector(".values");
        values.style.display = "none";
        box = this._model.createAdd(box);
        return box;
    },
    
    createSpeakerBox: function() {
        var box = this.createNewBox("speaker", true, false);
        img = box.querySelector( 'img' );
        img.style.height = "35px";
        var values = box.querySelector(".values");
        values.style.display = "none";
        box = this._model.createSpeaker(box);
        return box;
    },
    
    createAnalyzerBox: function() {
        var box = this.createNewBox("analyzer", true, true );
        var values = box.querySelector(".values");
        //values.style.display = "none";
        
	var sel = document.createElement("select");
	sel.className = "analyzer-type";
        for(var i=0; i<this._model._analyzer._analyzerTypes.length; i++){
            var opt = document.createElement("option");
            opt.appendChild( document.createTextNode(this._model._analyzer._analyzerTypes[i]));
            sel.appendChild( opt );
        }
	
        var _this = this;
        sel.onchange = function (e) {
            _this._view.analyzerTypeSwitched.notify({ type: e });
        };
	//sel.appendChild( opt );
	values.appendChild( sel );
        
        box = this._model.createAnalyzer(box);
        return box;
    },
    
    createNewBox: function(name, inputs, outputs/*, param*/){
        var _this = this;
        
        var box = document.createElement("div");
        box.id = "box" + this._idNum++;
        box.unselectable='on';
        box.onselectstart='return false;' ;
        box.onmousedown='return false;';
        //box.className="module " + nodeType;
        //box.style.position = "absolute";
        
        //var bigBox = document.createElement("div");
        //bigBox.style.border = "2px solid #ff0000";
        //bigBox.style.width = "500px";
        //bigBox.style.height = "500px";
        //bigBox.style.left="" + this._tempx + "px";
        //bigBox.style.top="" + this._tempy + "px";
        //bigBox.style.position = "absolute";
        //bigBox.className += " bigBox";
        //var label = document.createElement("label");
           // label.appendChild(document.createTextNode(name));
            //bigBox.appendChild(label);
            //box.style.left = "0px";
            //box.style.top = "20px";
            //label.style.left = "30px";
            
        box.style.left="" + this._tempx + "px";
        box.style.top="" + this._tempy + "px";
        //box.style.border = "2px solid #000"; 
        //box.style.width = "150px";

        if (this._tempx > Math.floor(window.innerWidth/2) + 50){//) {
                    this._tempy += 20;//250
                    this._tempx = Math.floor(window.innerWidth/2) - 50;//;
            } else
                    this._tempx += 20;//250
            if (this._tempy > Math.floor(window.innerHeight/2) + 50){//600)
                    this._tempy = Math.floor(window.innerHeight/2) - 50;//150;
                }
                
        var content = document.createElement("div");
	content.className="content";
	box.appendChild(content);
        //var title = document.createElement("h6");
	//title.className = "module-title";
	//title.appendChild(document.createTextNode(name));
	//content.appendChild(title);
        if(name === "analyzer"){
            var canvas = document.createElement("canvas");
            box.appendChild(canvas);
            box.drawingContext = canvas.getContext('2d');
        }
        else{
            var img = document.createElement("img");
            img.src = "img/box_imgs/" +  name + ".png";
            if(name === "play"){
                img.className += " playButton";
                img.onmousedown = function (e) {
                    _this._view.playButtonClicked.notify({ type: e });
                };
                img.addEventListener("mouseenter", this.highlightPlay);
                img.addEventListener("mouseleave", this.unhighlightPlay);
            }
            else{
                img.className += "BOX-img";
            }
            content.appendChild(img);
        }

        if(inputs === true){
            var input = document.createElement("div");
            //input.style.border = "1px solid #00ff00";
            //input.style.width = "30px";
            //input.style.height = "30px";
            input.className = "circle circle-in";
            input.innerHTML = "<span class='node-button'>&nbsp;</span>";
            //input.addEventListener('mousedown', line, true);
            input.onmousedown = function (e) {
                _this._view.lineStarted.notify({ type: e });
            };
            box.appendChild(input);
            box.inputs = input;
        }

        if(outputs === true){
            var output = document.createElement("div");
            //output.style.border = "1px solid #ff0000";
            //output.style.width = "30px";
            //output.style.height = "30px";
            output.className = "circle circle-out";
            output.innerHTML = "<span class='node-button'>&nbsp;</span>";
            //output.addEventListener('mousedown', line, true);
            output.onmousedown = function (e) {
                _this._view.lineStarted.notify({ type: e });
            };
            box.appendChild(output);
            box.outputs = output;
        }
        
        /*if(param === "param_in"){
            var pinput = document.createElement("div");
            pinput.className = "circle circle-in param-in";
            pinput.innerHTML = "<span class='node-button'>&nbsp;</span>";
            pinput.onmousedown = function (e) {
                _this._view.lineStarted.notify({ type: e });
            };
            box.appendChild(pinput);
            box.pInputs = pinput;
        }
        else if(param === "param_out"){
            var poutput = document.createElement("div");
            poutput.className = "circle circle-out param-out";
            poutput.innerHTML = "<span class='node-button'>&nbsp;</span>";
            poutput.onmousedown = function (e) {
                _this._view.lineStarted.notify({ type: e });
            };
            box.appendChild(poutput);
            box.pOutputs = poutput;
        }*/

        /*var close = document.createElement("a");
            close.href = "#";
            close.innerHTML = "x";
            close.className = "close";
            close.onclick = function (e) {
                _this._view.boxDeleted.notify({ type: e });
            };
            box.appendChild( close );*/

        //var title = document.createElement("h3");
        //title.innerHTML = name;
        //box.appendChild(title);


        //box.addEventListener("mousedown", pickupBox);
        /*this._view.boxPickedUp.attach(function(event){
            _this.pickupBox(event.type);
        });*/
        
        box.onmousedown = function (e) {
            _this._view.boxPickedUp.notify({ type: e });
        };
        
        box.onclick = function (e) {
            _this._view.boxSelected.notify({ type: e });
        };
        
        var values = document.createElement("div");
        //values.style.position = "absolute";
        //values.style.top = "50px";
        values.className = "values";
        box.appendChild(values);
        
        //document.getElementById("playground").appendChild(box);
        //box.style.opacity = "0.8";
        //bigBox.appendChild(box);
           // document.getElementById("playground").appendChild(bigBox);
        return box;
    },
    
    highlightPlay: function(event){ 
        if(AALController._this._model._on === true){
            event.target.src = "img/box_imgs/play_hover.png";
        }
    },
    
    unhighlightPlay: function(event){
        event.target.src = "img/box_imgs/play.png";
    },
    
    highlightStop: function(event){
        //if(AALController._this._model._on === true){
            event.target.src = "img/box_imgs/stop_hover.png";
        //}
    },
    
    unhighlightStop: function(event){
        event.target.src = "img/box_imgs/stop.png";
    },
    
    /*createNewButton: function(id, viewEvent) {
        var button = document.createElement("button");
        button.id = "" + id + this._idNum++;
        
        button.onmousedown = function (e) {
            viewEvent.notify({ type: e });
        };
        
        document.getElementById("playground").appendChild(button);
        return button;
    },*/
    
    //deleting a box
    deleteBox: function(box) {
        //var box = event.target.parentNode;
	// First disconnect the audio
	this._model.disconnectNode(box);
	// Then delete the visual element
	box.parentNode.removeChild(box);
    },
    
    createSlider: function(element, label, invalue, inmin, inmax, stepUnits, units, updateEvent) {
        var group = document.createElement("div");
	group.className="slider-group";

	var info = document.createElement("div");
	info.className="slider-info";
	info.setAttribute("min", inmin );
	info.setAttribute("max", inmax );
	var lab = document.createElement("span");
	//lab.className="label";
	lab.appendChild(document.createTextNode(label + ": "));
	info.appendChild(lab);
	var val = document.createElement("span");
	val.className="value";
	val.appendChild(document.createTextNode("" + invalue + " " + units));

	// cache the units type on the element for updates
	val.setAttribute("units",units);
	info.appendChild(val);
        element.parentNode.appendChild(info);
        
        //info.style.position = "absolute";
        //info.style.top = "-20px";
        //info.style.width = "120px";

	group.appendChild(info);

/*
	var slider = document.createElement("div");
	slider.className="slider";
	group.appendChild(slider);

	element.appendChild(group);
	return $( slider ).slider( { slide: onUpdate, value: ivalue, min: imin, max: imax, step: stepUnits } );
*/
	var slider = document.createElement("input");
        slider.className += label;
	slider.type="range";
	slider.min = inmin;
	slider.max = inmax;
	slider.value = invalue;
	slider.step = stepUnits;
        slider.label = label;
	slider.oninput = function (e) {
            updateEvent.notify({ type: e });
        };
	group.appendChild(slider);
        //group.style.position = "absolute";
        //group.style.top = "60px";
        //group.style.left = "-15px";
        //group.className = "circle";

	element.appendChild(group);
	return slider;
    },
    
    updateSlider: function(event) {
	var target = event.target;
        
        var box = target;
	while (box && !box.classList.contains("box")){
            box = box.parentNode;
        }

	//TODO: yes, this is lazy coding, and fragile.
	//var output = e.parentNode.children[0].children[1];
        
        var valLabel = event.target.parentNode.querySelector(".value");
        //var valLabel = box.querySelector(".value");
        valLabel.innerHTML = "" + event.target.value + " " + valLabel.getAttribute("units");

	// update the value text
	//output.innerHTML = "" + event.target.value + " " + output.getAttribute("units");

	/*var module = e;
	while (module && !module.classList.contains("box"))
		module = module.parentNode;
        //module = module.querySelector(".box");*/
	return box;
    },
    
    onUpdateGain: function(event) {
        var box = this.updateSlider(event);
        this._model.updateGain(box, event);
    },
    
    onUpdateOscFrequency: function(event) {
        var box = this.updateSlider(event);
        this._model.updateOscFrequency(box, event);
    },
    
    onUpdateDelay: function(event) {
        var box = this.updateSlider(event);
        if(event.target.label === "Samps"){
            var slider = box.querySelector(".ms");
            slider.value = (event.target.value/this._model.getSampleRate()*1000).toFixed(2);
            var valLabel = slider.parentNode.querySelector(".value");
            valLabel.innerHTML = "" + slider.value + " " + valLabel.getAttribute("units");
        }
        else if(event.target.label === "ms"){
            var slider = box.querySelector(".Samps");
            var samples = (event.target.value/1000 * this._model.getSampleRate()).toFixed(0);
            slider.value = samples;
            var valLabel = slider.parentNode.querySelector(".value");
            valLabel.innerHTML = "" + samples + " " + valLabel.getAttribute("units");
        }
        this._model.updateDelay(box, event);
    },
    
    onUpdateVariableDelay: function(event) {
        var box = this.updateSlider(event);
        this._model.updateVariableDelay(box, event);
    },
    
    onUpdateLFOGain: function(event) {
        var box = this.updateSlider(event);
        this._model.updateLFOGain(box, event);
    },
    
    //menu links
    //clear the screen
    clearScreen: function() {
        this._model.clearPlayground();
        this._tempx = Math.floor(window.innerWidth/2) - 50;//250;
        this._tempy = Math.floor(window.innerHeight/2) - 50;//100;
        this._zIndex = 0;
        this._playing = false;
        this._drag.lineSelected = null;
        this._drag.boxesSelected = null;
        this._drag.boxesSelected = [];
    },
    
    disconnectBoxes: function(boxes) {
        if(boxes.length === 1){
            this._model.disconnectNode(boxes[0]);
            //this._model.playMessage("sel_boxes_disconnect");
            return "Disconnecting!";
        }
        
        if(boxes.length === 2){
            var connectingLine = null;
            var box = boxes[0];
            if(box.outputConnections){
                var i = 0;
                while(connectingLine === null && i < box.outputConnections.length) {
                    var connector = box.outputConnections[i];
                    if(connector.destination === boxes[1]){
                        connectingLine = connector.line;
                    }
                    i++;
                }
            }
            if(connectingLine === null && box.inputConnections){
                var i = 0; 
                while(connectingLine === null && i < box.inputConnections.length) {
                    var connector = box.inputConnections[i];
                    if(connector.source === boxes[1]){
                        connectingLine = connector.line;
                    }
                    i++;
                }
            }
            
            if(connectingLine === null){
                this._model.playMessage("noconnection");
                return "No connection found!";
            }
            this._drag.lineSelected = connectingLine;
            this.deleteLine("disconnect");
            connectingLine = null;
            return "Disconnecting!";
        }
        this._model.playMessage("sel_boxes_disconnect");
        return "Select one or two components to disconnect!";
    },
    
    createConnection: function(boxes) {
        var src = null;
        var dst = null;
        if(boxes[0].querySelector("div .circle-out") && boxes[1].querySelector("div .circle-in")){
            src = boxes[0];
            dst = boxes[1];
            if(src.outputConnections){
                var i = 0;
                while(i < src.outputConnections.length) { //check if there is that connection already
                    var connector = src.outputConnections[i];
                    if(connector.destination === dst){
                        src = null;
                        dst = null;
                        break;
                    }
                    i++;
                }
            } 
        }
        if(boxes[0].querySelector("div .circle-in") && boxes[1].querySelector("div .circle-out")){
            src = boxes[1];
            dst = boxes[0];
            if(src.outputConnections){
                var i = 0;
                while(i < src.outputConnections.length) { //check if there is that connection already
                    var connector = src.outputConnections[i];
                    if(connector.destination === dst){
                        src = null;
                        dst = null;
                        break;
                    }
                    i++;
                }
            } 
        }
        
        if(src === null || dst === null){
            this._model.playMessage("cannot_connect");
            return "Cannot connect!";
        }
        
        var off = src.querySelector("div .circle-out");
        src = off;
        var x1 = 5;
        var y1 = 5;

        while (off) {
            x1+=off.offsetLeft;
            y1+=off.offsetTop;
            off=off.offsetParent;
        }
        
        off = dst.querySelector("div .circle-in");
        dst = off;
        var x2 = 5;
        var y2 = 5;

        while (off) {
            x2+=off.offsetLeft;
            y2+=off.offsetTop;
            off=off.offsetParent;
        }
        var shape = document.createElementNS(this._svgns, "polyline");
        var points = "" + x1 + "," + y1 + " " + x2 + "," + y2;
        shape.setAttributeNS(null, "points", points);
        shape.setAttributeNS(null, "stroke", "#383838");
        shape.setAttributeNS(null, "fill", "none");
        shape.setAttributeNS(null, "stroke-width", "2");
        shape.onclick = this.lineCanDelete;
        /*var _this = this;
        shape.onclick = function (e) {
            _this._view.lineSelected.notify({ type: e });
        };*/
        this.setLineProperties(shape);

        document.getElementById("svgCanvas").appendChild(shape);
        this._model.connectNodes(src, dst, shape);
        
        return "Connecting!";
    },
    
    ////process of making a line
    //get new points
    getNewPoints: function(oldPoints, x2, y2/*, x3, y3*/) {
        var points = oldPoints + " " + x2 + "," + y2/* + " " + x3 + "," + y3*/;
        return points;
    },
    
    getNewPointsReverse: function(oldPointsReverse, x2, y2/*, x3, y3*/) {
	var points = /*x3 + "," + y3 + " " + */x2 + "," + y2 + " " + oldPointsReverse;
	return points;
    },
    
    //initiate a line, find the starting point
    startLine: function(event) {
        //console.log("starting line");
        if(this._drag.started !== true){
            this._drag.started = true;

            var target = event.target;
            if(target.nodeType === 3){
                target = target.parentNode;
            }
            if (target.classList) {	// if we don't have class, we're not a node.
                // if this is the green or red button, use its parent.
                //if (target.classList.contains("circle")){
                if (target.classList.contains("node-button")){
                    target = target.parentNode;
                }
            this._drag.startObj = target;
            }
            //console.log(target);
            // remember if this is an input or output node, so we can match
            this._drag.originIsInput = this._drag.startObj.classList.contains("circle-in");

            var off = event.target;
            var x = 5;
            var y = 5;

            while (off) {
                x+=off.offsetLeft;
                y+=off.offsetTop;
                off=off.offsetParent;
            }
            
            var shape = document.createElementNS(this._svgns, "polyline");
            this._drag.oldpoints = "" + x + "," + y;
            this._drag.oldpointsreverse = "" + x + "," + y;
            var points = this.getNewPoints(this._drag.oldpoints, x, y, x, y);
            //this._drag.startX = x;
            //this._drag.startY = y;
            //this._drag.startX1 = x;
            //this._drag.startY1 = y;

            shape.setAttributeNS(null, "points", points);
            shape.setAttributeNS(null, "stroke", "#383838");
            shape.setAttributeNS(null, "fill", "none");
            shape.setAttributeNS(null, "stroke-width", "2");
            shape.onclick = this.lineCanDelete;

            document.getElementById("svgCanvas").appendChild(shape);
            this._drag.line = shape;
            
            var _this = this;
            //make the end of the line follow the mouse moving
            //document.addEventListener("mousemove", lineDragged);
            document.addEventListener("mousemove", this.handlerDL = function (e) {
                _this._view.lineDragged.notify({ type: e });
            });
            
            //allow the user to release/finish the line
            //document.addEventListener("mouseup",allowDrawing);
            document.addEventListener("mouseup", this.handlerAD = function () {
                _this._view.lineDrawingAllowed.notify();
            });
            
            //release the line
            //document.addEventListener("dblclick",releaseLine);
            document.addEventListener("dblclick", this.handlerRL = function () {
                _this._view.lineReleased.notify();
            });
        }
        else{
            //console.log("here started");
        }
    },
    
    //adjust the end of the line following the moving mouse
    dragLine: function(event){
        //console.log("dragging line");   
        var x = event.clientX + window.scrollX;
        var y = event.clientY + window.scrollY;
        if(this._drag.originIsInput === false){
            var points = this.getNewPoints(this._drag.oldpoints,/* this._drag.startX, y,*/ x, y);
            this._drag.line.setAttributeNS(null, "points", points);
        }
        else{
            var points = this.getNewPoints(this._drag.oldpoints,/* x, this._drag.startY,*/ x, y);
            this._drag.line.setAttributeNS(null, "points", points);
        }
    },
    
    //allow drawing the line
    allowDrawing: function(){
        //console.log("drawing allowed");
        //document.removeEventListener("mouseup",allowDrawing);
        var _this = this;
        document.removeEventListener("mouseup", _this.handlerAD);
        //if user presses mouse button again (or clicks), release the line
        //document.addEventListener("mousedown",lineDraw);
        document.addEventListener("mousedown", this.handlerDRL = function (e) {
            _this._view.lineDrawn.notify({ type: e });
        });
    },
    
    //draw/finish line
    drawLine: function(event){
        //console.log("drawing line");
        var target = event.toElement;
        if(target.nodeType === 3){
            target = target.parentNode;
        }
        if (target.classList) {	// if we don't have class, we're not a node.
	    // if this is the green or red button, use its parent.
                           
	    //if (target.classList.contains("circle")){
            if (target.classList.contains("node-button")){
                target = target.parentNode;
            }
            if (target.classList.contains("circle")){
                this._drag.started = false;
                //document.removeEventListener("mousemove", lineDragged);
                document.removeEventListener("mousemove", this.handlerDL);
                //document.removeEventListener("mousedown",lineDraw);
                document.removeEventListener("mousedown", this.handlerDRL);
                //document.removeEventListener("dblclick",releaseLine);
                document.removeEventListener("dblclick", this.handlerRL);

                var off = event.target;
                var x = 5;
                var y = 5;

                while (off) {
                    x+=off.offsetLeft;
                    y+=off.offsetTop;
                    off=off.offsetParent;
                }

                if(target !== this._drag.startObj){
                    if(this._drag.originIsInput === false){
                        if (target.classList.contains("circle-in")){
                            // can connect!
                            var points = this.getNewPoints(this._drag.oldpoints,/* this._drag.startX, y,*/ x, y);
                            this._drag.line.setAttributeNS(null, "points", points);
                            this.setLineProperties(this._drag.line);
                           /* var _this = this; 
                            this._drag.line.onclick = function (e) {
                                _this._view.lineSelected.notify({ type: e });
                            };
                            this._drag.line.addEventListener("mouseenter", this.highlightLine);
                            this._drag.line.addEventListener("mouseleave", this.unhighlightLine);*/
                            this._model.connectNodes(this._drag.startObj, target, this._drag.line);
                            this._drag.line = null;
                            return;
                        }
                        
                        if (target.classList.contains("circle-out")) {
                            //cannot connect
                            this._drag.line.parentNode.removeChild(this._drag.line);
                            this._drag.line = null;
                            this._drag.oldpoints = "";
                            return;
                        }
                    }
                    else{
                        if (target.classList.contains("circle-out")) {
                                // can connect!
                                var points = this.getNewPointsReverse(this._drag.oldpointsreverse, /*x, this._drag.startY,*/ x, y);
                                this._drag.line.setAttributeNS(null, "points", points);
                                this.setLineProperties(this._drag.line);
                                /*var _this = this;
                                this._drag.line.onclick = function (e) {
                                    _this._view.lineSelected.notify({ type: e });
                                };
                                this._drag.line.addEventListener("mouseenter", this.highlightLine);
                                this._drag.line.addEventListener("mouseleave", this.unhighlightLine);*/
                                this._model.connectNodes(target, this._drag.startObj, this._drag.line);
                                this._drag.line = null;
                                return;
                        }
                        
                        if (target.classList.contains("circle-in")) {
                            //cannot connect
                            this._drag.line.parentNode.removeChild(this._drag.line);
                            this._drag.line = null;
                            this._drag.oldpoints = "";
                            return;
                        }
                    }
                }
                else{
                    this._drag.line.parentNode.removeChild(this._drag.line);
                    this._drag.line = null;
                    return;
                }
            }
        }

        var x = event.clientX + window.scrollX;
        var y = event.clientY + window.scrollY;
        
        if(this._drag.originIsInput === false){
            var points = this.getNewPoints(this._drag.oldpoints, /*this._drag.startX, y, */x, y);
            this._drag.line.setAttributeNS(null, "points", points);
            this._drag.oldpoints = this.getNewPoints(this._drag.oldpoints,/* this._drag.startX, y,*/ x, y);
        }
        else{
            var points = this.getNewPoints(this._drag.oldpoints,/* x, this._drag.startY, */x, y);
            this._drag.line.setAttributeNS(null, "points", points);
            this._drag.oldpoints = this.getNewPoints(this._drag.oldpoints,/* x, this._drag.startY, */x, y);
        }

        this._drag.oldpointsreverse = this.getNewPointsReverse(this._drag.oldpointsreverse,/* x, this._drag.startY,*/ x, y);
        //this._drag.startX = x;
        //this._drag.startY = y; console.log(this._drag.startX+" "+this._drag.startY);
    },
    
    releaseLine: function(){
        //console.log("releasing line");
        this._drag.started = false;
        //document.removeEventListener("mousemove", lineDragged);
        document.removeEventListener("mousemove", this.handlerDL);
	//document.removeEventListener("mousedown",lineDraw);
        document.removeEventListener("mousedown", this.handlerDRL);
        //document.removeEventListener("dblclick",releaseLine);
        document.removeEventListener("dblclick", this.handlerRL);
        
        this._drag.oldpoints = "";
        this._drag.oldpointsreverse = "";
        this._drag.line.parentNode.removeChild(this._drag.line);
	this._drag.line = null;
    },
    
    setLineProperties: function(line){
        var _this = this;
        line.onclick = function (e) {
            _this._view.lineSelected.notify({ type: e });
        };
        line.addEventListener("mouseenter", this.highlightLine);
        line.addEventListener("mouseleave", this.unhighlightLine);
    },
    
    //deleting a line
    selectLine: function(event){ //console.log("line selected");
        if(this._drag.lineSelected !== null){
            this.deselectLine("deselect");
        }
        if(this._drag.boxesSelected.length > 0){
            this.deselectBox("deselect");
        }
        var lineConnection = event.target;
        lineConnection.setAttributeNS(null, "stroke", "red" );
        var _this = this;
        lineConnection.removeEventListener("mouseenter", this.highlightLine);
        lineConnection.removeEventListener("mouseleave", this.unhighlightLine);
        //if(this._drag.lineSelected.length === 0){
            //window.addEventListener("keydown", deleteConnection);
            window.addEventListener("keydown", this.handlerDL = function (event) {
                _this._view.lineDeleted.notify({ type: event });
            });
            //window.addEventListener("mousedown", deselect);
            window.addEventListener("mousedown", this.handlerDSL = function (event) {
                _this._view.lineDeselected.notify({ type: event });
            });
        //}
        this._drag.lineSelected = lineConnection;
    },
    
    deselectLine: function(event) { //console.log(event);
        //check if box clicked
        /*var target = event.target;
        if(target.nodeType === 3){
            target = target.parentNode;
        }
        if(target.classList.contains("node-button")){
            target = target.parentNode;
        }
        if(target.classList.contains("circle")){
            return;
        }
        while (target && target.classList && !target.classList.contains("box")){
            target = target.parentNode;
        }
        if (!target || !target.classList)
            target = event.target;*/
        
        if(event === "deselect" || event.target.id === "svgCanvas"){//event.target !== this._drag.line){
            if(this._drag.lineSelected !== null){
                //window.removeEventListener("keydown", deleteConnection);
                window.removeEventListener("keydown", this.handlerDL); //console.log("line deselected");
                //window.removeEventListener("mousedown", deselect);
                window.removeEventListener("mousedown", this.handlerDSL);

                //for(var i=0; i<this._drag.lineSelected.length; i++){
                this._drag.lineSelected.setAttributeNS(null, "stroke", "#383838"); 
                this._drag.lineSelected.addEventListener("mouseenter", this.highlightLine);
                this._drag.lineSelected.addEventListener("mouseleave", this.unhighlightLine);
                //}
                this._drag.lineSelected = null;
                //this._drag.lineSelected = [];
            }
        }
    },
    
    highlightLine: function(event){ 
         var lineConnection = event.target;
         lineConnection.setAttributeNS(null, "stroke", "#cc965c" );
         
         //lineConnection.removeEventListener("mouseenter", this.highlightLine);
         //lineConnection.onmouseout = this.unhighlightLine;
    },
    
    unhighlightLine: function(event){ 
        var lineConnection = event.target;
         lineConnection.setAttributeNS(null, "stroke", "#383838" );
         
         //lineConnection.removeEventListener("mouseout", this.unhighlightLine);
         //lineConnection.onmouseenter = this.highlightLine;
    },
    
    deleteLine: function(event) { //console.log("line deleted");
        if(this._drag.lineSelected !== null){
            if(event.keyCode === 46 || event === "disconnect" || event.target.id === "delete"){
                //window.removeEventListener("keydown", deleteConnection);
                window.removeEventListener("keydown", this.handlerDL);
                //window.removeEventListener("mousedown", deselect);
                window.removeEventListener("mousedown", this.handlerDSL);
                
                //for(var i=0; i<this._drag.lineSelected.length; i++){
                    var connections = this._drag.lineSelected.destination.inputConnections;
                    //if(connections !== null){
                        this._model.breakSingleInputConnection( connections, connections.indexOf( this._drag.lineSelected.inputConnection ) );
                    //}
                //}
                this._drag.lineSelected = null;
               // this._drag.lineSelected = [];
            }
        }
    },
    
    //slecting a box
    selectBox: function(event) { 
        var target = event.target;
        if ((event.target.tagName === "SELECT")||(event.target.tagName === "INPUT")){
            return;
        }
        if ((event.target.tagName === "IMG")&&(this._model._on === true)&&(event.target.classList.contains("playButton"))){
            return;
        }
        
        if(target.nodeType === 3){
            target = target.parentNode;
        }
        if(target.classList.contains("node-button")){
            target = target.parentNode;
        }
        if(target.classList.contains("circle")){
            return;
        }
        while (target && !target.classList.contains("box")){
            target = target.parentNode;
        }
        if (!target)
            return;
        
        if(this._drag.lineSelected !== null){
            this.deselectLine("deselect");
        }
        
        if(!target.classList.contains("selected-box")){ //console.log("box selected");
            target.className += " selected-box";
            var values = target.querySelector(".values");
            values.className += " selected-info";
            /*var info = target.querySelector(".slider-info");
            if(info){
                info.className += " selected-info";
            }*/
            target.style.zIndex = ++this._zIndex;
            
            if(this._drag.boxesSelected.length === 0){
                var _this = this;
                //window.addEventListener("mousedown", deselect);
                window.addEventListener("mousedown", this.handlerDSB = function (event) {
                    _this._view.boxDeselected.notify({ type: event });
                });

                //window.addEventListener("keydown", deleteConnection);
                window.addEventListener("keydown", this.handlerDLB = function (event) {
                    _this._view.selectedBoxDeleted.notify({ type: event });
                });
            }

            this._drag.boxesSelected.push(target);
        }
    },
    
    deselectBox: function(event) { 
        /*var target = event.target;
        if(target.nodeType === 3){
            target = target.parentNode;
        }console.log(target.tagName);
        if(target.tagName === 'IMG'){
            target = target.parentNode.parentNode;
        }
        if(target.classList === true){
            if(target.classList.contains("circle")){
                return;
            }
            while (target && !target.classList.contains("box")){
                target = target.parentNode;
            }
            //if (target)
            //    return;
        }*/
        
        if(event === "deselect" || event.target.id === "svgCanvas"){//!target.classList.contains("box")){
            //console.log("box deselected");
            for(var i=0; i<this._drag.boxesSelected.length; i++){
                this._drag.boxesSelected[i].className = this._view.removeClass(this._drag.boxesSelected[i], "selected-box");
                var values = this._drag.boxesSelected[i].querySelector(".values");
                values.className = this._view.removeClass(values, "selected-info");
                /*var info = this._drag.boxesSelected[i].querySelector(".slider-info");
                if(info){
                    info.className = this._view.removeClass(info, "selected-info");
                }*/
            }
            this._drag.boxesSelected = null;
            this._drag.boxesSelected = [];
            //window.removeEventListener("keydown", deleteConnection);
            //window.removeEventListener("keydown", this.handlerDL);
            //window.removeEventListener("mousedown", deselect);
            window.removeEventListener("mousedown", this.handlerDSB);
        }
    },
    
    deleteSelectedBox: function(event) { 
        if(this._drag.boxesSelected !== null && this._drag.boxesSelected.length > 0){
            if(event.keyCode === 46 || event.target.id === "delete"){ //console.log("box deleted");
                //window.removeEventListener("keydown", deleteConnection);
                window.removeEventListener("keydown", this.handlerDLB);
                //window.removeEventListener("mousedown", deselect);
                window.removeEventListener("mousedown", this.handlerDSB);

                for(var i=0; i<this._drag.boxesSelected.length; i++){
                    this.deleteBox(this._drag.boxesSelected[i]);
                }
                this._drag.boxesSelected = null;
                this._drag.boxesSelected = [];
            }
        }
    },
    
    pickupIcon: function(event, box) { //console.log("picked up");
        //box.style.top = "" + event.clientY + "px";
        //box.style.left = "" + event.clientY + "px";
        this._drag.icon = box;
        
        //this._drag.iconStartLeft = event.clientX + window.scrollX;//parseInt(this._drag.box.style.left, 10);
        //this._drag.iconStartTop = event.clientY + window.scrollY;//parseInt(this._drag.box.style.top,  10);
        //this._drag.startX = event.clientX + window.scrollX;
        //this._drag.startY = event.clientY + window.scrollY;
        //this._drag.icon.style.top = this._drag.startY + "px";
        //this._drag.icon.style.left = this._drag.startX + "px";
        
        
        
        var _this = this;
        document.addEventListener("mousemove", _this.handlerDI = function (e) {
            _this._view.iconDragged.notify({ type: e });
        }, false);
        
        document.addEventListener("mouseup", _this.handlerRI = function (e) {
            _this._view.iconReleased.notify({ type: e });
        }, false);
    },
    
    dragIcon: function(event){ //console.log("dragging");
        //this._drag.icon.style.top = "" + event.clientY + "px";
        //this._drag.icon.style.left = "" + event.clientX + "px";
        
        /*var movedX = event.clientX + window.scrollX - this._drag.startX;
        var movedY = event.clientY + window.scrollY - this._drag.startY;
        var left = this._drag.iconStartLeft + movedX - 20;
        var top = this._drag.iconStartTop + movedY - 20; 

        this._drag.icon.style.left = "" + left + "px";
        this._drag.icon.style.top = "" + top + "px";*/
        
        this._drag.icon.dragged = true;
        
    },
    
    releaseIcon: function(event){ //console.log("released");
        var _this = this;
        document.removeEventListener("mousemove", _this.handlerDI, false);
        document.removeEventListener("mouseup", _this.handlerRI, false);
        document.getElementById("playground").appendChild(this._drag.icon);
        
        if(this._drag.icon.dragged === true){
           /* var movedX = event.clientX + window.scrollX - this._drag.startX;
            var movedY = event.clientY + window.scrollY - this._drag.startY;
            var left = this._drag.iconStartLeft + movedX - 20;
            var top = this._drag.iconStartTop + movedY - 20; */

            //this._drag.icon.style.left = "" + left + "px";
            //this._drag.icon.style.top = "" + top + "px";
            
            var left = event.clientX + window.scrollX - 20;
            var top = event.clientY + window.scrollY - 20;
            
            this._drag.icon.style.left = "" + left + "px";
            this._drag.icon.style.top = "" + top + "px";
            this._drag.icon.dragged = false;
        }
        //console.log(event.clientX + " " + event.clientY);
        //console.log(this._drag.icon);
        this._drag.icon = null;
        event.stopPropagation();
    },
    
    ////process of dragging a box
    pickupBox: function(event) {
        //console.log("pickingup"+event.target);
        var target = event.target;
        if ((event.target.tagName === "SELECT")||(event.target.tagName === "INPUT")){
            return;
        }
        if(target.nodeType === 3){
            target = target.parentNode;
        }
        if(target.classList.contains("circle") || target.classList.contains("node-button")){
            return;
        }
        while (target && !target.classList.contains("box")){
            target = target.parentNode;
        }
        if (!target)
            return;                 
        
        this._drag.box = target;
        this._drag.boxStartLeft = parseInt(this._drag.box.style.left, 10);
        this._drag.boxStartTop = parseInt(this._drag.box.style.top,  10);
        this._drag.startX = event.clientX + window.scrollX;
        this._drag.startY = event.clientY + window.scrollY;
        this._drag.box.style.zIndex = ++this._zIndex;
        
        //document.addEventListener("mousemove", dragBox, true);
        var _this = this;
        /*this._view.boxDragged.attach(function(event){
            _this.dragBox(event.type);
        });*/
        document.addEventListener("mousemove", _this.handlerD = function (e) {
            _this._view.boxDragged.notify({ type: e });
        });
        
        //document.addEventListener("mouseup", releaseBox, true);
        /*this._view.boxReleased.attach(function(event){
            _this.releaseBox(event.type);
        });*/
        
        document.addEventListener("mouseup", _this.handlerR = function (e) {
            _this._view.boxReleased.notify({ type: e });
        });
    },
    
    dragBox: function(event){
        //console.log(event);
        var movedX = event.clientX + window.scrollX - this._drag.startX;
        var movedY = event.clientY + window.scrollY - this._drag.startY;
        var left = this._drag.boxStartLeft + movedX;
        var top = this._drag.boxStartTop + movedY;

        this._drag.box.style.left = "" + left + "px";
        this._drag.box.style.top = "" + top + "px";

        var box = this._drag.box;
        if (box.inputConnections) {	// update any lines that point in here.
            var off = box.inputs;
            x = 7;
            y = 7;
            while (off) {
                x+=off.offsetLeft;
                y+=off.offsetTop;
                off=off.offsetParent;
            }
            for (var i = 0; i < box.inputConnections.length; i++) {
                this.updatePoints(box.inputConnections[i].line, x, y, true);
                }
            }

        if (box.outputConnections) {	// update any lines that point out of here.
            var off = box.outputs;
            x = 7;
            y = 7;
            while (off) {
                x+=off.offsetLeft;
                y+=off.offsetTop;
                off=off.offsetParent;
            }
            for (var i = 0; i < box.outputConnections.length; i++) {
                this.updatePoints(box.outputConnections[i].line, x, y, false);
            }
        }
    },
    
    releaseBox: function(){
        //console.log("here releasing box");
        //document.removeEventListener("mousemove", dragBox, true);
        
        var _this = this;
        document.removeEventListener("mousemove", _this.handlerD);
        /*this._view.boxDragged.detach(function(event){
            _this.dragBox(event.type);
        });*/
        
        //document.removeEventListener("mouseup", releaseBox, true);
        document.removeEventListener("mouseup", _this.handlerR);
        /*this._view.boxReleased.detach(function(event){
            _this.releaseBox(event.type);
        });*/
    },
    
    updatePoints: function(line, x, y, input) {
        var points = line.getAttributeNS(null,"points");
        var numPoints = points.split(" ");
        var numCoords = new Array();
        var c = 0;
        for(i = 0; i < numPoints.length; i++){
            var temp = numPoints[i].split(",");
            numCoords[c++] = temp[0];
            numCoords[c++] = temp[1];
        }

        if(input === false){
            numCoords[0] = "" + x;
            numCoords[1] = "" + y;
            //numCoords[2] = "" + x;
        }
        else{
            //numCoords[numCoords.length - 3] = "" + y;
            numCoords[numCoords.length - 2] = "" + x;
            numCoords[numCoords.length - 1] = "" + y;
        }

        points = "";
        for(i = 0; i < numCoords.length; i += 2){
            points = points + numCoords[i] + "," + numCoords[i+1];
            if(i !== numCoords.length - 2){
                points = points + " ";
            }

        }
        line.setAttributeNS(null, "points", points);
        return points;
    }
};
