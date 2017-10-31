var CronJob = require('cron').CronJob;
var mongo = require('then-mongo');


var mongoUrl='mongodb://analytics:pr0dreadOnly@54.254.219.31:2029/emkenya_pp';
var instanceName='APL EM Kenya'
var sendAlertsTo = 'aplemkenya_smart@raksanconsulting.com'//
var data={};
var queries=5; 
var startedat = new Date().getTime();
var db ;


function getNameEmail(user){
    if(user.emails && user.emails.length > 0 )
        var userEmail = user.emails[0].address;
    return {email:userEmail || 'N/A',name:user.profile.name || user.username}
}

function reportData(){
    db = mongo(mongoUrl, ['users'])
        console.log(mongoUrl);
        var d = new Date();
        d.setHours(0,0,0,0);
        db.users.count({"roles.company-group":{$exists:true}}).then(function(count) {
            data.totalUsers=count;
            waitForAll();
        });
        db.users.find({"roles.company-group":{$exists:true},"status.lastLogin.date":{ 
            $lt: new Date(), 
            $gte: d
        }}).then(function(users) {
            try{
            data.todayLoggedInUserDetails = users.map(getNameEmail);
            }catch(e){
                console.log(e);
            }finally{
            waitForAll();  
            }  
        })  
        db.users.find({"roles.company-group":{$exists:true},$or : [ {"status.lastLogin.date":{$exists:false}},
        {"status.lastLogin.date":{   $lt: d}}]})
        .then(function(users) {
            try{
            data.NotLoggedInUserDetails = users.map(getNameEmail);
            }catch(e){
                console.log(e);
            }finally{
            waitForAll();  
            }  
        })   
        db.users.count({"roles.company-group":{$exists:true},"status.lastLogin.date":{ 
            $lt: new Date(), 
            $gte: d
        }}).then(function(count) {
            data.todayLoggedInUsers = count;
            waitForAll();    
        })
        db.users.count({"roles.company-group":{$exists:true},_loggedIn:true}).then(function(count) {
            data.activeUsers = count;
            waitForAll();
        })
}

function waitForAll(){
    if(--queries==0 || new Date().getTime > startedat + 15000){
        sendMail(data);
        db.close().then(function(){console.log("Done with " + mongoUrl)})
    }
}

'use strict';
const nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport
let transporter = nodemailer.createTransport({
    host: 'smtp.raksan.in',
    port: 25,
    secure: false, // secure:true for port 465, secure:false for port 587
    auth: {
        user: 'stats@fieldeagles.com',
        pass: 'RakSan987'
    }
});

// setup email data with unicode symbols
let mailOptions = {
    from: '"field repo 🦅" <stats@fieldeagles.com>', // sender address
    to: sendAlertsTo, // list of receivers
    subject: instanceName + ' - sMaRt application usage report (' +new Date().toISOString().substr(0,10)+')', // Subject line
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
    var result = "Hi,<br/>Please find the usage statistics for today"
    result = "<table>"
        for(metric in metricName){
            result+=" <tr><td>"+metricName[metric]+"</td><td> : "+json[metric]+"</td></tr>"
        }
    result+="</table><br/>";
    result+= "<h3>Users Logged in today :<h3/>";    
    result+="<table style='border: 1px solid black;'>";
    var users = json.todayLoggedInUserDetails;
    users.forEach(function(user,index){
       result+= getHtmlRow(user,index)}
    )
    result+="</table><br/>";
    result+= "<h3>Users Not Logged in today :<h3/>";
    result+="<table style='border: 1px solid black;'>";
    var users = json.NotLoggedInUserDetails;
    users.forEach(function(user,index){
       result+= getHtmlRow(user,index)}
    )
    result+="</table><br/>";
    return result;
}

function getHtmlRow(user,i){
return " <tr><td style='border: 1px solid black;'>"+(i+1)+".</td><td style='border: 1px solid black;'> "+user['name']+"</td><td style='border: 1px solid black;'>  "+user['email']+"</td></tr>";
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


