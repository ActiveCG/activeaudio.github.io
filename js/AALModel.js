/* 
 * Author: 	Denisa Skantarova & Sule Serubugo
			Bachelor Project 
			Aalborg University - Medialogy
			2015 
 */

function AALModel(){
    AALModel._this = this;
    this._analyzer = new Analyzer();
    //this._url = "sounds/trpt21_2.wav";
    this._on = false;
    this._oscTypes = ["sine","square","sawtooth","triangle"];
    this._audioBuffer = [];
    this._soundFiles = ["boogie.ogg","ding.wav","tolls.ogg","jungle.ogg","trumpet.wav","violin.wav"];
    this._messageBuffer = [];
    this._messages = ["didnot_understand.wav",
        "audiobuffer.wav","oscillator.wav","gain.wav","delay.wav","add.wav","speaker.wav",
        "cannot_connect.wav","hover_know_about.wav","noconnection.m4a","sel_boxes_connect.m4a","sel_boxes_disconnect.m4a",
        "connected.wav","disconnected.wav"];
    //this._source = null;
    
    this.playImageChanged = new Event(this);
    var _this = this;
    
    initContext();
    for(var i=0; i<this._soundFiles.length; i++){
        var url = "sounds/audiofiles/" + this._soundFiles[i];
        loadSound(url, this._audioBuffer, i);
    }
    
    for(var i=0; i<this._messages.length; i++){
        var url = "sounds/messages/" + this._messages[i];
        loadSound(url, this._messageBuffer, i);
    }
    
    /*var el = getElms();
    this._svg = null;
    el.onload = function(){
        var svg = el.contentDocument;
        svg.getElementById("box").setAttribute("fill", "red");
        svg.getElementById("output-circle").setAttribute("r", "20");
        alert("here");
        _this._svg = svg;console.log(_this._svg);
    };*/
    
    function initContext() {
        try {
            _this._audioContext = new AudioContext();
            //alert("context created"); //test
        }
        catch(e) {
            alert('Sorry, your browser does not support the Web Audio API.');
        }
    }
    
    function loadSound(url, buffersArray, index) {
        var request = new XMLHttpRequest();
        request.open('GET', url, true);
        request.responseType = 'arraybuffer';
        request.onload = function() {
            //alert("sound loaded"); //test
            _this._audioContext.decodeAudioData(request.response, function(buffer) {
                buffersArray[index] = buffer;
                //alert("sound decoded"); //test
            });
        };
        request.send();
    }
    
    /*function getElms(){
        var elms = document.createElement("object");
        elms.type = "image/svg+xml";
        elms.data = "svg/audio_box.svg";
        elms.style.left = "250px";
        elms.style.top = "100px";
        document.getElementById("playground").appendChild(elms);
        return elms;
    }*/
}

