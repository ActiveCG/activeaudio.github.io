/* 
 * Author: Denisa Skantarova & Sule Serubugo
			Bachelor Project 
			Aalborg University - Medialogy
			2015 
 */

function AALView(model, elements, menus, controls, examples){
    this._model = model;
    this._example = new Example();
    this._elements = elements;
    this._menus = menus;
    this._controls = controls;
    this._examples = examples;
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.overElement = null;
    
    //buttons to create boxes
    this.audioIconClicked = new Event(this);
    this.oscillatorIconClicked = new Event(this);
    this.gainIconClicked = new Event(this);
    this.LFOGainIconClicked = new Event(this);
    this.delayIconClicked = new Event(this);
    this.variableDelayIconClicked = new Event(this);
    this.addIconClicked = new Event(this);
    this.speakerIconClicked = new Event(this);
    this.analyzerIconClicked = new Event(this);
    this.iconDragged = new Event(this);
    this.iconReleased = new Event(this);
    
    //menu links
    this.clearLinkClicked = new Event(this);
    
    //gui controlls
    this.onOffClicked = new Event(this);
    
    //events on boxes
    this.playButtonClicked = new Event(this);
    //this.boxDeleted = new Event(this);
    this.oscillatorTypeSwitched = new Event(this);
    this.soundSourceSwitched = new Event(this);
    this.analyzerTypeSwitched = new Event(this);
    this.gainUpdated = new Event(this);
    this.oscFrequencyUpdated = new Event(this);
    this.delayUpdated = new Event(this);
    this.variableDelayUpdated = new Event(this);
    this.LFOGainUpdated = new Event(this);
    this.boxSelected = new Event(this);
    this.boxDeselected = new Event(this);
    this.selectedBoxDeleted = new Event(this);
    this.loopChanged = new Event(this);
    
    //deleting a line
    this.lineSelected = new Event(this);
    this.lineDeselected = new Event(this);
    this.lineDeleted = new Event(this);
    
    //making a line
    this.lineStarted = new Event(this);
    this.lineDragged = new Event(this);
    this.lineDrawingAllowed = new Event(this);
    this.lineDrawn = new Event(this);
    this.lineReleased = new Event(this);
    
    //dragging a box
    this.boxPickedUp = new Event(this);
    this.boxDragged = new Event(this);
    this.boxReleased = new Event(this);
    
    this.listModified = new Event(this);
    this.addButtonClicked = new Event(this);
    this.delButtonClicked = new Event(this);
    
    //initialize drag and drop of boxes
    /*var playground = document.getElementById('playground');
    playground.ondragover = function(event){
        //event.preventDefault();
    };
    playground.ondrop = function(event){
        event.preventDefault();
        var data = event.dataTransfer.getData("content"); 
        console.log(data);
        var box = document.getElementById(data);
        box.style.opacity = "1.0"; console.log(event.clientX);
        box.style.top = "" + event.clientY - 20 + "px";
        box.style.left = "" + event.clientX -20 + "px";
    };
    
    function allowDrop(event) {
        event.preventDefault();
    }*/
    
    var _this = this;
    document.addEventListener("mousemove", function(e){
        _this.mouseX = e.clientX;
        _this.mouseY = e.clienrY;
        _this.overElement = e.toElement;
    }, false);
    
    //make box icons clickable
    this._elements[0].onmousedown = function(event) {
        _this.audioIconClicked.notify({ type: event });
        //event.dataTransfer.setData("text", event.target.id);
    };
    
    this._elements[1].onmousedown = function(event) {
        _this.oscillatorIconClicked.notify({ type: event });
    };
    
    this._elements[2].onmousedown = function(event) {
        _this.gainIconClicked.notify({ type: event });
    };
    
     this._elements[3].onmousedown = function(event) {
        _this.LFOGainIconClicked.notify({ type: event });
    };
    
    this._elements[4].onmousedown = function(event) {
        _this.delayIconClicked.notify({ type: event });
    };
    
    this._elements[5].onmousedown = function(event) {
        _this.variableDelayIconClicked.notify({ type: event });
    };
    
    this._elements[6].onmousedown = function(event) {
        _this.addIconClicked.notify({ type: event });
    };
    
    this._elements[7].onmousedown = function(event) {
        _this.speakerIconClicked.notify({ type: event });
    };
    
    this._elements[8].onmousedown = function(event) {
        _this.analyzerIconClicked.notify({ type: event });
    };
    
    for(var i=0; i<this._elements.length; i++){
        this._elements[i].addEventListener("dragstart", function(e){
            var img = document.createElement("img");
            img.src = e.target.src;
            e.dataTransfer.setDragImage(img, 40, 20);
        }, false);
        
        this._elements[i].addEventListener("dragend", function(e){
            _this.iconReleased.notify({ type: e });
        }, false);
    }
    
    //make menu links clickable
    this._menus[0].onmousedown = function() {
        _this.clearLinkClicked.notify();
    };
    
    this._menus[1].onmousedown = function(event) {
        _this.lineDeleted.notify({ type: event});
        _this.selectedBoxDeleted.notify({ type: event});
    };
    
    this._menus[2].onmousedown = function() {
        _this.onOffClicked.notify();
    };
    
    this._menus[3].onmousedown = function(event) {
        _this.analyzerIconClicked.notify({ type: event });
    };
    
    //make controlls clickable
    this._controls[0].onmousedown = function(event) {
        _this.onOffClicked.notify();
    };
    
    this._controls[1].onmousedown = function() {
        _this.switchTab(event);
    };
    
    //examples to show
    for(var i=0; i<this._examples.length; i++){
        var _this = this;
        this._examples[i].onmousedown = function(event) {
            var example = event.target.id; 
            _this.showExamplePopup(example);
        };
    }
}

