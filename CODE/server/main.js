// var csvjson = Npm.require('csvjson');
var csv = Npm.require("csvtojson");
var fs = Npm.require('fs');
var Fiber = Npm.require('fibers');
var path = Npm.require('path');
var glob = require( 'glob' );



Meteor.startup(function () {
  console.log("Starting pumping data from " + process.env.DATA_FOLDER);
    glob(process.env.DATA_FOLDER+'/**/*.csv', Meteor.bindEnvironment( function( err, files ) {
       process.env.DATA_FOLDER=process.env.DATA_FOLDER.replace(/\/$/, "");
       var root = process.env.DATA_FOLDER.length;
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
                        console.log("Going to process file : " + fullPath);
                        Meteor.call("processData", fullPath, context);
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

Slingshot.createDirective("uploadCampaignFile", Slingshot.S3Storage, {
    AWSAccessKeyId: Meteor.settings.private.aws.accessKey,
    AWSSecretAccessKey: Meteor.settings.private.aws.secretAccessKey,
    bucket: Meteor.settings.public.aws.bucket,
    maxSize:null,
    acl: "public-read",
    region: Meteor.settings.public.aws.region,
    allowedFileTypes: null,
    authorize: function () {
        return true;
    },

    key: function (file) {
        // var currentUserId = Meteor.user().emails[0].address;
        return  "campaign/"+Random.id()+"-"+file.name ;
    }

});
Meteor.methods({
    "processData": function (filePath, context)
    {
        csv().fromFile(filePath).on('json', Meteor.bindEnvironment(function(result){
                if(result["SLID"]) {
                    processData(result, context, filePath);
                }
        }));
    },
    "processSpecialization": function (fileData,context) {
        var converter = new Converter({});
        converter.fromString(fileData, Meteor.bindEnvironment(function(err,result){
            if(err)
                return err;

            else {
                processRes(result,context);
            }
        }));
    }
})
function  processRes(list,context){

    _.each(list, function (items,index) {

        var mslId = items["oldMslId"];
        var companyId = context.companyId;
        var divisionId = context.divisionId;
        var qualification = items["qualification"];
        var specialization = items["specialization"];
        var name = items["FIRST NAME"];
        //var customerType = SmtCollections.SmtCompanyCustomersAlias.findOne({companyId:companyId,"code":"DOCTOR"});
        var customerType = {_id:context.customerTypeId};
        var doctorData = SmtCollections.SmtCompaniesCustomer.find({"companyId":companyId,"divisionId":divisionId,"personalDetails.oldMslid":mslId,"customerTypeId":customerType._id,"personalDetails.name":name}).fetch();
        if(doctorData && doctorData.length > 0){
            if(doctorData.length > 1){
                console.log(index,"Doctor multiple found with name:" + name + " mslId:" + mslId );
            }
            var obj = doctorData[0];
            if(qualification){
                var qualificationData = SmtCollections.SmtCustomerQualification.find({"type":qualification,companyId:companyId,"divisionId":divisionId}).fetch();
                if(qualificationData && qualificationData.length > 0){
                    if(specialization){
                        var specializationData = SmtCollections.SmtCustomerSpecialization.find({"qualificationId":qualificationData[0]._id,type:specialization,divisionId:divisionId,companyId:companyId}).fetch();
                        if(specializationData && specializationData.length > 0){
                            obj.personalDetails.qualification = qualificationData[0]._id;
                            obj.personalDetails.specialisation = [specializationData[0]._id];
                            var id = obj._id;
                            var res = SmtCollections.SmtCompaniesCustomer.update({_id:id},{$set:obj});
                            if(res){
                                console.log(index,"customer updated with _id:" + id + " with name: " + obj.personalDetails.name )
                            }else{
                                console.log(index,res);
                            }

                        }else{
                            console.log(index,"specialization data no avail:"+ " " + specialization);
                        }
                    }else{
                        console.log(index,"specialization cell no avail")
                    }

                }else{
                    console.log(index,"qualification data no avail:"+ " " + qualification);
                }
            }else{
                console.log(index,"qualification cell no avail")
            }
        }else{
            console.log(index,"Doctor not found with name:" + name + " mslId:" + mslId );
        }



    })
    console.log("================DONE====================");
}
function processData(customer, context,filePath) {
    var alias = SmtCollections.SmtCompanyCustomersAlias.findOne({_id:context.customerTypeId})
    if(alias.code == "DOCTOR")
        saveDoctorData(customer, context.companyId,context.divisionId, context.customerTypeId,filePath);

    else if (alias.code == "CHEMIST")
        saveChemistData(customer, context.companyId,context.divisionId, context.customerTypeId,filePath)
    else if(alias.code=="STOCKIST"){
        saveStockistData(customer, context.companyId,context.divisionId,context.customerTypeId,filePath)
    }else if(alias.code=="HOSPITAL"){
        saveHospitalData(customer, context.companyId,context.divisionId,context.customerTypeId,filePath)
    }else if(alias.code=="INSTITUTE"){
        saveInstituteData(customer, context.companyId,context.divisionId,context.customerTypeId,filePath)
    }
}

function isDuplicate(slid,company,division,customertype,filePath) {
    return  SmtCollections.smtDataDumpStatus.find({company:company,division:division,customerType:customertype,slid:slid,sourceFile:filePath,status:"SUCCESS"}).fetch().length > 0;
}

function insertStatus(status,slid,company,division,customertype,filePath,err) {
    var insertObj = {company:company,division:division,customerType:customertype,slid:slid,status:status,sourceFile:filePath,timestamp:new Date()}
    if(err){
        insertObj.errors=err.toString();
    }
    SmtCollections.smtDataDumpStatus.insert(insertObj)
}


function saveDoctorData(doctor, companyId,divisionId, customerType,filePath) {
        if(isDuplicate(doctor["SLID"],companyId,divisionId,customerType,filePath)){
            return;
        }
        try{
        var SmtCompaniesCustomer = {};
        var personalDetails      = {};
        var address              = {};
        var contactDetails       = [];
        var jobDetails           = [];
        SmtCompaniesCustomer.companyId = companyId;
        SmtCompaniesCustomer.isActive  = true;
        SmtCompaniesCustomer.customerTypeId = customerType;
        SmtCompaniesCustomer.divisionId = divisionId
        smartIdGenService.smartId(personalDetails);
        personalDetails.slId = new uniqueIdGenService({"companyId":companyId,"divisionId":divisionId}).getUniqueId("slId","SLID");
        personalDetails.oldMslid = doctor["SLID"];
        personalDetails.name = doctor["FIRST NAME"];
        personalDetails.middleName = doctor["MIDDLE NAME"];
        personalDetails.lastName = doctor["LAST NAME"];
        if(doctor["DATE OF BIRTH"] && doctor["DATE OF BIRTH"] != ""){
            var dob = moment(doctor["DATE OF BIRTH"].replace(new RegExp("/","g"),"-"),"DD-MMM-YYYY").format("YYYY-MM-DD")
            personalDetails.dateOfBirth = new Date(dob);
        }
        personalDetails.bloodGroup = doctor["BLOOD GROUP"];
        personalDetails.language = doctor["LANGUAGE"];
        personalDetails.gender = doctor["GENDER"];
        personalDetails.maritalStatus = doctor["MARTIAL STATUS"];
        personalDetails.anniversayDate = doctor["ANNIVERSARY DATE"];
        contactDetails.push({mobileNo:doctor["MOBILE NO"], landlineNo:doctor["LANDLINE NO"], fax:doctor["FAX"]})
        personalDetails.contactDetails = contactDetails;
        var rating = SmtCollections.SmtCustomerRating.findOne({type:doctor["RATING"]});
        if(rating)
            personalDetails.type = rating._id;
        var category = SmtCollections.SmtCustomerTypes.findOne({"type":doctor["DOCTOR TYPE"]})
        if(category)
            personalDetails.category = category._id;

        personalDetails.regNo = doctor["DOCTOR REG NO"];
        var designation = SmtCollections.SmtCustomerProfessionalTags.findOne({type:doctor["PROFESSIONAL TAGS"]})
        if(designation)
            personalDetails.designation =  designation._id;

        var qualification = SmtCollections.SmtCustomerQualification.findOne({type:doctor["QUALIFICATION"],divisionId:SmtCompaniesCustomer.divisionId});
        if(qualification) {
            personalDetails.qualification = qualification._id;
            var specialisation = SmtCollections.SmtCustomerSpecialization.findOne({type:doctor["SPECIALIZATION"],qualificationId:personalDetails.qualification});
            if(specialisation) {
                personalDetails.specialisation = [specialisation._id];
            }else {
                throw new Error("Specialization: " +doctor["SPECIALIZATION"]+" is not in our SmtCustomerSpecialization collection");
            }
        }else{
            throw new Error("Qualification: " + doctor["QUALIFICATION"] +" is not in our SmtCustomerQualification collection")
        }

        //personalDetails.specialisation[0] = doctor["SPECIALIZATION"];
        var lop = SmtCollections.SmtCustomerLineOfPractice.findOne({type:doctor["LINE OF PRACTISE"]});
        if(lop)
            personalDetails.lineOfPractise = lop._id;

        personalDetails.practiseStartDate = doctor["PRACTISE START DATE"];
        address.addressLine1 = doctor["ADDRESS LINE 1"];
        address.addressLine2 = doctor["ADDRESS LINE 2"];
        address.addressLine3 = doctor["ADDRESS LINE 3"];
        address.city         = doctor["CITY"];
        if(doctor["STATE"]){
            var stateName = new RegExp(doctor["STATE"].toLowerCase(), "i");
            var state =  SmtCollections.SmtStates.findOne({name:{$regex:stateName}});
            //var state = SmtCollections.SmtStates.findOne({name:new RegExp(doctor["STATE"].toLowerCase(), "i")});
            if(state)
                address.state        = state._id;
        }

        address.country      = doctor["COUNTRY"];
        personalDetails.address = {}
        personalDetails.address.address = address;
        
            var job = {};
            var address = {};
            var shippinAddress = {};
            var branchContactDetails = [];
            var timingVistit = {};
            var timingWork = [];
            // job.branchImage
            var stationId = SmtCollections.SmtCompanyLocations.findOne({locationName:doctor["STATION"],locationType:"LEVEL-0","companyId":companyId,"companyDivisionId":divisionId});
            if(stationId){
                job.isActive = true;
                job.stationId = stationId._id;
                job.regisNo = doctor["CLINIC REG NO"];
                job.jobPlaceName = doctor["CLINIC NAME"];
                address.addressLine1 = doctor["BRANCH ADDRESS LINE 1"];
                address.addressLine2 = doctor["BRANCH ADDRESS LINE 2"];
                address.addressLine3 = doctor["BRANCH ADDRESS LINE 3"];
                address.city = doctor["BRANCH CITY"];
                address.latitude = doctor["Lat"];
                address.longitude = doctor["Long"];
                var stateName = new RegExp(doctor["STATE"].toLowerCase(), "i");
                var state =  SmtCollections.SmtStates.findOne({name:{$regex:stateName}});
                //var state = SmtCollections.SmtStates.findOne({name:doctor["BRANCH STATE"]});
                if(state)
                    address.state = state._id;
                address.country = doctor["COUNTRY"];
                job.address = {};
                job.address.address = address;
                job.mobileNo = doctor["BRANCH MOBILE NO"];
                job.landlineNo = doctor["BRANCH LANDLINE NO"];
                 job.faxNo = doctor["BRANCH FAX NO"];
                 job.website = doctor["BRANCH WEBSITE"];
                 job.businessPotential = doctor["BRANCH BUISNESS POTENTIAL"];
                 job.sharePercentage = doctor["BRANCH SHARE PERCENTAGE"];
                 job.associatedProducts = [];
                //job.associatedProducts = doctor["BRANCH PRODUCTS"];
                shippinAddress.addressLine1 = doctor["BRANCH SHIPPING ADDRESS LINE 1"];
                 shippinAddress.addressLine2 = doctor["BRANCH SHIPPING ADDRESS LINE 2"];
                 shippinAddress.addressLine2 = doctor["BRANCH SHIPPING ADDRESS LINE 2"];
                 shippinAddress.city = doctor["BRANCH SHIPPING CITY"];
                 var shippingState = SmtCollections.SmtStates.findOne({name:doctor["BRANCH SHIPPING STATE"]});
                 if(shippingState)
                     shippinAddress.state = shippingState._id;

                 shippinAddress.country = doctor["BRANCH SHIPPING COUNTRY"];
                job.shippingAddress = {};
                job.shippingAddress.address = shippinAddress;
                 timingVistit.timingFrom = doctor["BRANCH BEST TIME FROM"];
                 timingVistit.timingEnd = doctor["BRANCH BEST TIME TO"];
                 job.timingVistit = timingVistit;
                 timingWork.days = doctor["BRANCH  WORK TIMINGS DAYS"];
                 timingWork.timingTo = doctor["BRANCH  WORK TIMINGS FROM"];
                 timingWork.timingEnds = doctor["BRANCH  WORK TIMINGS TO"];
                 job.timingWork = timingWork;
                 job.frequencyType = doctor["BRANCH FREQUENCY TYPE"];
                 job.frequencyCall = doctor["BRANCH FREQUENCY CALL"];
                jobDetails.push(job);
            }else {
                throw new Error("Station:"+doctor["STATION"] +" Does not Exist")
            }
        
        SmtCompaniesCustomer.audit={};
        SmtCompaniesCustomer.personalDetails = personalDetails;
        SmtCompaniesCustomer.jobDetails      = jobDetails;
        //console.log(SmtCompaniesCustomer)
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        insertStatus("SUCCESS",doctor["SLID"],companyId,divisionId,customerType,filePath)
    }catch(err){
            if(!doctor["SLID"]) debugger;
            insertStatus("FAILED",doctor["SLID"],companyId,divisionId,customerType,filePath,err)
        }
        //console.log(SmtCollections.SmtCompaniesCustomer.find().fetch())
}

function saveChemistData(chemist, companyId,divisionId,customerType,filePath) {
        if(!chemist["SLID"] || isDuplicate(chemist["SLID"],companyId,divisionId,customerType,filePath)){
            return;
        }
        try{
        var SmtCompaniesCustomer = {};
        var personalDetails      = {};
        var chemistPersonalDetails      = {};
        var address              = {};
        var contactDetails       = [];
        var jobDetails           = [];
        SmtCompaniesCustomer.divisionId = divisionId
        SmtCompaniesCustomer.companyId = companyId;
        SmtCompaniesCustomer.isActive  = true;
        SmtCompaniesCustomer.customerTypeId = customerType;
        smartIdGenService.smartId(personalDetails);
        personalDetails.slId = new uniqueIdGenService({"companyId":companyId,"divisionId":divisionId}).getUniqueId("slId","SLID");
        personalDetails.oldMslid = chemist["SLID"];

        personalDetails.name = chemist["NAME"];
        chemistPersonalDetails.contactNo = chemist["CONTACT NO"];
        chemistPersonalDetails.shortName = chemist["SHORT NAME"];
        chemistPersonalDetails.establishedYear =chemist["ESTABLISHED YEAR"];
        chemistPersonalDetails.registrationNo = chemist["REGISTRATION NO"];
        chemistPersonalDetails.pharmacyType = chemist["PHARMACY TYPE"];
        chemistPersonalDetails.pharmacyCategory = chemist["PHARMACY CATEGORY"];
        chemistPersonalDetails.owner = {};
        chemistPersonalDetails.owner.name = chemist["PROPREITOR NAME"];
        chemistPersonalDetails.owner.ownemailId = chemist["PROPREITOR EMAIL ID"];
        chemistPersonalDetails.owner.ownAddress = chemist["PROPREITOR ADDRESS"];
        chemistPersonalDetails.owner.name = chemist["PROPREITOR NAME"];
        chemistPersonalDetails.owner.name = chemist["PROPREITOR NAME"];

        //personalDetails.regNo = chemist["DOCTOR REG NO"];

        
            var job = {};
            var address = {};
            var shippinAddress = {};
            var branchContactDetails = [];
            var timingVistit = {};
            var timingWork = [];
            // job.branchImage
            var stationId = SmtCollections.SmtCompanyLocations.findOne({locationName:chemist["STATION"],locationType:"LEVEL-0","companyId":companyId,"companyDivisionId":divisionId})
            if(stationId){
                job.stationId = stationId._id;
                job.isActive = true;
                job.jobPlaceName = chemist["CHEMIST NAME"];
                address.addressLine1 = chemist["BRANCH ADDRESS LINE 1"];
                address.addressLine2 = chemist["BRANCH ADDRESS LINE 2"];
                address.addressLine3 = chemist["BRANCH ADDRESS LINE 3"];
                address.latitude = chemist["Lat"];
                address.longitude = chemist["Long"];
                address.city = chemist["BRANCH CITY"];
                var state = SmtCollections.SmtStates.findOne({name:chemist["BRANCH STATE"]});
                if(state)
                    address.state = state._id;
                address.country = chemist["COUNTRY"];
                job.address = {};
                job.address.address = address;
                job.mobileNo = chemist["BRANCH MOBILE NO"];
                job.landlineNo = chemist["BRANCH LANDLINE NO"];
                job.faxNo = chemist["BRANCH FAX NO"];
                job.website = chemist["BRANCH WEBSITE"];
                job.category = chemist["CHEMIST TYPE"];
                job.type = chemist["CHEMIST RATING"];
                job.drugLicenseNo = chemist["BRANCH DRUG LICENSE NO"];
                job.vat = chemist["BRANCH VAT"];
                job.cst = chemist["BRANCH CST"];
                job.tinRegisNo = chemist["BRANCH TIN REGIS NO"];
                shippinAddress.addressLine1 = chemist["BRANCH SHIPPING ADDRESS LINE 1"];
                shippinAddress.addressLine2 = chemist["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.addressLine2 = chemist["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.city = chemist["BRANCH SHIPPING CITY"];
                var shippingState = SmtCollections.SmtStates.findOne({name:chemist["BRANCH SHIPPING STATE"]});
                if(shippingState)
                    shippinAddress.state = shippingState._id;
                shippinAddress.country = chemist["BRANCH SHIPPING COUNTRY"];
                job.shippingAddress = {};
                job.shippingAddress.address = shippinAddress;
                timingVistit.timingFrom = chemist["BRANCH BEST TIME FROM"];
                timingVistit.timingEnd = chemist["BRANCH BEST TIME TO"];
                job.timingVistit = timingVistit;
                timingWork.days = chemist["BRANCH  WORK TIMINGS DAYS"];
                timingWork.timingTo = chemist["BRANCH  WORK TIMINGS FROM"];
                timingWork.timingEnds = chemist["BRANCH  WORK TIMINGS TO"];
                job.timingWork = timingWork;
                job.frequencyType = chemist["BRANCH FREQUENCY TYPE"];
                job.frequencyCall = chemist["BRANCH FREQUENCY CALL"];
                jobDetails.push(job);
            }else {
                throw new Error("Station:"+chemist["STATION"] +" Does not Exist")
            }
        
        //SmtCompaniesCustomer.audit={};
        SmtCompaniesCustomer.personalDetails = personalDetails;
        SmtCompaniesCustomer.chemistPersonalDetails = chemistPersonalDetails;
        SmtCompaniesCustomer.jobDetails      = jobDetails;
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        insertStatus("SUCCESS",chemist["SLID"],companyId,divisionId,customerType,filePath)
        //console.log(SmtCompaniesCustomer)
        }catch(err){
            insertStatus("FAILED",chemist["SLID"],companyId,divisionId,customerType,filePath,err)
        }
}
function saveStockistData(stockist, companyId,divisionId,customerType,filePath) {

        if(isDuplicate(stockist["SLID"],companyId,divisionId,customerType,filePath)){
            return;
        }
        try{
        var SmtCompaniesCustomer = {};
        var personalDetails      = {};
        var stockistPrimaryDetails      = {};
        var address              = {};
        var contactDetails       = [];
        var jobDetails           = [];
        SmtCompaniesCustomer.companyId = companyId;
        SmtCompaniesCustomer.isActive  = true;
        SmtCompaniesCustomer.customerTypeId = customerType;
        SmtCompaniesCustomer.divisionId = divisionId
        smartIdGenService.smartId(personalDetails);
        personalDetails.slId = new uniqueIdGenService({"companyId":companyId,"divisionId":divisionId}).getUniqueId("slId","SLID");
        personalDetails.oldMslid = stockist["SLID"];
        personalDetails.name = stockist["Owner NAME"];
        stockistPrimaryDetails.certificationId = stockist["CERTIFICATION ID"];
        stockistPrimaryDetails.stockistCategory = stockist["STOCKIST TYPE"];
        stockistPrimaryDetails.stockistTye = stockist["RATING"];
        stockistPrimaryDetails.website = stockist["WEBSITE"];
        stockistPrimaryDetails.ownerPersonNo = [stockist["OWNER CONTACT NO"]];
        stockistPrimaryDetails.ownerPersonEmail = [stockist["OWNER EMAIL ID"]];
        var rating = SmtCollections.SmtCustomerRating.findOne({type:stockist["RATING"]});
        if(rating)
            stockistPrimaryDetails.stockistTye = rating._id;
        var category = SmtCollections.SmtCustomerTypes.findOne({"type":stockist["STOCKIST TYPE"]})
        if(category)
            stockistPrimaryDetails.stockistCategory = category._id;
        
            var job = {};
            var address = {};
            var shippinAddress = {};
            var branchContactDetails = [];
            var timingVistit = {};
            var timingWork = [];
            // job.branchImage
            var headquarterId = SmtCollections.SmtCompanyLocations.findOne({locationName:stockist["HEADQUARTER"],locationType:"LEVEL-1","companyId":companyId,"companyDivisionId":divisionId});
            if(headquarterId){
                job.isActive = true;
                job.headquarterId = headquarterId._id;
                job.drugLicenseNo = stockist["BRANCH DRUG LICENSE NO"];
                job.vat = stockist["BRANCH VAT"];
                job.cst = stockist["BRANCH CST"];
                job.tinRegisNo = stockist["BRANCH TIN REGIS NO"];
                address.addressLine1 = stockist["BRANCH ADDRESS LINE 1"];
                address.addressLine2 = stockist["BRANCH ADDRESS LINE 2"];
                address.addressLine3 = stockist["BRANCH ADDRESS LINE 3"];
                address.latitude = stockist["Lat"];
                address.longitude = stockist["Long"];
                address.city = stockist["BRANCH CITY"];
                var state = SmtCollections.SmtStates.findOne({name:stockist["BRANCH STATE"]});
                if(state)
                    address.state = state._id;
                address.country = stockist["COUNTRY"];
                job.address = {};
                job.address.address = address;
                job.mobileNo = stockist["BRANCH MOBILE NO"];
                job.landlineNo = stockist["BRANCH LANDLINE NO"];
                job.faxNo = stockist["BRANCH FAX NO"];
                job.website = stockist["BRANCH WEBSITE"];
                job.category = stockist["CHEMIST TYPE"];
                job.type = stockist["CHEMIST RATING"];
                shippinAddress.addressLine1 = stockist["BRANCH SHIPPING ADDRESS LINE 1"];
                shippinAddress.addressLine2 = stockist["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.addressLine2 = stockist["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.city = stockist["BRANCH SHIPPING CITY"];
                var shippingState = SmtCollections.SmtStates.findOne({name:stockist["BRANCH SHIPPING STATE"]});
                if(shippingState)
                    shippinAddress.state = shippingState._id;
                shippinAddress.country = stockist["BRANCH SHIPPING COUNTRY"];
                job.shippingAddress = {};
                job.shippingAddress.address = shippinAddress;
                job.shippingAddress.address = shippinAddress;
                timingVistit.timingFrom = stockist["BRANCH BEST TIME FROM"];
                timingVistit.timingEnd = stockist["BRANCH BEST TIME TO"];
                job.timingVistit = timingVistit;
                timingWork.days = stockist["BRANCH  WORK TIMINGS DAYS"];
                timingWork.timingTo = stockist["BRANCH  WORK TIMINGS FROM"];
                timingWork.timingEnds = stockist["BRANCH  WORK TIMINGS TO"];
                job.timingWork = timingWork;
                job.frequencyType = stockist["BRANCH FREQUENCY TYPE"];
                job.frequencyCall = stockist["BRANCH FREQUENCY CALL"];
                jobDetails.push(job);
            }else {
                throw new Error("HEADQUARTER: "+stockist["HEADQUARTER"]+" Does not Exist")
            }
        
        SmtCompaniesCustomer.audit = {};
        SmtCompaniesCustomer.personalDetails = personalDetails;
        SmtCompaniesCustomer.stockistPrimaryDetails = stockistPrimaryDetails;
        SmtCompaniesCustomer.jobDetails = jobDetails;
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        insertStatus("SUCCESS",stockist["SLID"],companyId,divisionId,customerType,filePath)
        //console.log(SmtCompaniesCustomer)
        }catch(err){
            insertStatus("FAILED",stockist["SLID"],companyId,divisionId,customerType,filePath,err)
        }
    
}
function saveHospitalData(hospital, companyId,divisionId, customerType,filePath) {
        if(isDuplicate(hospital["SLID"],companyId,divisionId,customerType,filePath)){
            return;
        }
        try{
        var SmtCompaniesCustomer = {};
        var personalDetails      = {};
        var hospitalPrimaryDetails      = {};
        var address              = {};
        var contactDetails       = [];
        var hospitalBusinessDetails           = [];
        SmtCompaniesCustomer.companyId = companyId;
        SmtCompaniesCustomer.isActive  = true;
        SmtCompaniesCustomer.customerTypeId = customerType;
        SmtCompaniesCustomer.divisionId = divisionId
        smartIdGenService.smartId(personalDetails);
        personalDetails.slId = new uniqueIdGenService({"companyId":companyId,"divisionId":divisionId}).getUniqueId("slId","SLID");
        personalDetails.oldMslid = hospital["SLID"];
        personalDetails.name = hospital["HOSPITAL NAME"];
        hospitalPrimaryDetails.shortName = hospital["SHORT NAME"];
        hospitalPrimaryDetails.establishedYear = hospital["ESTABLISHED YEAR"];
        hospitalPrimaryDetails.speciality = hospital["SPECIALITY"];
        hospitalPrimaryDetails.registrationNumber = hospital["registrationNumber"];
        hospitalPrimaryDetails.certificateId = hospital["certificateId"];

        var rating = SmtCollections.SmtCustomerRating.findOne({type:hospital["RATING"]});
        if(rating)
            hospitalPrimaryDetails.hospitalType = rating._id;
        var category = SmtCollections.SmtCustomerTypes.findOne({"type":hospital["HOSPITAL TYPE"]})
        if(category)
            hospitalPrimaryDetails.hospitalCategory = category._id;
        hospitalPrimaryDetails.ownerName = hospital["PROPREITOR NAME"];
        hospitalPrimaryDetails.ownerContactNo = [hospital["PROPREITOR CONTACT NO"]];
        hospitalPrimaryDetails.ownerEmailId = [hospital["PROPREITOR EMAIL ID"]];
        hospitalPrimaryDetails.ownerAddress = [hospital["PROPREITOR ADDRESS"]];
        hospitalPrimaryDetails.website = hospital["WEBSITE"];


        
            var job = {};
            var address = {};
            var shippinAddress = {};
            var branchContactDetails = [];
            var timingVistit = {};
            var timingWork = [];
            // job.branchImage

            var stationId = SmtCollections.SmtCompanyLocations.findOne({locationName:hospital["STATION"],locationType:"LEVEL-0","companyId":companyId,"companyDivisionId":divisionId});
            if(stationId){
                job.isActive = true;
                job.stationId = stationId._id;
                job.branchRegistrationNo = hospital["BRANCH REG NO"];
                job.branchName = hospital["BRANCH NAME"];
                job.numberOfBeds = hospital["NO OF BEDS"];
                address.addressLine1 = hospital["BRANCH ADDRESS LINE 1"];
                address.addressLine2 = hospital["BRANCH ADDRESS LINE 2"];
                address.addressLine3 = hospital["BRANCH ADDRESS LINE 3"];
                address.latitude = hospital["Lat"];
                address.longitude = hospital["Long"];
                address.city = hospital["BRANCH CITY"];
                var state = SmtCollections.SmtStates.findOne({name:hospital["BRANCH STATE"]});
                if(state)
                    address.state = state._id;
                address.country = hospital["COUNTRY"];
                job.address = {};
                job.address.address = address;
                job.mobileNo = hospital["BRANCH MOBILE NO"];
                job.landlineNo = hospital["BRANCH LANDLINE NO"];
                job.faxNo = hospital["BRANCH FAX NO"];
                job.website = hospital["BRANCH WEBSITE"];

                //job.associatedProducts = hospital["BRANCH PRODUCTS"];
                shippinAddress.addressLine1 = hospital["BRANCH SHIPPING ADDRESS LINE 1"];
                shippinAddress.addressLine2 = hospital["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.addressLine2 = hospital["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.city = hospital["BRANCH SHIPPING CITY"];
                var shippingState = SmtCollections.SmtStates.findOne({name:hospital["BRANCH SHIPPING STATE"]});
                if(shippingState)
                    shippinAddress.state = shippingState._id;

                shippinAddress.country = hospital["BRANCH SHIPPING COUNTRY"];
                job.shippingAddress = {};
                job.shippingAddress.address = shippinAddress;
                timingVistit.timingFrom = hospital["BRANCH BEST TIME FROM"];
                timingVistit.timingEnd = hospital["BRANCH BEST TIME TO"];
                job.timingVistit = timingVistit;
                timingWork.days = hospital["BRANCH  WORK TIMINGS DAYS"];
                timingWork.timingTo = hospital["BRANCH  WORK TIMINGS FROM"];
                timingWork.timingEnds = hospital["BRANCH  WORK TIMINGS TO"];
                job.timingWork = timingWork;
                job.frequencyType = hospital["BRANCH FREQUENCY TYPE"];
                job.frequencyCall = hospital["BRANCH FREQUENCY CALL"];
                hospitalBusinessDetails.push(job);
            }else {
                throw new Error("Station:"+hospital["STATION"] +" Does not Exist")
            }
        
        SmtCompaniesCustomer.audit={};
        SmtCompaniesCustomer.personalDetails = personalDetails
        SmtCompaniesCustomer.hospitalPrimaryDetails = hospitalPrimaryDetails;
        SmtCompaniesCustomer.hospitalBusinessDetails = hospitalBusinessDetails;
        //console.log(SmtCompaniesCustomer)
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        //console.log(SmtCollections.SmtCompaniesCustomer.find().fetch())
        insertStatus("SUCCESS",hospital["SLID"],companyId,divisionId,customerType,filePath);
        }catch(err){
            insertStatus("FAILED",hospital["SLID"],companyId,divisionId,customerType,filePath,err)
        }
    
}
function saveInstituteData(insti, companyId,divisionId, customerType,filePath) {
        if(isDuplicate(insti["SLID"],companyId,divisionId,customerType,filePath)){
            return;
        }
        try{
        var SmtCompaniesCustomer = {};
        var personalDetails      = {};
        var hospitalPrimaryDetails      = {};
        var address              = {};
        var contactDetails       = [];
        var hospitalBusinessDetails           = [];
        SmtCompaniesCustomer.companyId = companyId;
        SmtCompaniesCustomer.isActive  = true;
        SmtCompaniesCustomer.customerTypeId = customerType;
        SmtCompaniesCustomer.divisionId = divisionId
        smartIdGenService.smartId(personalDetails);
        personalDetails.slId = new uniqueIdGenService({"companyId":companyId,"divisionId":divisionId}).getUniqueId("slId","SLID");
        personalDetails.oldMslid = insti["SLID"];
        personalDetails.name = insti["INSTITUTE NAME"];
        hospitalPrimaryDetails.shortName = insti["SHORT NAME"];
        hospitalPrimaryDetails.establishedYear = insti["ESTABLISHED YEAR"];
        hospitalPrimaryDetails.speciality = insti["SPECIALITY"];
        hospitalPrimaryDetails.registrationNumber = insti["registrationNumber"];
        hospitalPrimaryDetails.certificateId = insti["certificateId"];

        var rating = SmtCollections.SmtCustomerRating.findOne({type:insti["RATING"]});
        if(rating)
            hospitalPrimaryDetails.hospitalType = rating._id;
        var category = SmtCollections.SmtCustomerTypes.findOne({"type":insti["INSTITUTE TYPE"]})
        if(category)
            hospitalPrimaryDetails.hospitalCategory = category._id;
        hospitalPrimaryDetails.ownerName = insti["PROPREITOR NAME"];
        hospitalPrimaryDetails.ownerContactNo = insti["PROPREITOR CONTACT NO"];
        hospitalPrimaryDetails.ownerEmailId = insti["PROPREITOR EMAIL ID"];
        hospitalPrimaryDetails.ownerAddress = insti["PROPREITOR ADDRESS"];
        hospitalPrimaryDetails.website = insti["WEBSITE"];


            var job = {};
            var address = {};
            var shippinAddress = {};
            var branchContactDetails = [];
            var timingVistit = {};
            var timingWork = [];
            // job.branchImage

            var stationId = SmtCollections.SmtCompanyLocations.findOne({locationName:insti["STATION"],locationType:"LEVEL-0","companyId":companyId,"companyDivisionId":divisionId})
            if(stationId){
                job.isActive = true;
                job.stationId = stationId._id;
                job.branchRegistrationNo = insti["BRANCH REG NO"];
                job.branchName = insti["BRANCH NAME"];
                job.numberOfBeds = insti["NO OF BEDS"];
                address.addressLine1 = insti["BRANCH ADDRESS LINE 1"];
                address.addressLine2 = insti["BRANCH ADDRESS LINE 2"];
                address.addressLine3 = insti["BRANCH ADDRESS LINE 3"];
                address.latitude = insti["Lat"];
                address.longitude = insti["Long"];
                address.city = insti["BRANCH CITY"];
                var state = SmtCollections.SmtStates.findOne({name:insti["BRANCH STATE"]});
                if(state)
                    address.state = state._id;
                address.country = insti["COUNTRY"];
                job.address = {};
                job.address.address = address;
                job.mobileNo = insti["BRANCH MOBILE NO"];
                job.landlineNo = insti["BRANCH LANDLINE NO"];
                job.faxNo = insti["BRANCH FAX NO"];
                job.website = insti["BRANCH WEBSITE"];

                //job.associatedProducts = insti["BRANCH PRODUCTS"];
                shippinAddress.addressLine1 = insti["BRANCH SHIPPING ADDRESS LINE 1"];
                shippinAddress.addressLine2 = insti["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.addressLine2 = insti["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.city = insti["BRANCH SHIPPING CITY"];
                var shippingState = SmtCollections.SmtStates.findOne({name:insti["BRANCH SHIPPING STATE"]});
                if(shippingState)
                    shippinAddress.state = shippingState._id;

                shippinAddress.country = insti["BRANCH SHIPPING COUNTRY"];
                job.shippingAddress = {};
                job.shippingAddress.address = shippinAddress;
                timingVistit.timingFrom = insti["BRANCH BEST TIME FROM"];
                timingVistit.timingEnd = insti["BRANCH BEST TIME TO"];
                job.timingVistit = timingVistit;
                timingWork.days = insti["BRANCH  WORK TIMINGS DAYS"];
                timingWork.timingTo = insti["BRANCH  WORK TIMINGS FROM"];
                timingWork.timingEnds = insti["BRANCH  WORK TIMINGS TO"];
                job.timingWork = timingWork;
                job.frequencyType = insti["BRANCH FREQUENCY TYPE"];
                job.frequencyCall = insti["BRANCH FREQUENCY CALL"];
                hospitalBusinessDetails.push(job);
            }else {
                throw new Error("Station:"+insti["STATION"] +" Does not Exist")
            }
        
        SmtCompaniesCustomer.audit={};
        SmtCompaniesCustomer.personalDetails = personalDetails
        SmtCompaniesCustomer.hospitalPrimaryDetails = hospitalPrimaryDetails;
        SmtCompaniesCustomer.hospitalBusinessDetails = hospitalBusinessDetails;
        //console.log(SmtCompaniesCustomer)
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        insertStatus("SUCCESS",insti["SLID"],companyId,divisionId,customerType,filePath);
        //console.log(SmtCollections.SmtCompaniesCustomer.find().fetch())
        }catch(err){
            insertStatus("FAILED",insti["SLID"],companyId,divisionId,customerType,filePath,err)
        }
    
}