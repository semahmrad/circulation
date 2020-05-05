fns = module.exports = {}
const browserify = require('browserify')
const Express = require("express")
const BodyParser = require("body-parser")
const sessions = require("express-session")
const jsdom = require('jsdom')
let socket = require("socket.io")
var mysql = require('mysql');
var os = require('os');
var BodyPars = BodyParser.urlencoded({
    extended: false
})
var ROUTER_INDEX = Express.Router()
var SERVER = Express()
var getIP = require('ipware')().get_ip;

var nbrcarstable=[];


//initialisation  socket 

let socketServer = SERVER.listen(4000, () => {
    console.log("http://localhost:4000")
})

let io = socket(socketServer);
/**Connected client list */
var listclient=[]
/** */

const {
    JSDOM
} = jsdom;

var session;
var user;
var pwd;
var siteData = null
ROUTER_INDEX.sendOrNot = "send";



var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'circulation'

})

connection.connect(function (error) {
    //callback
    if (error) {
        console.log(error)
    } else
        console.log("data  base  connected ...")


});



myFunctions = require('./Functions')

SERVER.use(BodyParser.urlencoded({
    extended: false
}))

SERVER.use(sessions({
    secret: '4fd64df654fd6fdfd64dfdfdf',
    resave: false,
    saveUninitialized: true,
}))


SERVER.use(BodyParser.json())
SERVER.use(Express.static(__dirname + '/public'))
SERVER.use(Express.static(__dirname + '/packages/public/cssFile/'))
SERVER.use(Express.static(__dirname + '/packages/public/img'))
SERVER.use(Express.static('node_modules\semantic-ui-css'))


SERVER.use("/", ROUTER_INDEX)

fns.SET_SERVER = function () {
    ROUTING()
    SERVER.listen(3000, () => {
        console.log("http://localhost:3000")
    })
}


