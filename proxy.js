var proxy = function(){

	this.send = function(mode, method, endpoint, template, parameters){

		
		switch (mode){

			case 1:
				return  new Promise((resolve, reject)=>{
					var http = require("http");
					var xt = require("./template");
					var instance = new xt();
					var path = instance.fullfil(template, parameters).result;
				
					var opt = {
						host: endpoint,
						method: method,
						path:path,
						headers:{}		
					};	
					var result = "";
					var req = http.request(opt, (res)=>{
						console.log(res.statusCode);
						res.on("data", (data)=>{
							result += data.toString();
						
						}).on("end", ()=>{
							resolve(result);
						});
					}).on("error", (err)=>{
						console.log(err.message);
						reject(err);
					});
					req.end();
			
		                });
				break;
			default:
				break;
		}
	};
	
	this.standup = function(port){
		var http = require("http");
		var express = require("express");
		var app = express();
		var server = http.createServer(app);
		app.use("/", (req, res, next)=>{
			console.log(req.path);
			
			this.send(1, "get", "www.psnine.com", "/{group}{id}",{group:req.query["group"], id:(req.query["id"])?("/"+req.query["id"]):""})
			.then((result)=>{
				res.end(result);
			});	
		
			
		});
		app.listen(port);
	}
}

module.exports = proxy;
