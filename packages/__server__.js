fns = module.exports = {}
const browserify = require('browserify')
const Express = require("express")
const BodyParser = require("body-parser")
const sessions = require("express-session")
const jsdom = require('jsdom')
let socket = require("socket.io");
var mysql = require('mysql');
var os = require('os');
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');
var BodyPars = BodyParser.urlencoded({
    extended: false
})
var ROUTER_INDEX = Express.Router()
var SERVER = Express()
var getIP = require('ipware')().get_ip;

var lightTable = [];
var nbrcarstable = [];
tablePosIdStreet = [];
var dynmicOrStatic = "static";
var nbrMustConnectdDevices = 4;
const testDevices = 3;
const maxGreenTime=15000;
currntTime=0;







//initialisation  socket 

let socketServer = SERVER.listen(4000, () => {
    console.log("http://localhost:4000")
})

let io = socket(socketServer);
/**Connected client list */
var listclient = []
/** */

const {
    JSDOM
} = jsdom;

var session;
var user;
var pwd;
var siteData = null
ROUTER_INDEX.sendOrNot = "send";
var itemtable = [];
var ok=true;

var connection = mysql.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'circulation'

});

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
                res.send("suscess query");

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

    this.getDataFromCallback = function (direction, callback) {

    }


    function makeItemTable(direction, rows, itemtable) {
        for (i = 0; i < rows.length; i++) {
            keys = Object.keys(direction)[i];
            var itemI = rows.filter(item => item.ip == direction[keys]);
            itemtable.push({
                idStreet: itemI[0].idrue,
                ip: itemI[0].ip,
                position: Object.keys(direction)[i]
            });
        }
    }
    ROUTER_INDEX.get("/a",(req,res)=>{

       
            localStorage.clear()
      
        res.send("kjnjkj");
    })
 
    ROUTER_INDEX.get("/makeIntersection", (req, res) => {


        var state = req.query.state;
        var street = req.query.street;
        console.log("state=>" + state)
        console.log("street=>" + street)

        connection.query("TRUNCATE TABLE site;",(err,rows,fildes)=>{
            if(err)console.log(err)
        });
        connection.query("TRUNCATE TABLE intersection;",(err,rows,fildes)=>{
            if(err)console.log(err)
        });
        localStorage.clear();

        reque = "INSERT INTO `site` (`id`, `gouvernorat`, `rue`) VALUES (NULL,'" + state + "', '" + street + "');"
        connection.query(reque, (err, rows, filds) => {
            if (err) {
                console.log("erroererr");

            } else {
                console.log(rows)
                

            }

        });





        var ipCameraNorth = req.query.direction.north
        console.log("north :" + ipCameraNorth);
        var ipCameraSouth = req.query.direction.south
        console.log("south :" + ipCameraSouth);
        var ipCameraEast = req.query.direction.east
        console.log("east :" + ipCameraEast);
        var ipCameraWest = req.query.direction.west
        console.log("west :" + ipCameraWest);
        direction = req.query.direction;

        var reqSel = "select idrue,ip from rue R,camera C where R.idcamera=C.idcamera and (C.ip='" + ipCameraNorth + "'or  C.ip='" + ipCameraSouth + "' or  C.ip='" + ipCameraWest + "' or  C.ip='" + ipCameraEast + "');";


        connection.query(reqSel, (err, rows, filds) => {
            console.log(rows.length)
            if (err) {
                console.log(err)
            }
            //function
            makeItemTable(direction, rows, itemtable);

            connection.query("INSERT INTO intersection (`idintersection`, `north`, `south`, `east`, `west`) values(null,'" + itemtable[0].idStreet + "','" + itemtable[1].idStreet + "','" + itemtable[2].idStreet + "','" + itemtable[3].idStreet + "') ", (err, rows, filds) => {
                if (err) {
                    console.log(err)
                } else {
                    console.log("success")
                }
            });
            console.log("=> callback : " + itemtable.length)
        });
        setTimeout(() => {
            console.log("=> : " + JSON.stringify(itemtable))
        }, 200)



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
                    var lastidCamera = rows[0]["max(idcamera)"];

                    var reqSel = "insert into rue values(NULL," + req.params.lance + ",'" + req.params.direction + "','" + lastidCamera + "')";
                    connection.query(reqSel, (err, rows, filds) => {
                        if (err) {
                            console.log(err)
                        }

                        var reqLight = "insert into feux values(null,'red',(SELECT max(idrue) FROM rue));";
                        connection.query(reqLight, (err, rows, filds) => {
                            if (err) {
                                console.log(err)
                            }
                            console.log("Street inserted ");
                        });
                    });

                })

            }

        })

        res.send("connection successful")
    });

    ROUTER_INDEX.get("/getCameraData", (req, res) => {
        if(localStorage.getItem("configTable")){
            req = "select * from site"
            connection.query(req,(err,siteRows,filds)=>{
                if(err)console.log(err)
                site = {
                    state:siteRows[0].gouvernorat,
                    street:siteRows[0].rue
                }
                //localStorage.getItem("configTable").push(site)
                var reqSel = "select *  from camera ";
                connection.query(reqSel, (err, rows, filds) => {
                    if (err) {
                        console.log(err)
                    }
                   /// console.log("config ==>",JSON.stringify(localStorage.getItem("configTable")[0]))
                    result = {
                        config :localStorage.getItem("configTable"),
                        site,
                        rows
                    }
                    res.send(result)
                })
            })
        }
        else{
            var reqSel = "select *  from camera ";
            connection.query(reqSel, (err, rows, filds) => {
                if (err) {
                    console.log(err)
                }
                res.send(rows)
            });

        }
       

    });



    /* ROUTER_INDEX.get("/makeIntersection",(req,res)=>{
         console.log("BODY =>"+JSON.stringify(req.body));
     })*/
    ROUTER_INDEX.get("/sendOrNot", (req, res) => {
        //sendOrNot = "send";
        console.log(ROUTER_INDEX.sendOrNot);
        res.send(ROUTER_INDEX.sendOrNot);
    });


    const getPosition = function (ip) {
        return new Promise(resolve => {
            res = "";

            var sem = "select idrue from rue R,camera C where R.idcamera=C.idcamera and C.ip='::ffff:" + ip + "'";
            connection.query(sem, (err, rows, field) => {
                if (err) console.log(err)
                var req2 = "select * from intersection where ((north = (" + rows[0].idrue + ")) or (south =(" + rows[0].idrue + ") )or (west =(" + rows[0].idrue + ") )or (east =(" + rows[0].idrue + ") ))";
                connection.query(req2, (err, rows2, fields, ) => {
                    for (i = 0; i < Object.keys(rows2[0]).length; i++) {

                        if (rows2[0][Object.keys(rows2[0])[i]] == rows[0].idrue) {
                            resolve(Object.keys(rows2[0])[i]);

                            tablePosIdStreet.push({
                                idStreet: rows[0].idrue,
                                position: Object.keys(rows2[0])[i]
                            })
                        }
                    }
                });
            });
        });
    }
    const getPosition2 = async function getPosition2(ip) {
        var r = await (getPosition(ip));

        return r;
    }

    function testTab(lightTable) {
        lightTable.push({
            nbrCars: '2',
            position: 'north',
            ip: '::ffff:127.0.0.1',
        });
        tablePosIdStreet.push({
            idStreet: 64,
            position: 'north'
        });

        lightTable.push({
            nbrCars: '3',
            position: 'west',
            ip: '::ffff:127.0.0.2',
        });
        tablePosIdStreet.push({
            idStreet: 63,
            position: 'west'
      });  
        lightTable.push({
            nbrCars: '0',
            position: 'east',
            ip: '::ffff:127.0.0.3',
        });
        tablePosIdStreet.push({
            idStreet: 70,
            position: 'east'
        }); 

    }
    function colorChangeForced(){
        reqWhoChange="select idfeu from feux where etat='vert'";
        connection.query(reqWhoChange,(err,rowsIdFeu,filds)=>{
        
        
        reqOrange = "update feux set etat ='orange';"
        connection.query(reqOrange,(err,rows,filds)=>{if(err)console.log(err)});
        setTimeout(()=>{
            reqchangeRed="update feux set etat ='rouge' where idfeu ='"+rowsIdFeu[0].idfeu+"' or idfeu ='"+rowsIdFeu[1].idfeu+"';";
            connection.query(reqchangeRed,(err,rows,filds)=>{if(err)console.log(err)});
            reqchangeGreen="update feux set etat ='vert' where etat ='orange';";
            connection.query(reqchangeGreen,(err,rows,filds)=>{if(err)console.log(err)});
        },2000);
    });
    }

    function decision(lightTable) {
     
        tableNorthSouth = lightTable.filter(item => item.position == "north" || item.position == "south");
        tableEastWest = lightTable.filter(item => item.position == "east" || item.position == "west");
        carsNorthSouth = parseInt(tableNorthSouth[0].nbrCars) + parseInt(tableNorthSouth[1].nbrCars);
        carsEastWest = parseInt(tableEastWest[0].nbrCars)+ parseInt(tableEastWest[1].nbrCars);
        console.log("=============>carsNorthSouth"+carsNorthSouth);
        console.log("=============>carsEastWest"+carsEastWest);
        if (carsNorthSouth > carsEastWest && currntTime<maxGreenTime) {
            
            idStreetNorth = tablePosIdStreet.filter(i => i.position == "north");
            idStreetSouth = tablePosIdStreet.filter(i => i.position == "south");

            reqetat="select etat from feux where idrue=" + idStreetNorth[0].idStreet + ";"
            connection.query(reqetat,(err,rows,filds)=>{
                if(err)console.log(err);
                if(rows[0].etat=="rouge"){
                    currntTime=0;
                    reqOrange = "update feux set etat ='orange';"
                    connection.query(reqOrange,(err,rows,filds)=>{
                        if(err)console.log(err);
                    });

                    setTimeout(()=>{

        
                        req = "update feux set etat ='vert' where idrue=" + idStreetNorth[0].idStreet + " or idrue=" + idStreetSouth[0].idStreet + ";"
            
                        connection.query(req, (err, rows, filds) => {
                            if (err) console.log(err);
            
                            requp = "update feux set etat ='rouge' where idrue <>" + idStreetNorth[0].idStreet + " and idrue <>" + idStreetSouth[0].idStreet + ";"
                            connection.query(requp,(err,rows,filds)=>{
                                if(err){console.log(err);}
                            });
                        });
                    },2000);
                 }
                 else{ 
                    currntTime+=10000;
                     req = "update feux set etat ='vert' where idrue=" + idStreetNorth[0].idStreet + " or idrue=" + idStreetSouth[0].idStreet + ";"
            
                 connection.query(req, (err, rows, filds) => {
                     if (err) console.log(err);
     
                     requp = "update feux set etat ='rouge' where idrue <>" + idStreetNorth[0].idStreet + " and idrue <>" + idStreetSouth[0].idStreet + ";"
                     connection.query(requp,(err,rows,filds)=>{
                         if(err){console.log(err);}
                     });
                 });
                 
                }
            });
           
        } 
       if (carsNorthSouth < carsEastWest ){

            //console.log("tablePosIdStreet ", JSON.stringify(tablePosIdStreet));
            idStreetEast = tablePosIdStreet.filter(i => i.position == "east");
            idStreetWest = tablePosIdStreet.filter(i => i.position == "west");

            reqetat="select etat from feux where idrue=" + idStreetEast[0].idStreet + ";"
            connection.query(reqetat,(err,rows,filds)=>{
                if(rows[0].etat=="rouge"){
                    currntTime=0;
                    reqOrange = "update feux set etat ='orange';"
                    connection.query(reqOrange,(err,rows,filds)=>{
                        if(err)console.log(err);
                    });
                    setTimeout(()=>{
                        req = "update feux set etat ='vert' where idrue=" + idStreetEast[0].idStreet + " or idrue=" + idStreetWest[0].idStreet + ";"

            connection.query(req, (err, rows, filds) => {
                if (err) console.log("222222222222" + err);

                requp = "update feux set etat ='rouge' where idrue <>" + idStreetEast[0].idStreet + " and idrue <>" + idStreetWest[0].idStreet + ";"
                connection.query(requp,(err,rows,filds)=>{
                    if(err){console.log(err);}
                })
            });

                    },2000)



                }
                else{
                    currntTime+=10000;
                    req = "update feux set etat ='vert' where idrue=" + idStreetEast[0].idStreet + " or idrue=" + idStreetWest[0].idStreet + ";"

            connection.query(req, (err, rows, filds) => {
                if (err) console.log("222222222222" + err);

                requp = "update feux set etat ='rouge' where idrue <>" + idStreetEast[0].idStreet + " and idrue <>" + idStreetWest[0].idStreet + ";"
                connection.query(requp,(err,rows,filds)=>{
                    if(err){console.log(err);}
                })
            });
                }


            })

        }
     
        if(!localStorage.getItem("configTable")){
            localStorage.setItem("configTable",JSON.stringify(lightTable));
        }
    }

    
    fillorNot=true;
    ROUTER_INDEX.get("/sendNbrCars/:nbrcars/:ip", (req, res) => {
      
        var nbrCars = req.params.nbrcars;
        var ip = req.params.ip;
        if(fillorNot){
        testTab(lightTable);
    }
       // console.log("lightTable222 ==>" + lightTable.length);
        getPosition2(ip).then((positionIp) => {
            var nbr = listclient.length +testDevices;
            
            console.log("lightTable ", lightTable.length);
            if ((nbr == nbrMustConnectdDevices) && (dynmicOrStatic == "dynamic")) {
                console.log("Her=======>1")
                fillorNot=false;
                var testTable = lightTable.filter(item => item.ip == ip);

                if (testTable.length == 0) {
                    lightTable.push({
                        nbrCars,
                        position: positionIp,
                        ip,  
                    });

                    if (nbrMustConnectdDevices == lightTable.length) {
                         console.log("Her=======>22");
                        console.log("=========dynamic methode ================");
                        // the decision for the light ...
                        console.log("///////// decision////////");
                        decision(lightTable);


                        ROUTER_INDEX.sendOrNot = "not";
                        
                        fillorNot=true;
                        
                        console.log("nbr : " + req.params.nbrcars);
                        setTimeout(() => {
                            lightTable.splice(0, lightTable.length);
                            console.log("Sleeeeeeeep !");
                            ROUTER_INDEX.sendOrNot = "send";
                            
                        }, 5000);
                    }
                }
                
            }

        }).catch((err) => {
            console.log("err==>" + err);
        });
        res.send(ROUTER_INDEX.sendOrNot)
    });

    
    const getMustAttributes = () =>{
        return new Promise(resolve => {
        result =[]
        reqLight="select etat,idrue from feux";
        connection.query(reqLight,(err,rows,filds)=>{
            if(err){console.log("err : "+err);}
            rows.forEach(element => {
            
                req2 = `select * from intersection where ((north = (  ${element.idrue}  )) or (south =( ${element.idrue} ) )or (west =( ${element.idrue} ) )or (east =( ${element.idrue} ) ))`;

                connection.query(req2, (err, rows2, fields, ) => {
                    if(err)console.log(err)
                    for (j = 0; j < Object.keys(rows2[0]).length; j++) {
                        if (rows2[0][Object.keys(rows2[0])[j]] == element.idrue) {

                            result.push({
                                idrue:element.idrue,
                                position:Object.keys(rows2[0])[j],
                                color:element.etat
                            })
                        }
                    }
                  
                });
            });

           setTimeout(()=>{resolve(result)},50) ;
        });
    });
    } 
    const asyncgetMustAttributes = async ()=>{
        var resl = await(getMustAttributes());
        return resl;
    }

    ROUTER_INDEX.get("/x", function (req, res) {
      
    });

    ROUTER_INDEX.get("/sendStatesToTrafficLight", function (req, res) {
        result =[]
        reqLight="select etat,idrue from feux";
        connection.query(reqLight,(err,rows,filds)=>{
            if(err){console.log("err : "+err);}
            rows.forEach(element => {
            
                req2 = `select * from intersection where ((north = (  ${element.idrue}  )) or (south =( ${element.idrue} ) )or (west =( ${element.idrue} ) )or (east =( ${element.idrue} ) ))`;

                connection.query(req2, (err, rows2, fields, ) => {
                    if(err)console.log(err)
                    for (j = 0; j < Object.keys(rows2[0]).length; j++) {
                        if (rows2[0][Object.keys(rows2[0])[j]] == element.idrue) {
                            var  pushed = {
                                idrue:element.idrue,
                                position:Object.keys(rows2[0])[j],
                                color:element.etat,
                               //nbrCar:lightTable.filter(item => item.position == Object.keys(rows2[0])[j])[0].nbrCars
                            }
                            //console.log(Object.keys(rows2[0])[j]);
                            testTabb=lightTable.filter(item => item.position == Object.keys(rows2[0])[j])
                            //console.log(testTabb);

                            //console.log("lightTable ", lightTable);
                            if(lightTable.filter(item => item.position == Object.keys(rows2[0])[j]).length!=0 && dynmicOrStatic == "dynamic" ){
                                
                               pushed.nbrCar = lightTable.filter(item => item.position == Object.keys(rows2[0])[j])[0].nbrCars
                                console.log("If...");
                                //console.log("dynmicOrStatic ", dynmicOrStatic);
                            }
                            else{
                               // console.log("this one "+testTabb);
                               // console.log("dynmicOrStatic ", dynmicOrStatic);
                                pushed.nbrCar = 0
                                //console.log("Else ...");
                            }
                            //console.log("lightTable ", lightTable);
                        
                                //console.log("pushed ", pushed);
                            result.push(pushed)
                        }
                    }
                });
            });
            setTimeout(()=>{

                result.push({
                    "method":dynmicOrStatic,
                })
                res.send(result)
            },500);
          
        });
       
    });

   
    function colorChange(){
        asyncgetMustAttributes().then(resq=>{
          

        console.log("=====>"+ok)

        if(ok){

                 North = resq.filter(item =>item.position == "north")
                 South = resq.filter(item =>item.position == "south")

                if(North[0].color=="rouge" || North[0].color=="orange" ){
                    reqOrange = "update feux set etat ='orange';"
                    connection.query(reqOrange,(err,rows,filds)=>{
                        if(err)console.log(err);
                
                    });

                    setTimeout(()=>{

        
                        req = "update feux set etat ='vert' where idrue=" + North[0].idrue + " or idrue=" + South[0].idrue + ";"
            
                        connection.query(req, (err, rows, filds) => {
                            if (err) console.log(err);
                          
                            requp = "update feux set etat ='rouge' where idrue <>" + North[0].idrue + " and idrue <>" + South[0].idrue + ";"
                            connection.query(requp,(err,rows,filds)=>{
                                if(err){console.log(err);}
                               
                            });
                        });
                    },2000)
                 }
    
            ok=!ok;

        }
        else{

                East = resq.filter(item => item.position == "east")
                West = resq.filter(item => item.position == "west")
                

 
                  if(East[0].color=="rouge" || East[0].color=="orange" ){
  
                      reqOrange = "update feux set etat ='orange';"
                      connection.query(reqOrange,(err,rows,filds)=>{
                          if(err)console.log(err);
                          
                      });
                      setTimeout(()=>{
                          req = "update feux set etat ='vert' where idrue=" + East[0].idrue + " or idrue=" + West[0].idrue + ";"
  
              connection.query(req, (err, rows, filds) => {
                  if (err) console.log("222222222222" + err);
  
                  requp = "update feux set etat ='rouge' where idrue <>" + East[0].idrue + " and idrue <>" + West[0].idrue + ";"
                  connection.query(requp,(err,rows,filds)=>{
                      if(err){console.log(err);}

                  })
              });
  
                      },2000);
                  }
              ok=!ok;
        }
    }).catch(err=>{

        console.log("err ", err);
    })
    }
    

    //io.eio.pingTimeout = 10;
    // io.eio.pingInterval = 10; 
    io.on("connection", function (client) {
        listclient.push(client);
        lightTable.splice(0, lightTable.length);
        if (listclient.length+testDevices == nbrMustConnectdDevices) {
            dynmicOrStatic = "dynamic";
            fillorNot=true;
            clearInterval(globalStaticInterval);
         
        }
        console.log("connected =" + listclient.length);

        client.on("disconnect", function () {
            lightTable.splice(0, lightTable.length);
            fillorNot=true;
            console.log("client diconnect")
            dynmicOrStatic = "static";
            console.log("=============static method=============")
            let staticIntervale=setInterval(() => {
               if (listclient.length+testDevices == nbrMustConnectdDevices) {
                    clearInterval(staticIntervale);
                }
            console.log("dynmicOrStatic==>" + dynmicOrStatic)
            console.log("static sleep finshed");
           
            colorChange();
            }, 10000);


            listclient = listclient.filter(item => item.id != client.id);
            console.log("connected =" + listclient.length);
        })
    });

  let globalStaticInterval=setInterval(()=>{
        colorChange();
    },10000);
        

} 