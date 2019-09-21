/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var request = require('request');
var https = require('https');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
const halflink = 'https://api-v2.intrinio.com/securities/';
const otherlink = '/prices/realtime?api_key=OjE0MGI4Yzk2NjM3NDAzNWZjNjU0YWVlNDQ3N2UxMDYz';
module.exports = function (app) {
      var stocks = [];
      var stockandPrice={};
  app.route('/api/stock-prices')
    .get(function (req, res){
      var stock = req.query;
      
      
    
      
    
    
      if(typeof stock.stock != 'object'){
        var url = halflink+stock.stock+otherlink;
        request(url,{json: true},(error,response,body)=>{
        if(error)
          console.log(error);
        if(!body.error){
          
          var stockObj = {};
          var inObj = {};
          
          inObj.stock = body.security.ticker;
          inObj.price = body.last_price;
          inObj.likes = stock.like;
          stockandPrice[inObj.stock] = inObj.price;
          if(stock.like == "true"){
            var found = false;
            for(var i=0;i<stocks.length;i++){
              var obj= stocks[i];
              if(obj.stock == inObj.stock && obj.likes.indexOf(req.ip) != -1){
                stockObj = Object.assign({},formObj(stockObj,inObj,obj));
                found = true;
                break;
              }
              else if(obj.stock == inObj.stock && obj.likes.indexOf(req.ip) == -1){
                stocks[i].likes.push(req.ip);
                stockObj=Object.assign({},formObj(stockObj,inObj,stocks[i]));
                found = true;
                break;
              }
            }
            if(found){
              res.json(stockObj);
            }else{
              var obj = {};
              obj.stock = inObj.stock;
              obj.likes = [req.ip]
              stocks.push(obj);
              res.json(formObj(stockObj,inObj,obj));
            }
          }else{
            var found = false;
            for(var i=0;i<stocks.length;i++){
              var obj = stocks[i];
              if(obj.stock == inObj.stock){
                stockObj = Object.assign({},formObj(stockObj,inObj,obj));
                found=true;
                break;
              }
            }
            if(found){
              res.json(stockObj);
            }else{
              var obj = Object.assign({},formNewObj(inObj));
              stocks.push(obj);
              res.json(formObj(stockObj,inObj,obj));
            }
          }
        }
        else{
          res.send(body.error);
        }
      });
        
      }else{
        var stock1 = stock.stock[0];
        var stock2 = stock.stock[1];
        var like = stock.like;

        res.json(compareAndGetLikes(stockandPrice,stock1,stock2,stocks,like,req));
      }
      

      
        
    });
    
};

 function formObj(stockObj,inObj,obj){
   inObj.likes = obj.likes.length;
   stockObj.stockData = inObj;
   return stockObj;
 }
function formNewObj(inObj){
  var obj = {};
  obj.stock = inObj.stock;
  obj.likes = []
  return obj;
}


function addBothLikes(arr,name,req){
  for(var i=0;i<arr.length;i++){
    var obj= arr[i];
    if(obj.stock == name && obj.likes.indexOf(req.ip) == -1){
      arr[i].likes.push(req.ip);
      break;
    }
  }
}

function compareAndGetLikes(obj,name1,name2,arr,like,req){

  if(obj[name1] && obj[name2]){
    var likes1,likes2,price1,price2,rel1,rel2;
    if(like == "true"){addBothLikes(arr,name1,req);addBothLikes(arr,name2,req);}
    price1=obj[name1];price2=obj[name2];
    for(var i=0;i<arr.length;i++){
      var obj = arr[i];
      if(obj.stock == name1){
        likes1 = obj.likes.length;
        rel1=likes1;
      }
        
      if(obj.stock == name2){
        likes2 = obj.likes.length;
        rel2 = likes2;
      }
    
    }
    likes1 -= rel2;
    likes2 -= rel1;
    return {"stockData":[{"stock":name1,"price":price1 ,"rel_likes":likes1},{"stock":name2,"price":price2 ,"rel_likes":likes2}]};
    
  }
  else if(obj[name1] && !obj[name2]){
    return {error: name1 + " in our server but " + name2 +" either not in our server or it cannot be accessed can try by getting its single price!"}
  }
  else if(!obj[name1] && obj[name2]){
    return {error: name2 + " in our server but " + name1 +" either not in our server or it cannot be accessed can try by getting its single price!"}
  }
  else{
    return {error: name1 +" and "+ name2 +" either not in our server or they can't be accessed can try by getting their single prices!"}
  }
}