function ROUTING() {
    ROUTER_INDEX.get("/", (request, response) => {
        myFunctions.sendHelloWorld(request, response)
    })

    //Login  page 
    ROUTER_INDEX.get("/login", function (req, res) {
        req.session.destroy();
        res.sendFile(__dirname + "/public/" + 'login.html');
    })

    ROUTER_INDEX.post("/login", function (req, res) {

        session = req.session;
        user = req.body.username;
        pwd = req.body.password;
        console.log("user ===>" + user)
        console.log("password ===>" + pwd)

        if ((user != "admin") || (pwd != "admin")) {
            res.send("verifier votre username et password");
        } else res.send("sucess")

    })


    ROUTER_INDEX.get("/verif", function (req, res) {
        var reqSel = "select *  from site";
        connection.query(reqSel, (err, rows, filds) => {
            console.log(rows.length)
            if (err) {
                console.log(err)
            }
            if (rows.length != 0) {
                res.redirect("/dashboard")
            } else {
                res.redirect("/setting")
            }
        })

    })

    ROUTER_INDEX.get("/dashboard", function (req, res) {
        session = req.session;
        res.sendFile(__dirname + "/public/" + 'dashboard.html');

    })

    ROUTER_INDEX.get("/setting", function (req, res) {
        session = req.session;
        res.sendFile(__dirname + "/public/" + 'setting.html');

    })

    ROUTER_INDEX.get("/logout", (req, res) => {
        req.session.destroy();
        res.redirect("/login")

    });



    ROUTER_INDEX.get("/request", function (req, res) {
        //about  mysql  connection

        reque = "INSERT INTO `testtable` (`id`, `nom`, `prenom`) VALUES (NULL, 'sdds', 'ddsds');"
        connection.query(reque, (err, rows, filds) => {
            if (!!err) {
                console.log("error" + err);

            } else {
                console.log("suscess query");
                console.log(rows)
                res.send(rows)

            }


        });
    })



    ROUTER_INDEX.get("/site", function (req, res) {


        var gouvernorat = req.query.gouvernorat;
        var rue = req.query.rue;
        console.log("gouvernorat=>" + gouvernorat)
        console.log("rue=>" + rue)

        reque = "INSERT INTO `site` (`id`, `gouvernorat`, `rue`) VALUES (NULL,'" + gouvernorat + "', '" + rue + "');"
        connection.query(reque, (err, rows, filds) => {
            if (err) {
                console.log("erroererr");

            } else {
                console.log(rows)
                res.send("suscess query")

            }

        });

    })


    ROUTER_INDEX.get("/siteData", function (req, res) {
        var reqSel = "select *  from site";
        connection.query(reqSel, (err, rows, filds) => {
            console.log(rows.length)
            if (err) {
                console.log(err)
            }
            for (var i = 0; i < rows.length; i++) {
                sitedata = rows;
            }
            res.send(rows)
        })
    })


    ROUTER_INDEX.get("/makeIntersection", (req, res) => {

        var north = req.query.direction.north
        console.log("north :" + north);
        var south = req.query.direction.south
        console.log("south :" + south);
        var west = req.query.direction.west
        console.log("west :" + west);
        var east = req.query.direction.east
        console.log("east :" + east);

        var reqSel = "select idrue from rue R,camera C where R.idcamera=C.idcamera and (C.ip='" + north + "'or  C.ip='" + south + "' or  C.ip='" + west + "' or  C.ip='" + east + "');";
        connection.query(reqSel, (err, rows, filds) => {
            console.log(rows.length)
            if (err) {
                console.log(err)
            }
            console.log("====>" + rows[1].idrue);
            connection.query("insert into intersection values(null,'" + rows[0].idrue + "','" + rows[1].idrue + "','" + rows[2].idrue + "','" + rows[3].idrue + "') ", (err, rows, filds) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("success")
                }
            })
        })
        res.send("hello")

    });

    ROUTER_INDEX.get("/getFromAndroid/:lance/:direction/:brand/:model", (req, res) => {
        //console.log("==============>" + req.addListener.call)

        console.log("marque =>" + req.params.brand + "/ model : " + req.params.model)

        var ipInfo = getIP(req);
        console.log(ipInfo.clientIp);
        console.log("nombre  of  lance : " + req.params.lance + " and direction is : " + req.params.direction)
        //res.send("connection successful")
        // verification s'il ya la mem camera on database
        var reqSel = "select ip  from camera";
        connection.query(reqSel, (err, rows, filds) => {
            var ok = true;

            if (err) {
                console.log(err)
            }
            for (var i = 0; i < rows.length; i++) {
                //console.log(rows[0].ip)
                if (rows[i].ip == ipInfo.clientIp) {
                    console.log("Camera existe déja")
                    ok = false;
                }

            }
            // ajouter nouvelle camrea 
            if (ok) {
                var reqSel = "insert into camera values(NULL,'" + ipInfo.clientIp + "','" + req.params.brand + "','" + req.params.model + "',1)";
                connection.query(reqSel, (err, rows, filds) => {
                    if (err) {
                        console.log(err)
                    }

                    console.log("========>inserted")
                })

                var reqSel = ("SELECT max(idcamera) FROM camera");
                connection.query(reqSel, (err, rows, filds) => {
                    if (err) {
                        console.log(err)
                    }
                    var lastid = rows[0]["max(idcamera)"];

                    var reqSel = "insert into rue values(NULL," + req.params.lance + ",'" + req.params.direction + "','" + lastid + "')";
                    connection.query(reqSel, (err, rows, filds) => {
                        if (err) {
                            console.log(err)
                        }
                        console.log("========> Rue inserted")
                    })

                })

            }

        })

        res.send("connection successful")
    });

    ROUTER_INDEX.get("/getCameraData", (req, res) => {

        var reqSel = "select *  from camera ";
        connection.query(reqSel, (err, rows, filds) => {
            if (err) {
                console.log(err)
            }
            res.send(rows)
        })

    });



    /* ROUTER_INDEX.get("/makeIntersection",(req,res)=>{
         console.log("BODY =>"+JSON.stringify(req.body));
     })*/
    ROUTER_INDEX.get("/sendOrNota", (req, res) => {
        //sendOrNot = "send";
        console.log(ROUTER_INDEX.sendOrNot);
        res.send(ROUTER_INDEX.sendOrNot);
    });



    ROUTER_INDEX.get("/sendNbrCars/:nbrcars/:ip", (req, res) => {
        var nbrMustConnectdDevices =1;
        var nbrCars=req.params.nbrcars;
        var ip=req.params.ip;
        if(listclient.length==nbrMustConnectdDevices){
            var testTable=nbrcarstable.filter(item=>item.ip==ip);
            if(testTable.length==0){
                nbrcarstable.push({
                    nbrCars,
                    ip
                })
                if(nbrMustConnectdDevices==nbrcarstable.length){
                
                    console.log("=========dynamic methode ================")
                    ROUTER_INDEX.sendOrNot = "not";
        
                    console.log("nbr : " + req.params.nbrcars);
                    setTimeout(() => {
                           
                        console.log("Sleeeeeeeep !");
                        ROUTER_INDEX.sendOrNot = "send";
                        nbrcarstable.splice(0,nbrcarstable.length);
                    }, 5000);
                }


            }

        }
        else {
            
            console.log("static ....")
        }

        console.log("client ip ==>"+req.params.ip)
       

        res.send(ROUTER_INDEX.sendOrNot)



    });

    //io.eio.pingTimeout = 10;
   // io.eio.pingInterval = 10; 
    io.on("connection", function (client) {
       
        listclient.push(client)
        console.log("connected ="+listclient.length);

        client.on("disconnect",function(){
        console.log("client diconnect")
        listclient=listclient.filter(item=>item.id!=client.id);
        console.log("connected ="+listclient.length);

    })

      
    });
    




  

}
