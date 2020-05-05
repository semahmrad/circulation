functions = module.exports = {}

functions.sendHelloWorld = function(request, response){
    response.send("Hello World")
}


functions.sendHello = function(request, response){
    response.send("Hello")
}

functions.getValues = function(req,res){

    response={
        firstName :req.query.firstName,
        lastName :req.query.lastName
    }
    console.log(response);
    res.end(JSON.stringify(response));
}


functions.getValuesPost = function(req,res){
    
    response={
        username :req.body.username,
        password :req.body.password
    } 
    if ((response["username"]=="admin")&&(response["password"]=="admin")){
        console.log(response);
       // res.end(JSON.stringify(response));
    }
    else{
        res.send("verifer  votre  information");

    }
   
}











