/* 
 * Author: 	Denisa Skantarova & Sule Serubugo
			Bachelor Project 
			Aalborg University - Medialogy
			2015 
 */


function SpeechRecognizer(notificationEvent) {
    
    var notificationEvent = notificationEvent;
	// Get some required handles
	var body = document.querySelector('body');
	var recStatus = document.getElementById('recStatus');
	var startRecBtn = document.getElementById('startRecBtn');
	var stopRecBtn = document.getElementById('stopRecBtn');
          
        // Define a new speech recognition instance
	var rec = null;
	try {
		rec = new webkitSpeechRecognition();
                 
	} 
	catch(e) {
            alert ("This browser doesnot suck");
    	//document.querySelector('.msg').setAttribute('data-state', 'show');
    	startRecBtn.setAttribute('disabled', 'true');
    	stopRecBtn.setAttribute('disabled', 'true');
        }
        
         if (rec) {
		rec.continuous = true;
		rec.interimResults = false;
		rec.lang = 'en';
                rec.maxAlternatives = 3;
                
                // Define a threshold above which we are confident(!) that the recognition results are worth looking at 
		var confidenceThreshold = 0.5;

                // Simple function that checks existence of s in str
		var userSaid = function(str, s) {
			return str.indexOf(s) > -1;
		};
                
                // Highlights the relevant command that was recognised in the command list for display purposes
		var highlightCommand = function(cmd) {
			var el = document.getElementById(cmd); 
			el.setAttribute('data-state', 'highlight');
			setTimeout(function() {
				el.setAttribute('data-state', '');
			}, 3000);
		};
                
                // Process the results when they are returned from the recogniser
		rec.onresult = function(e) {
			// Check each result starting from the last one
			for (var i = e.resultIndex; i < e.results.length; ++i) {
                            //console.log("su" + e.resultIndex);
				// If this is a final result
	       		if (e.results[i].isFinal) {
	       			// If the result is equal to or greater than the required threshold
                                //for (var j = 0; j < e.results[i].length; ++j) {
                                    //console.log(e.results[i][j].transcript);
                                //};
	       			if (parseFloat(e.results[i][0].confidence) >= parseFloat(confidenceThreshold)) {                               
                                var found = false;  
                                var j = 0;
                                var str = "";
                                    while(found === false && j < e.results[i].length){
		       			str = e.results[i][j].transcript;
                                        str = str.toLowerCase();
		       			//console.log('Recognised: ' + j + " "+ str);
		       			// If the user said 'video' then parse it further
		       			if (userSaid(str, 'audio')) {
                                            found = true;
                                        }
                                        j++;    
                                        }
                                        if(found === true){
                                            found = false;
                                            j = 0;
                                            while(found === false && j < e.results[i].length){
                                                str = e.results[i][j].transcript;
                                                str = str.toLowerCase();
                                                //console.log('Recognised2: ' + j + " "+ str);
                                            // Replay the audio
		       				if (userSaid(str, 'disconnect')) {   
		       					found = true;
                                                        body.style.background = "#faafa8";//d9887f";//red";
		       					highlightCommand('audiored');
                                                        notificationEvent.notify({ command: "audio disconnect"});
		       				}
                                                
                                                // Play the audio
		       				else if (userSaid(str, 'connect')) {
                                                        found = true;
		       					body.style.background = "#a4e38b";//green";
		       					highlightCommand('audiogreen');
                                                        notificationEvent.notify({ command: "audio connect"});
		       				}
		       				// play the audio
		       				else if (userSaid(str, 'play')) {
		       					found = true;
                                                        body.style.background = "#e3e38d";//yellow";
		       					highlightCommand('audioplay');
                                                        notificationEvent.notify({ command: "audio play"});
		       				}
                                                
                                                // Stop the audio
		       				else if (userSaid(str, 'stop')) {
		       					found = true;
                                                        body.style.background = "#757574";//black";
		       					highlightCommand('audiostop');
                                                        notificationEvent.notify({ command: "audio stop"});
		       				}
                                                else if (userSaid(str, 'what is this') || userSaid(str, 'how about this')) {
                                                        found = true;
                                                        body.style.background = "#ccaa78";//goldenrod";
		       					highlightCommand('whatisthis');
                                                        notificationEvent.notify({ command: "audio what is this"});
                                                }
                                            j++;
                                            }
                                            if(found === false){
                                                //highlightCommand('notunderstand');
                                                body.style.background = "#6992a8";//92cfd9";
                                                notificationEvent.notify({ command: "notunderstand"});
                                            }
                                        }
                                       }
                                       else{
                                           //highlightCommand('notunderstand');
                                           body.style.background = "#6992a8";//"#92cfd9";
                                           notificationEvent.notify({ command: "notunderstand"});
                                       }
                                    }
                                }
                            //};
                                
                        };
                            
                            // Start speech recognition
		var startRec = function() {
                    rec.start();
                    recStatus.innerHTML = 'recognising';
		};
		// Stop speech recognition
		var stopRec = function() {
                    rec.stop();
                    recStatus.innerHTML = 'not recognising';
		};
                
		// Setup listeners for the start and stop recognition buttons
		startRecBtn.addEventListener('click', startRec, false);
		stopRecBtn.addEventListener('click', stopRec, false);
                
                rec.onend = function(){
                    recStatus.innerHTML = 'not recognising';
                };
            };
};