AALView.prototype = {
    switchTab: function(event) {
        if(event.target.classList.contains("tab-current") === false){
            var ul = event.target.parentNode.parentNode;
            tabs = ul.querySelectorAll( 'li > a' );

            for (var i=0; i<tabs.length; i++){
                tabs[i].className = '';
                var id = tabs[i].getAttribute("href").slice(1);
                //console.log(id);
                var div = document.getElementById(id);
                //console.log(div);
                div.className = this.removeClass(div, "content-current");
                //console.log(div.className);
            }
            event.target.className = 'tab-current';
            var id = event.target.getAttribute("href").slice(1);
            var div = document.getElementById(id);
            div.className = div.className + " content-current";
            //console.log(div.className);
        }
    },
    
    removeClass: function(obj, remove) {
        var newClassName = "";
        if(obj.className !== ""){
            var i;
            var classes = obj.className.split(" ");
            for(i = 0; i < classes.length; i++) {
                if(classes[i] !== remove) {
                    newClassName += classes[i] + " ";
                }
            }
        }
        return newClassName;
    },
    
    getPointedElement: function() {
        return this.overElement;
    },
    
    showExamplePopup: function(example){ 
        //var popup = document.getElementById("div");
        //popup.className = "example_popup";
        
        /*var close = document.createElement("div");
        close.className = "example-close";
        var x = document.createElement("h6");
        x.innerHTML = "x";
        close.appendChild(x);
        popup.appendChild(close);*/
        var popup = document.getElementById("example_popup");
        popup.style.visibility = "visible";
        var zIndex = popup.style.zIndex;
        popup.style.zIndex = 1000;
        
        var title = document.getElementById("title");
        title.innerHTML = this._example.getTitle(example);
        
        var text = document.getElementById("example-text");
        text.innerHTML = this._example.getText(example);
        
        var img = document.getElementById("example-img");
        if(this._example.getImage(example) !== ""){
            img.src = "img/example_imgs/"+ this._example.getImage(example);
            img.alt = this._example.getImage(example);
            img.style.display = "block";
        }
        else{
            img.src = ""; img.style.display = "none";
            img.alt ="";
        }
        
        var text1 = document.getElementById("example-text1");
        text1.innerHTML = this._example.getExtraText(example,1);
        var text2 = document.getElementById("example-text2");
        text2.innerHTML = this._example.getExtraText(example,2);
        var text3 = document.getElementById("example-text3");
        text3.innerHTML = this._example.getExtraText(example,3);
        if(example === "about"){
            text3.style.marginTop = "-20px";
        }
        else{
            text3.style.marginTop = "0px";
        }
        
        
        /*var param1 = document.getElementById("param1");
        param1.innerHTML = this._example.getParam(example,1);
        var param2 = document.getElementById("param2");
        param2.innerHTML = this._example.getParam(example,2);
        var param3 = document.getElementById("param3");
        param3.innerHTML = this._example.getParam(example,3);*/
        
        /*var content = this._example.getText(example);
        for(var i=0; i<content.length; i++){
            var text = document.createElement("h6");
            text.innerHTML = content[i];
            popup.appendChild(text);
        }*/
        //var text = document.createElement("h6");
        //text.innerHTML = this._example.getText(example);
        //popup.appendChild(text);
        //document.getElementById("playground").appendChild(popup);
        
        var close = document.getElementById("example-close");
        var _this = this;   
        close.addEventListener("mousedown", this.handlerHP = function(e){
            close.removeEventListener("mousedown", _this.handlerHP);
            var popup = document.getElementById("example_popup");
            popup.style.visibility = "hidden";
            popup.style.zIndex = zIndex;
            //popup.parentNode.removeChild(popup);
        });
    }
};
