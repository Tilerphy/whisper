var pModel = function(){

	var leftStack = [];
	var rightStatck = [];
	this.applyTemplate = function (template, parameters = null){
		
		var state = false;
		var tmpWord = [];
		var places = [];
		var filled = [];
		if(template == null || template == "" || parameters == null || parameters.length == 0){
			return {places:places, result:template};
		}
		for(var c of template){
			if(c == '{'){
				state = !state;
				if(state){
					leftStack.push(c);
					continue;
				}
				else{
					filled[filled.length] =c;
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
				state=!state;
				if(!state){
					var hasLeft = leftStack.pop();
					var parameterKey = tmpWord.join('');
					places[places.length] = parameterKey;
					console.log(hasLeft);
					if(hasLeft && tmpWord.length > 0 ){
						for(var v of parameters[parameterKey] ? parameters[parameterKey].toString() : "undefined"){
							filled[filled.length] = v;
						}
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
		console.log(template);
		var p = new pModel();
		return p.applyTemplate(template, parameters);
	};

};

module.exports = root;
