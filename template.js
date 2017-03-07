var pModel = function(){

	var leftStack = [];
	var rightStatck = [];
	this.getPlaces = function (template){
		var state = 0;
		var tmpWord = [];
		var places = [];
		for(var c of template){
			if(c == '{'){
				if(!state){
					leftStack.push(c);
					state = true;
					continue;
				}
				else{
					console.log("wrong template: nest {}.");
					return false;
				}
			}
			else if(c != '}'){
				if(state){
					tmpWord[tmpWord.length] = c;
				}else{
					//ingore;
				}
			}
			else{
				if(state){
					leftStack.pop();
					state = false;
					places[places.length] = tmpWord.join('');
					tmpWord = [];
					continue;
				}else{
					//ingore;
				}
			}
		}
		return places;
        }

};

var root  = function (){

	this.fullfil = function (template, paramters){
		
		
	};

	this.testTemplate = function(template){
		var p = new pModel();
		return p.getPlaces(template);
	};
};

module.exports = root;
