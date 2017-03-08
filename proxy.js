var proxy = function(){

	this.send = function(mode, method, endpoint, template, parameters, headers){

		
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
						headers:headers
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
			case 2:
				return new Promise((resolve, reject)=>{
					var http = require("http");
					var xt = require("./template");
					var instance = new xt();
					var path = instance.fullfil(template["path"], parameters["path"]).result;
					var postData = instance.fullfil(template["data"], parameters["data"]).result;
					var opt = {
						host:endpoint,
						method: method,
						path: path,
						headers:{
							'Content-Type': 'application/x-www-form-urlencoded',
      							'Content-Length': postData.length
						}
					};
					if(headers){
						for(var key in headers){
							opt.headers[key] = headers[key];
						}
					}
					var result = "";
					var req = http.request(opt, (res)=>{
						res.on("data", (data)=>{
							result += data.toString();
						}).on("end", ()=>{
							resolve(result);
						});
					}).on("error", (err)=>{
						console.log(err.message);
						reject(err);
					});
					req.write(postData);
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
		app.use("/1", (req, res, next)=>{
			console.log(req.query["parameters"]);
			
			this.send(1, "get",req.query["site"], req.query["template"],JSON.parse(req.query["parameters"]))
			.then((result)=>{
				res.end(result);
			});	
		
			
		});

		app.use("/2", (req, res, next)=>{

			console.log(req.path);
			var postData = "";
			req.on("data", (data)=>{
				postData += data.toString();
			});
			req.on("end", ()=>{
				var postDataInstance = JSON.parse(postData);
				this.send(2, "post", req.query["site"], postDataInstance["template"], postDataInstance["parameters"])
				.then((result)=>{
					res.end(result);
				});

			});
			
		});
		app.listen(port);
	}
}

module.exports = proxy;