AALModel.prototype = {
    getSampleRate: function(){
        return this._audioContext.sampleRate;
    },
    
    createAudio: function(box){
        var nodeType = "audiobuffer";
        box.setAttribute("audioNodeType", nodeType );
        box.className="box " + nodeType;
        
        box.bufferIndex = 0;
        //console.log(box);
        return box;
    },
    
    createOscillator: function(box) {
        var nodeType = "oscillator";
        box.setAttribute("audioNodeType", nodeType );
        box.className="box " + nodeType;
        
        // Cache default values on node element
	box.oscillatorFrequency = 440;
	//osc.oscillatorDetune = 0;
	box.oscillatorType = "sine";
        if(this._on === true){
            this.playOscillator(box);
        }
        return box;
    },
    
    createGain: function(box) {
        var nodeType = "gain";
        box.setAttribute("audioNodeType", nodeType );
        box.className="box " + nodeType + " circular";
        
        var gainNode = this._audioContext.createGain();
	gainNode.gain.value = 1;
	box.audioNode = gainNode;
        //box.parentNode.querySelector("label").innerHTML = gainNode.gain.value;
        return box;
    },
    
    createDelay: function(box) {
        var nodeType = "delay";
        box.setAttribute("audioNodeType", nodeType );
        box.className="box " + nodeType;
        
        var delayNode = this._audioContext.createDelay();
	delayNode.delayTime.value = 1/this._audioContext.sampleRate;
        box.audioNode = delayNode;
        return box;
    },
    
    createVariableDelay: function(box) {
        var nodeType = "variabledelay";
        box.setAttribute("audioNodeType", nodeType );
        box.className="box " + nodeType;
        
        var osc = this._audioContext.createOscillator();
        osc.type = osc.SINE;
        osc.frequency.value = 0.5; //speed
        var gain = this._audioContext.createGain();
        gain.gain.value = 30/1000.0; //depth
        osc.connect(gain); //LFO
        
        var delayNode = this._audioContext.createDelay();
        delayNode.delayTime.value = 0.02;
	gain.connect(delayNode.delayTime); //vary delay length with LFO
        
        /*var inputNode = this._audioContext.createGain();
        var wetGain = this._audioContext.createGain();
        wetGain.gain.value = 1;
        inputNode.connect(delayNode);
        delayNode.connect(wetGain);
        inputNode.connect(wetGain);*/
        
        box.audioNode = delayNode;//inputNode;
        //box.outputAudioNode = wetGain;
        box.oscillatorNode = osc;
        box.gainNode = gain;
        return box;
    },
    
    createLFOGain: function(box) {
        var nodeType = "lfogain";
        box.setAttribute("audioNodeType", nodeType );
        box.className="box " + nodeType;
        
        var osc = this._audioContext.createOscillator();
        osc.type = osc.TRIANGLE;
        osc.frequency.value = 0.5; //speed
        var gain = this._audioContext.createGain();
        gain.gain.value = 1.0;//30/1000.0; //depth
        osc.connect(gain); //LFO
        
        var gainNode = this._audioContext.createGain();
        gainNode.gain.value = 1.0;
	gain.connect(gainNode.gain); //vary delay length with LFO
        
        /*var inputNode = this._audioContext.createGain();
        var wetGain = this._audioContext.createGain();
        wetGain.gain.value = 1;
        inputNode.connect(delayNode);
        delayNode.connect(wetGain);
        inputNode.connect(wetGain);*/
        
        box.audioNode = gainNode;//inputNode;
        //box.outputAudioNode = wetGain;
        box.oscillatorNode = osc;
        box.gainNode = gain;
        return box;
    },
    
    /*createLFO: function(box) {
        var nodeType = "lfo";
        box.setAttribute("audioNodeType", nodeType );
        box.className="box " + nodeType;
        
        var osc = this._audioContext.createOscillator();
        osc.type = osc.SINE;
        osc.frequency.value = 0.5; //speed
        var gain = this._audioContext.createGain();
        gain.gain.value = 30/1000.0; //depth
        osc.connect(gain); //LFO
        
        box.audioNode = gain;
        box.oscillatorNode = osc;
        return box;
    },*/
    
    createAdd: function(box) {
        var nodeType = "add";
        box.setAttribute("audioNodeType", nodeType );
        box.className="box circular " + nodeType;
        
        var gainNode = this._audioContext.createGain();
	gainNode.gain.value = 1.0;
	box.audioNode = gainNode;
        return box;
    },
    
    createSpeaker: function(box){
        box.audioNode = this._audioContext.destination;
        var nodeType = "speaker";
        box.setAttribute("audioNodeType", nodeType );
        box.className="box " + nodeType + " circular";
        //console.log(box);
        return box;
    },
    
    createAnalyzer: function(box) {
        var nodeType = "analyzer";
        box.setAttribute("audioNodeType", nodeType );
        box.className="box " + nodeType + " analyzer";
        
        var analyzerNode = this._audioContext.createAnalyser();
        box.audioNode = analyzerNode;
        box.analyzerType = this._analyzer._analyzerTypes[0];
        
        analyzerNode.smoothingTimeConstant = "0.25"; // not much smoothing
	analyzerNode.fftSize = 512;
	analyzerNode.maxDecibels = 0;
	box.onConnectInput = this._analyzer.onAnalyzerConnectInput;
        this._analyzer._analyzers.push(box);	// Add to the list of analysers in the animation loop
        
        /*var canvas = box.querySelector('canvas');
        var canvasContext = canvas.getContext("2d");
        canvasgl = canvasContext;
        analyzerNode.fftSize = 2048;
        var scriptNode = this._audioContext.createScriptProcessor(2048,1,1);
        
        
        var _this = this;
        var array = new Uint8Array(analyzerNode.frequencyBinCount);
        scriptNode.onaudioprocess = function(e){
            analyzerNode.getByteTimeDomainData(array);
            if(_this._on === true){
                _this.drawTimeDomain(array);
            }
        };
        
        analyzerNode.connect(scriptNode);
        scriptNode.connect(this._audioContext.destination);
        
        box.audioNodeScript = scriptNode;*/
        
        return box;
    },
    
    /*drawTimeDomain: function(array){
        console.log("here");
        //console.log(e);
        canvasgl.clearRect(0,0,180,120);
        canvasgl.fillStyle = "#000";
        canvasgl.fillRect(0,0,180,120);
        for(var i = 0; i < array.length; i++){
            var value = array[i];
            canvasgl.fillRect(i*3,400-value,1,400);
        }
    },*/
    
    playPlayground: function(clear) {
        var playground = document.getElementById("playground");
        var oscillators = playground.querySelectorAll(".oscillator");
        var LFOsVD = playground.querySelectorAll(".variabledelay");
        var LFOsG = playground.querySelectorAll(".lfogain");
        var playButtons = playground.querySelectorAll(".box .playButton");
        var target = document.getElementById("on-off");
        var target2 = document.getElementById("playL");
        if(this._on === false && clear !== "clear"){ //turn on
            this._on = true;
            target.innerHTML = "Stop";
            target2.innerHTML = "Stop";
            
            for(var i=0; i<oscillators.length; i++){
                this.playOscillator(oscillators[i]);
            }
            
            for(var i=0; i<LFOsVD.length; i++){
                this.playLFO(LFOsVD[i].oscillatorNode);
            }
            
            for(var i=0; i<LFOsG.length; i++){
                this.playLFO(LFOsG[i].oscillatorNode);
            }
            
            for(var i=0; i<playButtons.length; i++){
                this.playSound(playButtons[i]);
            }
        }
        else{ //turn off
            this._on = false;
            target.innerHTML = "Run";
            target2.innerHTML = "Run";
            
            for(var i=0; i<oscillators.length; i++){
                if(oscillators[i].isPlaying === true){
                    this.stopOscillator(oscillators[i]);
                }
            }
            
            for(var i=0; i<LFOsVD.length; i++){
                if(LFOsVD[i].isPlaying === true){
                    this.stopLFO(LFOsVD[i].oscillatorNode);
                }
            }
            
            for(var i=0; i<LFOsG.length; i++){
                if(LFOsG[i].isPlaying === true){
                    this.stopLFO(LFOsG[i].oscillatorNode);
                }
            }

            for(var i=0; i<playButtons.length; i++){
                if(playButtons[i].isPlaying === true){
                    this.stopSound(playButtons[i]);
                }
            }
             //stop all sounds
             /*var speakers = document.getElementById("playground").querySelectorAll(".speaker");
             if(speakers){
                 for(var s=0; s<speakers.length; s++){
                     if(speakers[s].inputConnections){
                         var inputNodes = speakers[s].inputConnections;
                         this.disconnectNode(speakers[s]);
                         for(var i=0; i<inputNodes.length; i++){
                             
                         }
                     }
                 }
             }*/
        }
    },
    
    playOscillator: function(box) {
        var oscNode = this._audioContext.createOscillator();
        oscNode.frequency.value = box.oscillatorFrequency;
        //oscNode.detune.value = e.oscillatorDetune;
        oscNode.type = box.oscillatorType;
        box.audioNode = oscNode;
        box.isPlaying = true;
        if (box.outputConnections) {
                box.outputConnections.forEach(function(connection){  
                    oscNode.connect(connection.destination.audioNode ); });
        }
        oscNode.start(0);
    },
    
    stopOscillator: function(box) {
        box.isPlaying = false;
        box.audioNode.stop(0);
        box.audioNode = null;
    },
    
    playLFO: function(lfo){
        lfo.isPlaying = true;
        lfo.start(0);
    },
    
    stopLFO: function(lfo){
        lfo.isPlaying = false;
        lfo.stop(0);
    },

    playSound: function(event) {
        if(this._on === true){
            var playButton = null;
            if(event.classList){
                playButton = event;
            }
            else{
                playButton = event.target;
            }
            if(playButton.isPlaying){
                this.stopSound(playButton);
            }
            else{
                playButton.isPlaying = true;
                this.playImageChanged.notify({ type: "stopIcon" });
                playButton.src = "img/box_imgs/stop.png";//innerHTML = "Stop";

                var box = playButton.parentNode;
                while (box && !box.classList.contains("box")){
                    box = box.parentNode;
                }
                if (!box){
                    return;
                }

               // if(box.getAttribute('audioNodeType') === "audiobuffer"){
                    box._source  = box.audioNode = this._audioContext.createBufferSource();
                    box._source.buffer = this._audioBuffer[box.bufferIndex];

                    if (box.outputConnections) {
                        box.outputConnections.forEach(function(connection){  
                            box._source.connect( connection.destination.audioNode );});
                    }
                    //this._source.connect(this._audioContext.destination);
                    box._source.start();
                    box._source.startTime = this._audioContext.currentTime; 
                    if(box.querySelector(".checkbox").checked === true){
                      box._source.loop = true;
                    }
                    else{
                      var delay = Math.floor(box._source.buffer.duration * 1000) + 1;
                      box._source.stopTimer = window.setTimeout( this.stopSound, delay, playButton );
                    }
               /* }
                else { //oscillator
                    var oscNode = this._audioContext.createOscillator();
                    oscNode.frequency.value = box.oscillatorFrequency;
                    //oscNode.detune.value = e.oscillatorDetune;
                    oscNode.type = "sine";//.oscillatorType;
                    box.audioNode = oscNode;
                    if (box.outputConnections) {
                            box.outputConnections.forEach(function(connection){  
                                oscNode.connect(connection.destination.audioNode ); });
                    }
                    oscNode.start(0);
                }*/
            }
        }
    },
    
    stopSound: function(playButton) {
        playButton.isPlaying = false;
        AALModel._this.playImageChanged.notify({ type: "playIcon" });
        
        var box = playButton.parentNode;
        while (box && !box.classList.contains("box")){
            box = box.parentNode;
        }
        if (!box){
            return;
        }
        //if (box._source) {
        if (box._source.stopTimer) {
              window.clearTimeout(box._source.stopTimer);
              box._source.stopTimer = 0;
        }
        //if(box.getAttribute('audioNodeType') === "audiobuffer"){
            box._source.stop();
        /*}
        else{ //oscillator
            box.audioNode.stop(0);
            box.audioNode = null;
        }*/
        playButton.src = "img/box_imgs/play.png";//innerHTML = "Play";
    },
    
    changeLoop: function(event) {
        var box = event.target.parentNode;
        while (box && !box.classList.contains("box")){
            box = box.parentNode;
        }
        if (!box){
            return;
        }
        if(box._source){
	if(event.target.checked === true){
            box._source.loop = true;
            if ( box._source.stopTimer ) {
                window.clearTimeout(box._source.stopTimer);
                box._source.stopTimer = 0;
            }
        }
        else{
            box._source.loop = false;
            var delay = Math.floor( box._source.buffer.duration * 1000) + 1;
            var current = Math.floor((this._audioContext.currentTime - box._source.startTime) * 1000) + 1;
            if(current > delay){
                current = current - Math.floor(current / delay) * delay;
            }
            delay -= current;
            var playButton = box.querySelector(".playButton");
            //console.log(box._source.startTime + " "+this._audioContext.currentTime);
            box._source.stopTimer = window.setTimeout( this.stopSound, delay, playButton );
        }
    }
    },
    
    switchOscillatorType: function(event) {
        var select = event.target;

	var box = select.parentNode;
	while (box && !box.classList.contains("box")){
            box = box.parentNode;
        }
	if (box) {
            //cache the type
            box.oscillatorType = this._oscTypes[select.selectedIndex];
            
            var img = box.querySelector("div > img");
            img.src = "img/box_imgs/" + box.oscillatorType + ".png";

            // if we have a playing oscillator, go ahead and switch it live
            if (box.audioNode){
                box.audioNode.type = this._oscTypes[select.selectedIndex];
            }
	}
    },
    
    switchSoundSource: function(event) {
        var select = event.target;

	var box = select.parentNode;
	while (box && !box.classList.contains("box")){
            box = box.parentNode;
        }
	if (box) {
            box.bufferIndex = select.selectedIndex;

            // if we have a playing oscillator, go ahead and switch it live
            //if (box.audioNode){
            //    box.audioNode.type = this._oscTypes[select.selectedIndex];
            //}
	}
    },
    
    switchAnalyzerType: function(event) {
        var select = event.target;

	var box = select.parentNode;
	while (box && !box.classList.contains("box")){
            box = box.parentNode;
        }
	if (box) {
            //cache the type
            box.analyzerType = this._analyzer._analyzerTypes[select.selectedIndex];
            
            //var img = box.querySelector("div > img");
            //img.src = "img/box_imgs/" + box.oscillatorType + ".png";

            this._analyzer.resetAnalyzer(box);
            
	}
    },
    
    updateGain: function(box, event) {
        box.audioNode.gain.value = event.target.value;
    },
    
    updateOscFrequency: function(box, event) {
        box.oscillatorFrequency = event.target.value;
        if(box.audioNode){
            box.audioNode.frequency.value = event.target.value;
        } 
    },
    
    updateDelay: function(box, event) {
        if(event.target.label === "Samps"){
            var delay_sec = event.target.value/this._audioContext.sampleRate;
            box.audioNode.delayTime.value = delay_sec;
        }
        else if(event.target.label === "ms"){
            var delay_sec = event.target.value/1000;
            box.audioNode.delayTime.value = delay_sec;
        }
    },
    
    updateVariableDelay: function(box, event) { 
        if(event.target.label === "LFO"){
            box.oscillatorNode.frequency.value = event.target.value; 
        }
        else if(event.target.label === "Depth"){
            var value = event.target.value/1000.0;
            box.gainNode.gain.value = value; 
        }
        else if(event.target.label === "Delay"){
            var value = event.target.value/1000.0;
            box.audioNode.delayTime.value = value; 
        }
    },
    
    updateLFOGain: function(box, event) { 
        if(event.target.label === "LFO"){
            box.oscillatorNode.frequency.value = event.target.value; 
        }
        else if(event.target.label === "Depth"){
            //var value = event.target.value/1000.0;
            box.gainNode.gain.value = event.target.value; //value; 
        }
        else if(event.target.label === "Gain"){
            box.audioNode.gain.value = event.target.value;
        }
    },
    
    connectNodes: function(src, dst, line) {
        // We want to be dealing with the audio node elements from here on
	src = src.parentNode;
	dst = dst.parentNode;
	
	// Put an entry into the source's outputs
	if (!src.outputConnections)
		src.outputConnections = [];
	var connector = {};
	connector.line = line;
	connector.destination = dst;
	src.outputConnections.push(connector);
        
	// Put an entry into the destinations's inputs
	if (!dst.inputConnections)
		dst.inputConnections = [];
	connector = {};
	connector.line = line;
	connector.source = src;
	connector.destination = dst;
	dst.inputConnections.push(connector);
	
	// if the source has an audio node, connect them up.  
	// AudioBufferSourceNodes may not have an audio node yet.
	if (src.audioNode )
                src.audioNode.connect(dst.audioNode);

	if (dst.onConnectInput)
		dst.onConnectInput();

	line.inputConnection = connector;
	line.destination = dst;
        //line = null;
        //console.log("connected");
        this.playMessage("connected");
    },
    
    disconnectNode: function(box) {
        //for all nodes we connect to,
	if (box.outputConnections) {
            for (var i=0; i<box.outputConnections.length; i++) {
                var connector = box.outputConnections[i];
                // find each dstElement and remove us from the dst.inputConnections,
                var connections = connector.destination.inputConnections;
                connections.splice( connections.indexOf(box), 1);
                // and delete the line 
                connector.line.parentNode.removeChild( connector.line );
            }
            // empty our outputConnections
            box.outputConnections = null;
	}

	// then call disconnect() on our audioNode to clear all outbound connections
	// (this is what clear the audio connection, for all outbound connections at once)
	if (box.audioNode && box.audioNode !== this._audioContext.destination){	// we may not have an audioNode, if we're a BSN or an Oscillator
            box.audioNode.disconnect();
        }

	//for all nodes connecting to us - (aka in us.inputConnections)
	if (box.inputConnections) {
            for (var i=0; i<box.inputConnections.length; i++) {
                var connector = box.inputConnections[i];
                // this is trickier, because we'll have to destroy all their outbound connections.
                // TODO: this will suck for source nodes.
                var src = connector.source;
                var connections = src.outputConnections;
                // delete us from their .outputConnections,
                var ix = -1;
                for(var i=0; i < src.outputConnections.length; i++){
                    if(src.outputConnections[i].destination === box){
                        ix = i;
                    }
                }
                connections.splice(ix, 1);

                if (src.audioNode) {	// they may not have an audioNode, if they're a BSN or an Oscillator
                    // call disconnect() on the src,
                    src.audioNode.disconnect();
                    // if there's anything in their outputConnections, re.connect() those nodes.
                    // TODO: again, this will break due to src resetting.
                    for (var j=0; j<connections.length; j++){
                        src.audioNode.connect(connections[j].destination.audioNode);
                    }
                }
                // and delete the line 
                connector.line.parentNode.removeChild( connector.line );
            }
            // empty inputConnections
            box.inputConnections = null;
	}
        this.playMessage("disconnected");
    },
    
    breakSingleInputConnection: function(connections, index) {
        var connector = connections[index];
        var src = connector.source;
        var ix = -1;
        for(var i=0; i < src.outputConnections.length; i++){
            if(src.outputConnections[i].destination === connector.destination){
                ix = i;
            }
        }
        src.outputConnections.splice(ix, 1);
        
        if (src.audioNode) {	// they may not have an audioNode, if they're a BSN or an Oscillator
            // call disconnect() on the src,
            src.audioNode.disconnect();
            // if there's anything left in their outputConnections, re.connect() those nodes.
            // TODO: again, this will break due to src resetting.
            for (var j=0; j<src.outputConnections.length; j++){
                src.audioNode.connect(src.outputConnections[j].destination.audioNode);
            }
        }

        // and delete the line 
        connector.line.parentNode.removeChild( connector.line );
        // finally, remove us from the line.
        connections.splice( index, 1 );
        this.playMessage("disconnected");
    },
    
    clearPlayground: function() {
        this.playPlayground("clear");
        var node = document.getElementById("playground");
        var canvas = document.getElementById("svgCanvas");
        while (node.firstChild){
            /*if(node.firstChild._source){
                node.firstChild._source.stop();
            }*/
            if(node.firstChild.audioNode) { //console.log(node.firstChild.outputConnections);
                this.disconnectNode(node.firstChild);
                //console.log(node.firstChild);
            }
            node.removeChild(node.firstChild);
        }
        node.appendChild(canvas);

        node = canvas;//document.getElementById("svgCanvas");
        while (node.firstChild){
            node.removeChild(node.firstChild);
        }
    },
    
    playMessage: function(msg) {
        var index = -1;
        var i = 0;
        while(i < this._messages.length){
            if(this._messages[i].indexOf(msg) >= 0){
                index = i;
                break;
            }
            i++;
        }
        
        var source = this._audioContext.createBufferSource();
        source.buffer = this._messageBuffer[index];
        source.connect(this._audioContext.destination);
        source.start();
    }
};

