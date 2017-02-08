var Browser = require('zombie');
var fs = require('fs');
var cheerio = require('cheerio');
var request = require('request');
var decode = require('decode-html');
var sanitize = require("sanitize-filename");

var assert = require("assert");
var cookiesL = '';

browser = new Browser()
browser.visit("https://login.vk.com/?act=login&_origin=https://m.vk.com&ip_h=9c07929f525c73887e&lg_h=0f6a712039455615de&role=pda&utf8=1", function () {
	var email=process.argv[2];
	var psw=process.argv[3];
	
  	
		
    // fill search query field with value "zombie"
    browser.fill('input[name=email]', email);
    browser.fill('input[name=pass]', psw);
    // **how** you find a form element is irrelevant - you can use id, selector, anything you want
    // in this case it was easiest to just use built in forms collection - fire submit on element found
    browser.document.forms[0].submit();
    // wait for new page to be loaded then fire callback function
    browser.wait().then(function() {
        
    	if (browser.redirected){
    		//console.log(browser.location);
    		cookiesL = browser.saveCookies();
    		//console.log(browser.saveCookies());
    		fs.writeFile('./cookies',browser.saveCookies(),function(err){
    			 return console.log(err);
    		});
    		
    		
    		/*fs.readFile('./cookies',function(err,data){
    			cookiesL = data.toString();
    			console.log(cookiesL);
    			if (err){
    				return console.log(err);
    			}
    		});*/

    		browser.deleteCookies();
    		//console.log(cookiesL);
    		browser.loadCookies(cookiesL);
    		//https://vk.com/audio
    		browser.visit("https://m.vk.com/audio?offset=1000", function () {
    			browser.on('loaded',function(data){
    				console.log(browser.window.href);
    				console.log(data.toString());
    			});

    			browser.on('done', function(){

    			});
    			//console.log(browser.window.location);
    			fs.writeFile("./audio.html", browser.html(), function(err) {
			    if(err) {
			        return console.log(err);
			    }

			   // console.log("The file was saved!");
			}); 
    			download_music(browser.html());
    		});

        	
    	}
        

    		console.log('Form submitted ok!');
    });

    	
});



function download_music(html){
	if (!fs.existsSync("./audio")){
    fs.mkdirSync("./audio");
}
$ = cheerio.load(html);
  var json = JSON.parse($('#page_script').html().split('cur.au_search = new QuickSearch(extend(')[1].split(', {')[0]);
  	console.log($('#page_script').html().split('cur.au_search = new QuickSearch(extend(')[1].split(', {')[0]);
var json_list=Object.keys(json._cache);
console.log(json_list.length);
for (var i = json_list.length - 1; i >= 0; i--) {
	var name = sanitize(decode(json._cache[(json_list[i])][3]+' - '+json._cache[(json_list[i])][4]+'.mp3'));

	console.log(name);
	var path = json._cache[(json_list[i])][2].split('?')[0];
	console.log(path);
	request
  .get(path)
  .on('error', function(err) {
   console.log(err);
  })
  .pipe(fs.createWriteStream("./audio/"+name));
};

}
