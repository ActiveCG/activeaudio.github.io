/* 
 * Author: 	Denisa Skantarova & Sule Serubugo
			Bachelor Project 
			Aalborg University - Medialogy
			2015 
 */
function Example(){
    
}
Example.prototype = {
    getTitle: function(example){
        var title = "";
        switch(example){
            case "flanger":
                title = "Flanger effect";
                break;
            case "about":
                title = "Hey Curious George,";
                break;
            case "voice":
                title = "Use your voice to build effects!";
                break;
        }
        return title;
    },
    
    getText: function(example){
        var text = "";
        switch(example){
            case "flanger":
                text = "A basic flanger effect consists of a variable\n\
 delay line with feedback, where an incoming signal is delayed between 0 and 10 ms.\n\
 It is then added to the original signal, resulting into a sweeping jet plane sound.";
                break;
            case "about":
                text = "Welcome to the Active Audio lab! This lab is a 6th semester Media\n\
 technology project, developed as a virtual tool aimed to give learners of Digital signal processing\n\
 (DSP) hands-on experience with the DSP theory they learn in textbooks and lectures. It was inspired by\n\
 some fellow colleagues that had a hard time learning DSP, so we made it as a proposal to simplify the \n\
learning and hopefully give them a better understanding of the theory.";
                break;
            case "voice":
                text = "Using speech is fairly straightforward. It only requires a microphone\n\
 (built-in or external) and patience. Start by clicking the start button in the right sidebar, then\n\
 unblock the use of a microphone in your browser.";
        }
        return text;
    },
    
    getImage: function(example){
        var img = "";
        switch(example){
            case "flanger":
                img = "flanger.png";
                break;
            case "about":
                img = "";
                break;
            case "voice":
                img = "ex_speech_0.png";
                break;
        }
        return img;
    },
    
    getExtraText: function(example, index){
        var text = [];
        switch(example){
            case "flanger":
                var t = "";
                text.push(t);
                text.push(t);
                text.push(t);
                break;
            case "about":
                var t = "We would like to thank the developers working on improving\n\
 the sound processing in the browser, supervisors and Aalborg university for their inspiration and help.";
                text.push(t);
                t = "Authors";
                text.push(t);
                t = "Sule and Denisa";
                text.push(t);
                break;
            case "voice":
                var t = "Afterwards hover or click-select the component you want to work with.";
                text.push(t);
                t = "Lastly, say one of the commands in the sidebar.";
                text.push(t);
                t = "In case of an error, the system will guide you through to the solution. Just \n\
make sure the speakers are open and have fun.";
                text.push(t);
                break;
        }
        return text[index-1];
    },
    
    getParam: function(example, index){
        var param = [];
        switch(example){
            case "flanger":
                param.push("LFO frequency: 0.1 - 1 Hz");
                param.push("Delay: 0 ms");
                param.push("Depth: 0 - 2 ms");
                break;
        }
        return param[index-1];
    },
};

