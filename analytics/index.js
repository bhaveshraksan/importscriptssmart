var CronJob = require('cron').CronJob;
var mongo = require('then-mongo');


var mongoUrl = "mongodb://analytics:pr0dreadOnly@52.66.116.226:2029/#?authSource=#";
//"mongodb://localhost:27017/"; 
var databases = ["smart_uat","smart_qa","smart_dev"];
var instanceName = {smart_uat:"Veritaz UAT",smart_qa:"QA",smart_dev:"DEV"};
var sendAlertsTo = 'harishreddy.mallu@raksan.in';

var data={};
var instances=databases.length * 3; //3 is number of metrics
var startedat = new Date().getTime();
function reportData(){
    databases.forEach(function(dbName){
        var db = mongo(mongoUrl.replace(/#/g,dbName), ['users']);
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
    subject: 'User Report Sample✔', // Subject line
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
var metricName = {totalUsers:"Total Registered Users",
activeUsers:"Users logged in at least once since registration",
todayLoggedInUsers:"Users logged in today"  }

function prepareHtml(json){
    var result = "<table>"
    for(key in json){
        result+="<tr><td colspan='2'><br/><h3>"+instanceName[key]+"</h3></td></tr>";
        var inst = json[key];
        for(metric in inst){
            result+=" <tr><td>"+metricName[metric]+"</td><td>"+inst[metric]+"</td></tr>"
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

//new CronJob('00 30 20 * * *',reportData, null, true, 'Asia/Kolkata');



