var pModel = function(){

	var leftStack = [];
	var rightStatck = [];
	this.applyTemplate = function (template, parameters = null){
		var state = 0;
		var tmpWord = [];
		var places = [];
		var filled = [];
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
				 	filled[filled.length] = c;
				}
			}
			else{
				if(state){
					leftStack.pop();
					state = false;
					var parameterKey = tmpWord.join('');
					places[places.length] = parameterKey;
					console.log(parameterKey);
					for(var v of parameters[parameterKey].toString()){
						filled[filled.length] = v;
					}
					tmpWord = [];
					continue;
				}else{
					filled[filled.length] = c;
				}
			}
		}
		return {places:places, result: filled.join('')};
        };

};

var root  = function (){

	this.fullfil = function (template, parameters){
		
		var p = new pModel();
		return p.applyTemplate(template, parameters);
	};

};

module.exports = root;
