var CronJob = require('cron').CronJob;
var mongo = require('then-mongo');


var mongoUrl;

var databases = ["veritaz_prod","imunus_prod","sudan_prod","tanzania_prod","ethiopia_prod","uganda_prod","smart_uae_prod","emkenya_pp"];
var instanceName = {veritaz_prod:"Veritaz",smart_uae_prod:"Smart Uae",imunus_prod:"Imunus",sudan_prod:"APL EM Sudan",tanzania_prod:"APL EM Tanzania",ethiopia_prod:"APL EM Ethiopia",uganda_prod:"APL EM Uganda",emkenya_pp:"APL EM Kenya"};
var sendAlertsTo = 'smartqateam@raksanconsulting.com,devops@raksan.in,vijay.pachika@raksan.in,rudrapratap.enumulu@raksan.in,rakesh@raksan.in,bhavesh.gupta@raksan.in';
//'harishreddy.mallu@raksan.in,sivakumar.vattikuti@raksan.in'//
var data={};
var instances=databases.length * 3; //3 is number of metrics
var startedat = new Date().getTime();
function reportData(){
    databases.forEach(function(dbName){
        if('veritaz_prod'===dbName || 'imunus_prod'===dbName || 'emkenya_pp'===dbName){
            mongoUrl = "mongodb://analytics:pr0dreadOnly@103.60.212.126:37290/#"
        }else{
            mongoUrl = "mongodb://analytics:pr0dreadOnly@mongodb.raksan.in:37290/#";
        }
        var db = mongo(mongoUrl.replace(/#/g,dbName), ['users'])
        console.log(mongoUrl);
        var d = new Date();
        d.setHours(0,0,0,0);
        db.users.count({}).then(function(count) {
            data[dbName]={totalUsers:count};
            waitForAll();
        });
        db.users.count({"status.lastLogin.date":{ 
            $lt: new Date(), 
            $gte: d
        }}).then(function(count) {
            data[dbName].todayLoggedInUsers = count;
            waitForAll();    
        })    
        db.users.count({_loggedIn:true}).then(function(count) {
            data[dbName].activeUsers = count;
            waitForAll(db,dbName);
        })
    })
}

function waitForAll(db,name){
    if(db){
        db.close().then(function(){console.log("Done with " + name)})
    }
    if(--instances==0 || new Date().getTime > startedat + 15000){
        console.log(data);
        sendMail(data);
    }
}

'use strict';
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.raksan.in',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'stats@fieldeagles.com',
        pass: 'RakSan987'
    }
});

// setup email data with unicode symbols
let mailOptions = {
    from: '"field repo 🦅" <stats@fieldeagles.com>', // sender address
    to: sendAlertsTo, // list of receivers
    subject: 'sMaRt application usage report (' +new Date().toISOString().substr(0,10)+')', // Subject line
};

/**
* 
*<table>
<tr>
<td colspan="2">Sum: $180</td>
</tr>
<tr>
<td>January</td>
<td>$100</td>
</tr>
<tr>
<td>February</td>
<td>$80</td>
</tr>

</table>
*/
var metricName = {totalUsers:"Total Registered Users  ",
activeUsers:"Users logged in at least once since registration  ",
todayLoggedInUsers:"Users logged in today ("+new Date().toISOString().substr(0,10)+" )  "  }
var i=1;
function prepareHtml(json){
    var result = "<table>"
    for(key in json){
        result+="<tr><td colspan='2'><br/><h3>"+(i++)+"."+instanceName[key]+"</h3></td></tr>";
        var inst = json[key];
        inst = (function(s){var t={};Object.keys(s).sort().forEach(function(k){t[k]=s[k]});return t})(inst)
        for(metric in inst){
            result+=" <tr><td>"+metricName[metric]+"</td><td> : "+inst[metric]+"</td></tr>"
        }
    }
    result+="</table>";
    return result;
}

function sendMail(data){
    mailOptions.html=prepareHtml(data);
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message %s sent: %s', info.messageId, info.response);
    });
}

reportData();

// new CronJob('00 00 19 * * *',reportData, null, true, 'Asia/Kolkata');




