/* 
 * Author: 	Denisa Skantarova & Sule Serubugo
			Bachelor Project 
			Aalborg University - Medialogy
			2015 
 */
 function Analyzer(){
     this._analyzerTypes = ["Waveform","Spectrum","Spectrogram"];
     this._animationRunning = false;
     this._analyzers = [];
     Analyzer._this = this; 
 }
 
 Analyzer.prototype = {     
     onAnalyzerConnectInput: function(){
         var _this = Analyzer._this;
         // set up 
	 if (!_this._animationRunning) {
            _this._animationRunning = true; 
            _this.updateAnalyzers(0);
	 }
     },
     
     updateAnalyzers: function(time){
         var _this = Analyzer._this;
         /*var requestAnimationFrame = window.requestAnimationFrame ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame ||
                        window.msRequestAnimationFrame;*/
         //requestAnimationFrame(_this.updateAnalyzers);

	 for (var i = 0; i < _this._analyzers.length; i++)
            _this.updateAnalyzer(_this._analyzers[i]);
        
         if(_this._timer !== null){
             window.clearTimeout(_this._timer);
             _this._timer = null;
         }
         _this._timer = window.setTimeout(_this.updateAnalyzers, 38);
     },
     
     updateAnalyzer: function(box){
         if(box.analyzerType === this._analyzerTypes[0])
             this.drawWaveform(box);
         else if(box.analyzerType === this._analyzerTypes[1])
             this.drawSpectrum(box);
         else
             this.drawSpectrogram(box);
         
     },
     
     drawSpectrum: function(box){
        var SPACER_WIDTH = 1;
	var BAR_WIDTH = 1;
	//var OFFSET = 100;
	//var CUTOFF = 23;
	var ctx = box.drawingContext;
	var canvas = ctx.canvas;
	var numBars = Math.round(canvas.width / SPACER_WIDTH);
	var freqByteData = new Uint8Array(box.audioNode.frequencyBinCount);

	box.audioNode.getByteFrequencyData(freqByteData); 
	//analyser.getByteTimeDomainData(freqByteData);

	ctx.clearRect(0, 0, canvas.width, canvas.height);
  	ctx.fillStyle = '#F6D565';
  	ctx.lineCap = 'round';
	var multiplier = box.audioNode.frequencyBinCount / numBars;

	// Draw rectangle for each frequency bin.
	for (var i = 0; i < numBars; ++i) {
		var magnitude = 0;
		var offset = Math.floor( i * multiplier );
		// gotta sum/average the block, or we miss narrow-bandwidth spikes
		for (var j = 0; j< multiplier; j++)
			magnitude += freqByteData[offset + j];
		magnitude = magnitude / multiplier;
		//var magnitude2 = freqByteData[i * multiplier];
            ctx.fillStyle = "hsl( " + Math.round((i*360)/numBars) + ", 100%, 50%)";
            ctx.fillRect(i * SPACER_WIDTH, canvas.height, BAR_WIDTH, -magnitude);
	}
     },
     
     drawWaveform: function(box){
        //var SPACER_WIDTH = 1;
	var BAR_WIDTH = 1;
	//var OFFSET = 100;
	//var CUTOFF = 23;
	var ctx = box.drawingContext;
	var canvas = ctx.canvas;
	//var numBars = Math.round(canvas.width / SPACER_WIDTH);
	var timeDomainByteData = new Uint8Array(box.audioNode.frequencyBinCount);

	box.audioNode.getByteTimeDomainData(timeDomainByteData);

	ctx.clearRect(0, 0, canvas.width, canvas.height);
  	ctx.fillStyle = '#F6D565';
  	ctx.lineCap = 'round';

        for (var i = 0; i < timeDomainByteData.length; i++) {
            var value = timeDomainByteData[i] / 256;
            var y = canvas.height - (canvas.height * value) - 1;
            ctx.fillStyle = '#000';
            ctx.fillRect(i * canvas.width / timeDomainByteData.length, y, BAR_WIDTH, BAR_WIDTH);
        }
     },
     
     drawSpectrogram: function(box){
        //var SPACER_WIDTH = 1;
	var BAR_WIDTH = 1;
	//var OFFSET = 100;
	//var CUTOFF = 23;
	var ctx = box.drawingContext;
	var canvas = ctx.canvas;
	//var numBars = Math.round(canvas.width / SPACER_WIDTH);
	var freqByteData = new Uint8Array(box.audioNode.frequencyBinCount);

	box.audioNode.getByteFrequencyData(freqByteData);

  	ctx.fillStyle = '#F6D565';
  	ctx.lineCap = 'round';
        
        if(!box.column){
            box.column = 0;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        for (var i = 0; i < freqByteData.length; i++) {
            // Get the color from the color map, draw 1x1 pixel rectangle
            ctx.fillStyle = "rgba( " + freqByteData[i] + ", " + freqByteData[i]+ ", "
                + freqByteData[i] + ", 1)";
            ctx.fillRect(box.column, canvas.height - i, BAR_WIDTH, BAR_WIDTH);
        }
        // loop around the canvas when we reach the end
        box.column += 1;
        if(box.column >= canvas.width) {
            box.column = 0;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
     },
     
     resetAnalyzer: function(box){
         var ctx = box.drawingContext;
         var canvas = ctx.canvas;
         ctx.clearRect(0, 0, canvas.width, canvas.height);
         if(box.column){
            box.column = null;
        }
     }
 };