var fs = require("fs");
var proxy = function(){

	this.send = function(mode, method, endpoint, template, parameters, headers){

		var http = template.ssl? require("https"):require("http");
		switch (mode){

			case 1:
				return  new Promise((resolve, reject)=>{
					var http = template.ssl? require("https"): require("http");
					var xt = require("./template");
					var instance = new xt();
					var path = instance.fullfil(template, parameters).result;
				
					var opt = {
						host: endpoint,
						method: method,
						path:path,
						rejectUnauthorized:false,
						headers:headers
					};	
					var result = "";
					var req = http.request(opt, (res)=>{
						console.log(res.statusCode);
						res.on("data", (data)=>{
							result += data.toString();
						
						}).on("end", ()=>{
							resolve({result: result, response:res});
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
					var xt = require("./template");
					var instance = new xt();
					var path = instance.fullfil(template["path"], parameters["path"]).result;
					var postData = instance.fullfil(template["data"], parameters["data"]).result;
					var opt = {
						host:endpoint,
						method: method,
						path: path,
						rejectUnauthorized:false,
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
							resolve({result: result, response: res});
						});
					}).on("error", (err)=>{
						console.log(err.message);
						reject(err);
					});
					req.write(postData);
					req.end();
			
				});
				break;
			case 3:
				return new Promise((resolve, reject)=>{
					var xt = require("./template");
					var instance = new xt();
					var opt = {
						host: endpoint,
						rejectUnauthorized:false,
						method: method,
						path: instance.fullfil(template["path"], parameters["path"]).result
					};
					if(template["headers"]){
						opt.headers= JSON.parse(instance.fullfil(template["headers"], parameters["headers"]).result);
					}
					var result = "";
					console.log(opt.path);
					var req = http.request(opt, (res)=>{
						res.on("data", (data)=>{
							result += data.toString();
						}).on("end", ()=>{
							resolve({result: result, response:res});
						});
						
					}).on("error", (err)=>{
						console.log(err.message);
						reject(err);
					});
					if(template.method.toUpperCase()== "POST" || template.method.toUpperCase() == "PUT"){
						if(template["content"]){
							req.write(instance.fullfil(template["content"], parameters["content"]).result);
						}
					}
					req.end();
					
				});
			default:
				break;
		}
	};
	
	this.standup = function(port){
		var http = require("http");
		var express = require("express");
		var app = express();
		var server = http.createServer(app);
		app.post("/add", (req, res)=>{
			var result = "";
			req.on("data", (data)=>{
				result += data.toString();
			
			}).on("end", ()=>{
				var jsonData = JSON.parse(result);
				var tempName = "./templates/"+jsonData["templateName"];
				fs.access("tempName",fs.constants.F_OK, (e)=>{

					if(e){
						
					
						fs.writeFile(tempName, result ,(err)=>{
							if(err){
								res.end(err.message);
							}else{
								res.end("OK");
							}
						});
					}else{
						res.end("Template already exists. Please change a name.");
					}
				});
			});
			
		});
	
		app.use("/1", (req, res, next)=>{
			console.log(req.query["parameters"]);
			
			this.send(1, "get",req.query["site"], req.query["template"],JSON.parse(req.query["parameters"]), JSON.parse(req.query["headers"]))
			.then((r)=>{
				var headerNames  = Object.keys(r.response.headers);
				for(var k of headerNames){
					res.header(k, r.response.headers[k]);
				}
				res.end(r.result);
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
				this.send(2, "post", req.query["site"], postDataInstance["template"], postDataInstance["parameters"], postDataInstance["headers"])
				.then((r)=>{
					var headerNames  = Object.keys(r.response.headers);
                                	for(var k of headerNames){
                                        	res.header(k, r.response.headers[k]);
                                	}
                                	res.end(r.result);

				});

			});
			
		});
			
		app.use("/3/:template", (req, res, next)=>{
			
			console.log(JSON.stringify(req.params.template));
			var templatePath = "./templates/"+req.params.template;
			var postContent = "";
			var queryParams = JSON.parse(req.query["parameters"].toString());
			var queryKeys = Object.keys(queryParams);
			req.on("data", (pData)=>{
				postContent += pData.toString();
			}).on("end", ()=>{
				fs.access(templatePath, fs.constants.F_OK | fs.constants.R_OK, (e)=>{
                                        if(e){
                                               	res.status(400);
                                               	res.end("cannot find the template. "+ e.message);
                                       	}else{
                                               	fs.readFile(templatePath, "utf8", (err, data)=>{
                                                       	var templateData = JSON.parse(data);
							var postData = postContent? JSON.parse(postContent):{};
							if(postData.path == null){
								postData.path = {};
							}
							for(var k of queryKeys){
								
								postData.path[k] = queryParams[k];
							}
							if(req.method.toUpperCase() == templateData.method.toUpperCase()){		
                                                       		this.send(3, templateData.method, templateData.site, templateData, postData)
                                                       		.then((r)=>{
                                                               		var headerNames  = Object.keys(r.response.headers);
				                               		for(var k of headerNames){
                                        					res.header(k, r.response.headers[k]);
                               						}
                               						res.end(r.result);

                                                       		}).catch((ex)=>{
									console.log(ex.message);
								});
							}else{
								res.status(400);
								res.end(`The request method ${req.method} is not matched the template: ${templateData.method}`);
							}
                                               	});
                                       	}
                               	});

			});
		
			
		});
		app.listen(port);
	}
}

module.exports = proxy;
