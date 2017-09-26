/**
 * Created by harishreddy on 8/9/17.
 */

var csv = Npm.require("csvtojson");
var fs = Npm.require('fs');
var Fiber = Npm.require('fibers');
var path = Npm.require('path');
var glob = require( 'glob' );



Meteor.startup(function () {
    if(!process.env.UPDATE_DATA_FOLDER){
        return;
    }
    console.log("Starting update data from " + process.env.UPDATE_DATA_FOLDER);
    glob(process.env.UPDATE_DATA_FOLDER+path.sep+'**'+path.sep+'*.csv', Meteor.bindEnvironment( function( err, files ) {
        process.env.UPDATE_DATA_FOLDER=process.env.UPDATE_DATA_FOLDER.replace(/\/$/, "");
        var root = process.env.UPDATE_DATA_FOLDER.length;
        _.each(files,function (fullPath,index) {
            Meteor.setTimeout(function () {
                //prepare context from folder name and file name
                var context = {};
                var contextString = fullPath.substr(root);
                var contextArray = contextString.split('/');
                var company = SmtCollections.SmtCompanies.find({"basicInfo.companyName": contextArray[1]}, {_id: 1}).fetch();
                if (company.length > 0) {
                    context.companyId = company[0]._id;
                    var division = SmtCollections.SmtCompaniesDivision.find({
                        name: contextArray[2],
                        companyId: context.companyId
                    }, {_id: 1}).fetch();
                    if (division.length > 0) {
                        context.divisionId = division[0]._id;
                        var type = SmtCollections.SmtCompanyCustomersAlias.find({
                            name: contextArray[3].split('_')[0],
                            companyId: context.companyId
                        }).fetch();
                        if (type.length > 0) {
                            context.customerTypeId = type[0]._id;
                        } else {
                            console.log("Check the file Name : No customer of type " + contextArray[3].split('_')[0] + " exists");
                        }
                        console.log(index+1 +". Going to process file : " + fullPath);
                        Meteor.call("updateData", fullPath, context);
                    } else {
                        console.log("Check the folder name.There is no division with name " + contextArray[2] + " in SmtCompaniesDivision collection for company " + contextArray[1]);
                    }
                } else {
                    console.log("Check the folder name.There is no company with name " + contextArray[1] + " in SmtCompanies collection");
                }
            },(index + 1) * 6000);
        });
    }));
});


Meteor.methods({
    "updateData": function (filePath, context) {
        csv().fromFile(filePath).on('json', Meteor.bindEnvironment(function (result) {
            if (result["SLID"] && /\w*-\d*/.test(result["SLID"])) {
                updateData(result, context, filePath);
            }
        }));
    }
});

function updateData(customer, context,filePath) {
    var alias = SmtCollections.SmtCompanyCustomersAlias.findOne({_id:context.customerTypeId})
    if(alias.code == "DOCTOR")
        updateDocCheData(customer, context.companyId,context.divisionId, context.customerTypeId,filePath);
    else if (alias.code == "CHEMIST")
        updateDocCheData(customer, context.companyId,context.divisionId, context.customerTypeId,filePath)
    else if(alias.code=="STOCKIST"){
        updateStockistData(customer, context.companyId,context.divisionId,context.customerTypeId,filePath)
    }else if(alias.code=="HOSPITAL"){
        updateHospitalData(customer, context.companyId,context.divisionId,context.customerTypeId,filePath)
    }else if(alias.code=="INSTITUTE"){
        updateInstituteData(customer, context.companyId,context.divisionId,context.customerTypeId,filePath)
    }
}


function updateDocCheData(doctorORchemist, companyId,divisionId, customerType,filePath) {
    var mslId = doctorORchemist["SLID"];

    var name = doctorORchemist["FIRST NAME"] || doctorORchemist["NAME"];

    var middleName = doctorORchemist["MIDDLE NAME"];
    var lastName = doctorORchemist["LAST NAME"];
    var ftype = doctorORchemist["BRANCH FREQUENCY TYPE"] || doctorORchemist["BRANCHFREQUENCYTYPE"];
    var fcall = doctorORchemist["BRANCH FREQUENCY CALL"] || doctorORchemist["BRANCHFREQUENCYCALL"];
    var filter = {"companyId":companyId,"divisionId":divisionId,"personalDetails.oldMslid":mslId,
        "customerTypeId":customerType,"personalDetails.name":name,
        "jobDetails.frequencyCall":{$exists:false}};
    if(lastName){
        filter["personalDetails.lastName"]=lastName;
    }
    if(middleName){
        filter["personalDetails.middleName"]=middleName;
    }
    SmtCollections.SmtCompaniesCustomer.update(filter,{$set:{"jobDetails.0.frequencyType":ftype,"jobDetails.0.frequencyCall":fcall}});
}

function  updateHospitalInstData(hospitalORinst,companyId,divisionId, customerType,filePath){
    var mslId = hospitalORinst["SLID"];

    var name = hospitalORinst["FIRST NAME"] || hospitalORinst["NAME"];

    var ftype = hospitalORinst["BRANCH FREQUENCY TYPE"] || hospitalORinst["BRANCHFREQUENCYTYPE"];
    var fcall = hospitalORinst["BRANCH FREQUENCY CALL"] || hospitalORinst["BRANCHFREQUENCYCALL"];
    var filter = {"companyId":companyId,"divisionId":divisionId,"personalDetails.oldMslid":mslId,
        "customerTypeId":customerType,"personalDetails.name":name,
        "hospitalBusinessDetails.frequencyCall":{$exists:false}};

    SmtCollections.SmtCompaniesCustomer.update(filter,{$set:{"hospitalBusinessDetails.0.frequencyType":ftype,"hospitalBusinessDetails.0.frequencyCall":fcall}});

}
