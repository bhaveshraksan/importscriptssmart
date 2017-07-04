// var csvjson = Npm.require('csvjson');
var Converter = Npm.require("csvtojson").Converter;
var fs = Npm.require('fs');
var Fiber = Npm.require('fibers');
var path = Npm.require('path');
var glob = require( 'glob' );



Meteor.startup(function () {
  console.log("Starting pumping data from " + process.env.DATA_FOLDER);
    glob(process.env.DATA_FOLDER+'/**/*.csv', Meteor.bindEnvironment( function( err, files ) {
        console.log( files );
       var root = process.env.DATA_FOLDER.length;
        _.each(files,function (fullPath) {
            //prepare context from folder name and file name
            var context = {};
            var contextString = fullPath.substr(root);
            console.log(contextString);
            var contextArray = contextString.split('/');
            var company = SmtCollections.SmtCompanies.find({"basicInfo.companyName":contextArray[1]},{_id:1}).fetch();
            if(company.length>0){
                context.companyId = company[0]._id;
                var division = SmtCollections.SmtCompaniesDivision.find({name:contextArray[2],companyId:context.companyId},{_id:1}).fetch();
                if(division.length>0){
                    context.divisionId = division[0]._id;
                    var type = SmtCollections.SmtCompanyCustomersAlias.find({name:contextArray[3].split('_')[0],
                        companyId:context.companyId}).fetch();
                    if(type.length>0){
                        context.customerTypeId =type[0]._id;
                    }else{
                        console.log("Check the file Name : No customer of type "+contextArray[3].split('_')[0]+ " exists");
                    }
                    console.log("Going to process file : " + fullPath);
                    Meteor.call("processData",fullPath,context);
                }else{
                    console.log("Check the folder name.There is no division with name " +contextArray[2] +" in SmtCompaniesDivision collection for company "+contextArray[1]);
                }
            }else{
                console.log("Check the folder name.There is no company with name " +contextArray[1] +" in SmtCompanies collection");
            }
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
        var converter = new Converter({});
        converter.fromFile(filePath, Meteor.bindEnvironment(function(err,result){
            if(err)
                return err;

            else {
                processData(result, context,filePath);
            }
        }));
    }
})

function processData(list, context,filePath) {
    var arr = [];
    _.map(_.groupBy(list,function(doc){
        return doc.SLID;
    }),function(grouped){
        arr.push(grouped);
        return grouped;
    });
    var alias = SmtCollections.SmtCompanyCustomersAlias.findOne({_id:context.customerTypeId})
    if(alias.code == "DOCTOR")
        saveDoctorData(arr, context.companyId,context.divisionId, context.customerTypeId,filePath);

    else if (alias.code == "CHEMIST")
        saveChemistData(arr, context.companyId,context.divisionId, context.customerTypeId,filePath)
    else if(alias.code=="STOCKIST"){
        saveStockistData(arr, context.companyId,context.divisionId,context.customerTypeId,filePath)
    }else if(alias.code=="HOSPITAL"){
        saveHospitalData(arr, context.companyId,context.divisionId,context.customerTypeId,filePath)
    }else if(alias.code=="INSTITUTE"){
        saveInstituteData(arr, context.companyId,context.divisionId,context.customerTypeId,filePath)
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

function saveDoctorData(list, companyId,divisionId, customerType,filePath) {
    _.each(list, function (items) {
        if(isDuplicate(items[0]["SLID"],companyId,divisionId,customerType,filePath)){
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
        personalDetails.oldMslid = items[0]["SLID"];
        personalDetails.name = items[0]["FIRST NAME"];
        personalDetails.middleName = items[0]["MIDDLE NAME"];
        personalDetails.lastName = items[0]["LAST NAME"];
        personalDetails.dateOfBirth = items[0]["DATE OF BIRTH"];
        personalDetails.bloodGroup = items[0]["BLOOD GROUP"];
        personalDetails.language = items[0]["LANGUAGE"];
        personalDetails.gender = items[0]["GENDER"];
        personalDetails.maritalStatus = items[0]["MARTIAL STATUS"];
        personalDetails.anniversayDate = items[0]["ANNIVERSARY DATE"];
        contactDetails.push({mobileNo:items[0]["MOBILE NO"], landlineNo:items[0]["LANDLINE NO"], fax:items[0]["FAX"]})
        personalDetails.contactDetails = contactDetails;
        var rating = SmtCollections.SmtCustomerRating.findOne({type:items[0]["RATING"]});
        if(rating)
            personalDetails.type = rating._id;
        var category = SmtCollections.SmtCustomerTypes.findOne({"type":items[0]["DOCTOR TYPE"]})
        if(category)
            personalDetails.category = category._id;

        personalDetails.regNo = items[0]["DOCTOR REG NO"];
        var designation = SmtCollections.SmtCustomerProfessionalTags.findOne({type:items[0]["PROFESSIONAL TAGS"]})
        if(designation)
            personalDetails.designation =  designation._id;

        var qualification = SmtCollections.SmtCustomerQualification.findOne({type:items[0]["QUALIFICATION"],divisionId:SmtCompaniesCustomer.divisionId});
        if(qualification) {
            personalDetails.qualification = qualification._id;
            var specialisation = SmtCollections.SmtCustomerSpecialization.findOne({type:items[0]["SPECIALIZATION"],qualificationId:personalDetails.qualification});
            if(specialisation) {
                personalDetails.specialisation = [specialisation._id];
            }else {
                throw new Error("Specialization: " +items[0]["SPECIALIZATION"]+" is not in our SmtCustomerSpecialization collection");
            }
        }else{
            throw new Error("Qualification: " + items[0]["QUALIFICATION"] +" is not in our SmtCustomerQualification collection")
        }

        //personalDetails.specialisation[0] = items[0]["SPECIALIZATION"];
        var lop = SmtCollections.SmtCustomerLineOfPractice.findOne({type:items[0]["LINE OF PRACTISE"]});
        if(lop)
            personalDetails.lineOfPractise = lop._id;

        personalDetails.practiseStartDate = items[0]["PRACTISE START DATE"];
        address.addressLine1 = items[0]["ADDRESS LINE 1"];
        address.addressLine2 = items[0]["ADDRESS LINE 2"];
        address.addressLine3 = items[0]["ADDRESS LINE 3"];
        address.city         = items[0]["CITY"];
        if(items[0]["STATE"]){
            var stateName = new RegExp(items[0]["STATE"].toLowerCase(), "i");
            var state =  SmtCollections.SmtStates.findOne({name:{$regex:stateName}});
            //var state = SmtCollections.SmtStates.findOne({name:new RegExp(items[0]["STATE"].toLowerCase(), "i")});
            if(state)
                address.state        = state._id;
        }

        address.country      = items[0]["COUNTRY"];
        personalDetails.address = {}
        personalDetails.address.address = address;
        _.each(items, function (item) {
            var job = {};
            var address = {};
            var shippinAddress = {};
            var branchContactDetails = [];
            var timingVistit = {};
            var timingWork = [];
            // job.branchImage
            var stationId = SmtCollections.SmtCompanyLocations.findOne({locationName:item["STATION"],locationType:"LEVEL-0","companyId":companyId,"companyDivisionId":divisionId});
            if(stationId){
                job.isActive = true;
                job.stationId = stationId._id;
                job.regisNo = item["CLINIC REG NO"];
                job.jobPlaceName = item["CLINIC NAME"];
                address.addressLine1 = item["BRANCH ADDRESS LINE 1"];
                address.addressLine2 = item["BRANCH ADDRESS LINE 2"];
                address.addressLine3 = item["BRANCH ADDRESS LINE 3"];
                address.city = item["BRANCH CITY"];
                address.latitude = item["Lat"];
                address.longitude = item["Long"];
                var stateName = new RegExp(items[0]["STATE"].toLowerCase(), "i");
                var state =  SmtCollections.SmtStates.findOne({name:{$regex:stateName}});
                //var state = SmtCollections.SmtStates.findOne({name:item["BRANCH STATE"]});
                if(state)
                    address.state = state._id;
                address.country = item["COUNTRY"];
                job.address = {};
                job.address.address = address;
                job.mobileNo = item["BRANCH MOBILE NO"];
                job.landlineNo = item["BRANCH LANDLINE NO"];
                 job.faxNo = item["BRANCH FAX NO"];
                 job.website = item["BRANCH WEBSITE"];
                 job.businessPotential = item["BRANCH BUISNESS POTENTIAL"];
                 job.sharePercentage = item["BRANCH SHARE PERCENTAGE"];
                 job.associatedProducts = [];
                //job.associatedProducts = item["BRANCH PRODUCTS"];
                shippinAddress.addressLine1 = item["BRANCH SHIPPING ADDRESS LINE 1"];
                 shippinAddress.addressLine2 = item["BRANCH SHIPPING ADDRESS LINE 2"];
                 shippinAddress.addressLine2 = item["BRANCH SHIPPING ADDRESS LINE 2"];
                 shippinAddress.city = item["BRANCH SHIPPING CITY"];
                 var shippingState = SmtCollections.SmtStates.findOne({name:item["BRANCH SHIPPING STATE"]});
                 if(shippingState)
                     shippinAddress.state = shippingState._id;

                 shippinAddress.country = item["BRANCH SHIPPING COUNTRY"];
                job.shippingAddress = {};
                job.shippingAddress.address = shippinAddress;
                 timingVistit.timingFrom = item["BRANCH BEST TIME FROM"];
                 timingVistit.timingEnd = item["BRANCH BEST TIME TO"];
                 job.timingVistit = timingVistit;
                 timingWork.days = item["BRANCH  WORK TIMINGS DAYS"];
                 timingWork.timingTo = item["BRANCH  WORK TIMINGS FROM"];
                 timingWork.timingEnds = item["BRANCH  WORK TIMINGS TO"];
                 job.timingWork = timingWork;
                 job.frequencyType = item["BRANCH FREQUENCY TYPE"];
                 job.frequencyCall = item["BRANCH FREQUENCY CALL"];
                jobDetails.push(job);
            }else {
                throw new Error("Station:"+item["STATION"] +" Does not Exist")
            }
        })
        SmtCompaniesCustomer.audit={};
        SmtCompaniesCustomer.personalDetails = personalDetails;
        SmtCompaniesCustomer.jobDetails      = jobDetails;
        //console.log(SmtCompaniesCustomer)
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        insertStatus("SUCCESS",items[0]["SLID"],companyId,divisionId,customerType,filePath)
        }catch(err){
            insertStatus("FAILED",items[0]["SLID"],companyId,divisionId,customerType,filePath,err)
        }
        //console.log(SmtCollections.SmtCompaniesCustomer.find().fetch())
    })
}

function saveChemistData(list, companyId,divisionId,customerType,filePath) {
    _.each(list, function (items) {
        if(isDuplicate(items[0]["SLID"],companyId,divisionId,customerType,filePath)){
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
        personalDetails.oldMslid = items[0]["SLID"];

        personalDetails.name = items[0]["NAME"];
        chemistPersonalDetails.contactNo = items[0]["CONTACT NO"];
        chemistPersonalDetails.shortName = items[0]["SHORT NAME"];
        chemistPersonalDetails.establishedYear =items[0]["ESTABLISHED YEAR"];
        chemistPersonalDetails.registrationNo = items[0]["REGISTRATION NO"];
        chemistPersonalDetails.pharmacyType = items[0]["PHARMACY TYPE"];
        chemistPersonalDetails.pharmacyCategory = items[0]["PHARMACY CATEGORY"];
        chemistPersonalDetails.owner = {};
        chemistPersonalDetails.owner.name = items[0]["PROPREITOR NAME"];
        chemistPersonalDetails.owner.ownemailId = items[0]["PROPREITOR EMAIL ID"];
        chemistPersonalDetails.owner.ownAddress = items[0]["PROPREITOR ADDRESS"];
        chemistPersonalDetails.owner.name = items[0]["PROPREITOR NAME"];
        chemistPersonalDetails.owner.name = items[0]["PROPREITOR NAME"];

        //personalDetails.regNo = items[0]["DOCTOR REG NO"];

        _.each(items, function (item) {
            var job = {};
            var address = {};
            var shippinAddress = {};
            var branchContactDetails = [];
            var timingVistit = {};
            var timingWork = [];
            // job.branchImage
            var stationId = SmtCollections.SmtCompanyLocations.findOne({locationName:item["STATION"],locationType:"LEVEL-0","companyId":companyId,"companyDivisionId":divisionId})
            if(stationId){
                job.stationId = stationId._id;
                job.isActive = true;
                job.jobPlaceName = item["CHEMIST NAME"];
                address.addressLine1 = item["BRANCH ADDRESS LINE 1"];
                address.addressLine2 = item["BRANCH ADDRESS LINE 2"];
                address.addressLine3 = item["BRANCH ADDRESS LINE 3"];
                address.latitude = item["Lat"];
                address.longitude = item["Long"];
                address.city = item["BRANCH CITY"];
                var state = SmtCollections.SmtStates.findOne({name:item["BRANCH STATE"]});
                if(state)
                    address.state = state._id;
                address.country = item["COUNTRY"];
                job.address = {};
                job.address.address = address;
                job.mobileNo = item["BRANCH MOBILE NO"];
                job.landlineNo = item["BRANCH LANDLINE NO"];
                job.faxNo = item["BRANCH FAX NO"];
                job.website = item["BRANCH WEBSITE"];
                job.category = item["CHEMIST TYPE"];
                job.type = item["CHEMIST RATING"];
                job.drugLicenseNo = item["BRANCH DRUG LICENSE NO"];
                job.vat = item["BRANCH VAT"];
                job.cst = item["BRANCH CST"];
                job.tinRegisNo = item["BRANCH TIN REGIS NO"];
                shippinAddress.addressLine1 = item["BRANCH SHIPPING ADDRESS LINE 1"];
                shippinAddress.addressLine2 = item["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.addressLine2 = item["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.city = item["BRANCH SHIPPING CITY"];
                var shippingState = SmtCollections.SmtStates.findOne({name:item["BRANCH SHIPPING STATE"]});
                if(shippingState)
                    shippinAddress.state = shippingState._id;
                shippinAddress.country = item["BRANCH SHIPPING COUNTRY"];
                job.shippingAddress = {};
                job.shippingAddress.address = shippinAddress;
                timingVistit.timingFrom = item["BRANCH BEST TIME FROM"];
                timingVistit.timingEnd = item["BRANCH BEST TIME TO"];
                job.timingVistit = timingVistit;
                timingWork.days = item["BRANCH  WORK TIMINGS DAYS"];
                timingWork.timingTo = item["BRANCH  WORK TIMINGS FROM"];
                timingWork.timingEnds = item["BRANCH  WORK TIMINGS TO"];
                job.timingWork = timingWork;
                job.frequencyType = item["BRANCH FREQUENCY TYPE"];
                job.frequencyCall = item["BRANCH FREQUENCY CALL"];
                jobDetails.push(job);
            }else {
                throw new Error("Station:"+item["STATION"] +" Does not Exist")
            }
        })
        //SmtCompaniesCustomer.audit={};
        SmtCompaniesCustomer.personalDetails = personalDetails;
        SmtCompaniesCustomer.chemistPersonalDetails = chemistPersonalDetails;
        SmtCompaniesCustomer.jobDetails      = jobDetails;
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        insertStatus("SUCCESS",items[0]["SLID"],companyId,divisionId,customerType,filePath)
        //console.log(SmtCompaniesCustomer)
        }catch(err){
            insertStatus("FAILED",items[0]["SLID"],companyId,divisionId,customerType,filePath,err)
        }
    })
}
function saveStockistData(list, companyId,divisionId,customerType,filePath) {
    _.each(list, function (items) {
        if(isDuplicate(items[0]["SLID"],companyId,divisionId,customerType,filePath)){
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
        personalDetails.oldMslid = items[0]["SLID"];
        personalDetails.name = items[0]["Owner NAME"];
        stockistPrimaryDetails.certificationId = items[0]["CERTIFICATION ID"];
        stockistPrimaryDetails.stockistCategory = items[0]["STOCKIST TYPE"];
        stockistPrimaryDetails.stockistTye = items[0]["RATING"];
        stockistPrimaryDetails.website = items[0]["WEBSITE"];
        stockistPrimaryDetails.ownerPersonNo = [items[0]["OWNER CONTACT NO"]];
        stockistPrimaryDetails.ownerPersonEmail = [items[0]["OWNER EMAIL ID"]];
        var rating = SmtCollections.SmtCustomerRating.findOne({type:items[0]["RATING"]});
        if(rating)
            stockistPrimaryDetails.stockistTye = rating._id;
        var category = SmtCollections.SmtCustomerTypes.findOne({"type":items[0]["STOCKIST TYPE"]})
        if(category)
            stockistPrimaryDetails.stockistCategory = category._id;
        _.each(items, function (item) {
            var job = {};
            var address = {};
            var shippinAddress = {};
            var branchContactDetails = [];
            var timingVistit = {};
            var timingWork = [];
            // job.branchImage
            var headquarterId = SmtCollections.SmtCompanyLocations.findOne({locationName:item["HEADQUARTER"],locationType:"LEVEL-1","companyId":companyId,"companyDivisionId":divisionId});
            if(headquarterId){
                job.headquarterId = headquarterId._id;
                job.drugLicenseNo = item["BRANCH DRUG LICENSE NO"];
                job.vat = item["BRANCH VAT"];
                job.cst = item["BRANCH CST"];
                job.tinRegisNo = item["BRANCH TIN REGIS NO"];
                address.addressLine1 = item["BRANCH ADDRESS LINE 1"];
                address.addressLine2 = item["BRANCH ADDRESS LINE 2"];
                address.addressLine3 = item["BRANCH ADDRESS LINE 3"];
                address.latitude = item["Lat"];
                address.longitude = item["Long"];
                address.city = item["BRANCH CITY"];
                var state = SmtCollections.SmtStates.findOne({name:item["BRANCH STATE"]});
                if(state)
                    address.state = state._id;
                address.country = item["COUNTRY"];
                job.address = {};
                job.address.address = address;
                job.mobileNo = item["BRANCH MOBILE NO"];
                job.landlineNo = item["BRANCH LANDLINE NO"];
                job.faxNo = item["BRANCH FAX NO"];
                job.website = item["BRANCH WEBSITE"];
                job.category = item["CHEMIST TYPE"];
                job.type = item["CHEMIST RATING"];
                shippinAddress.addressLine1 = item["BRANCH SHIPPING ADDRESS LINE 1"];
                shippinAddress.addressLine2 = item["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.addressLine2 = item["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.city = item["BRANCH SHIPPING CITY"];
                var shippingState = SmtCollections.SmtStates.findOne({name:item["BRANCH SHIPPING STATE"]});
                if(shippingState)
                    shippinAddress.state = shippingState._id;
                shippinAddress.country = item["BRANCH SHIPPING COUNTRY"];
                job.shippingAddress = {};
                job.shippingAddress.address = shippinAddress;
                job.shippingAddress.address = shippinAddress;
                timingVistit.timingFrom = item["BRANCH BEST TIME FROM"];
                timingVistit.timingEnd = item["BRANCH BEST TIME TO"];
                job.timingVistit = timingVistit;
                timingWork.days = item["BRANCH  WORK TIMINGS DAYS"];
                timingWork.timingTo = item["BRANCH  WORK TIMINGS FROM"];
                timingWork.timingEnds = item["BRANCH  WORK TIMINGS TO"];
                job.timingWork = timingWork;
                job.frequencyType = item["BRANCH FREQUENCY TYPE"];
                job.frequencyCall = item["BRANCH FREQUENCY CALL"];
                jobDetails.push(job);
            }else {
                throw new Error("HEADQUARTER: "+item["HEADQUARTER"]+" Does not Exist")
            }
        })
        SmtCompaniesCustomer.audit = {};
        SmtCompaniesCustomer.personalDetails = personalDetails;
        SmtCompaniesCustomer.stockistPrimaryDetails = stockistPrimaryDetails;
        SmtCompaniesCustomer.jobDetails      = jobDetails;
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        insertStatus("SUCCESS",items[0]["SLID"],companyId,divisionId,customerType,filePath)
        //console.log(SmtCompaniesCustomer)
        }catch(err){
            insertStatus("FAILED",items[0]["SLID"],companyId,divisionId,customerType,filePath,err)
        }
    })
}
function saveHospitalData(list, companyId,divisionId, customerType,filePath) {
    _.each(list, function (items) {
        if(isDuplicate(items[0]["SLID"],companyId,divisionId,customerType,filePath)){
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
        personalDetails.oldMslid = items[0]["SLID"];
        personalDetails.name = items[0]["HOSPITAL NAME"];
        hospitalPrimaryDetails.shortName = items[0]["SHORT NAME"];
        hospitalPrimaryDetails.establishedYear = items[0]["ESTABLISHED YEAR"];
        hospitalPrimaryDetails.speciality = items[0]["SPECIALITY"];
        hospitalPrimaryDetails.registrationNumber = items[0]["registrationNumber"];
        hospitalPrimaryDetails.certificateId = items[0]["certificateId"];

        var rating = SmtCollections.SmtCustomerRating.findOne({type:items[0]["RATING"]});
        if(rating)
            hospitalPrimaryDetails.hospitalType = rating._id;
        var category = SmtCollections.SmtCustomerTypes.findOne({"type":items[0]["HOSPITAL TYPE"]})
        if(category)
            hospitalPrimaryDetails.hospitalCategory = category._id;
        hospitalPrimaryDetails.ownerName = items[0]["PROPREITOR NAME"];
        hospitalPrimaryDetails.ownerContactNo = [items[0]["PROPREITOR CONTACT NO"]];
        hospitalPrimaryDetails.ownerEmailId = [items[0]["PROPREITOR EMAIL ID"]];
        hospitalPrimaryDetails.ownerAddress = [items[0]["PROPREITOR ADDRESS"]];
        hospitalPrimaryDetails.website = items[0]["WEBSITE"];


        _.each(items, function (item) {
            var job = {};
            var address = {};
            var shippinAddress = {};
            var branchContactDetails = [];
            var timingVistit = {};
            var timingWork = [];
            // job.branchImage

            var stationId = SmtCollections.SmtCompanyLocations.findOne({locationName:item["STATION"],locationType:"LEVEL-0","companyId":companyId,"companyDivisionId":divisionId});
            if(stationId){
                job.stationId = stationId._id;
                job.branchRegistrationNo = item["BRANCH REG NO"];
                job.branchName = item["BRANCH NAME"];
                job.numberOfBeds = item["NO OF BEDS"];
                address.addressLine1 = item["BRANCH ADDRESS LINE 1"];
                address.addressLine2 = item["BRANCH ADDRESS LINE 2"];
                address.addressLine3 = item["BRANCH ADDRESS LINE 3"];
                address.latitude = item["Lat"];
                address.longitude = item["Long"];
                address.city = item["BRANCH CITY"];
                var state = SmtCollections.SmtStates.findOne({name:item["BRANCH STATE"]});
                if(state)
                    address.state = state._id;
                address.country = item["COUNTRY"];
                job.address = {};
                job.address.address = address;
                job.mobileNo = item["BRANCH MOBILE NO"];
                job.landlineNo = item["BRANCH LANDLINE NO"];
                job.faxNo = item["BRANCH FAX NO"];
                job.website = item["BRANCH WEBSITE"];

                //job.associatedProducts = item["BRANCH PRODUCTS"];
                shippinAddress.addressLine1 = item["BRANCH SHIPPING ADDRESS LINE 1"];
                shippinAddress.addressLine2 = item["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.addressLine2 = item["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.city = item["BRANCH SHIPPING CITY"];
                var shippingState = SmtCollections.SmtStates.findOne({name:item["BRANCH SHIPPING STATE"]});
                if(shippingState)
                    shippinAddress.state = shippingState._id;

                shippinAddress.country = item["BRANCH SHIPPING COUNTRY"];
                job.shippingAddress = {};
                job.shippingAddress.address = shippinAddress;
                timingVistit.timingFrom = item["BRANCH BEST TIME FROM"];
                timingVistit.timingEnd = item["BRANCH BEST TIME TO"];
                job.timingVistit = timingVistit;
                timingWork.days = item["BRANCH  WORK TIMINGS DAYS"];
                timingWork.timingTo = item["BRANCH  WORK TIMINGS FROM"];
                timingWork.timingEnds = item["BRANCH  WORK TIMINGS TO"];
                job.timingWork = timingWork;
                job.frequencyType = item["BRANCH FREQUENCY TYPE"];
                job.frequencyCall = item["BRANCH FREQUENCY CALL"];
                hospitalBusinessDetails.push(job);
            }else {
                throw new Error("Station:"+item["STATION"] +" Does not Exist")
            }
        })
        SmtCompaniesCustomer.audit={};
        SmtCompaniesCustomer.personalDetails = personalDetails
        SmtCompaniesCustomer.hospitalPrimaryDetails = hospitalPrimaryDetails;
        SmtCompaniesCustomer.hospitalBusinessDetails = hospitalBusinessDetails;
        //console.log(SmtCompaniesCustomer)
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        //console.log(SmtCollections.SmtCompaniesCustomer.find().fetch())
        insertStatus("SUCCESS",items[0]["SLID"],companyId,divisionId,customerType,filePath);
        }catch(err){
            insertStatus("FAILED",items[0]["SLID"],companyId,divisionId,customerType,filePath,err)
        }
    })
}
function saveInstituteData(list, companyId,divisionId, customerType,filePath) {
    _.each(list, function (items) {
        if(isDuplicate(items[0]["SLID"],companyId,divisionId,customerType,filePath)){
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
        personalDetails.oldMslid = items[0]["SLID"];
        personalDetails.name = items[0]["INSTITUTE NAME"];
        hospitalPrimaryDetails.shortName = items[0]["SHORT NAME"];
        hospitalPrimaryDetails.establishedYear = items[0]["ESTABLISHED YEAR"];
        hospitalPrimaryDetails.speciality = items[0]["SPECIALITY"];
        hospitalPrimaryDetails.registrationNumber = items[0]["registrationNumber"];
        hospitalPrimaryDetails.certificateId = items[0]["certificateId"];

        var rating = SmtCollections.SmtCustomerRating.findOne({type:items[0]["RATING"]});
        if(rating)
            hospitalPrimaryDetails.hospitalType = rating._id;
        var category = SmtCollections.SmtCustomerTypes.findOne({"type":items[0]["INSTITUTE TYPE"]})
        if(category)
            hospitalPrimaryDetails.hospitalCategory = category._id;
        hospitalPrimaryDetails.ownerName = items[0]["PROPREITOR NAME"];
        hospitalPrimaryDetails.ownerContactNo = items[0]["PROPREITOR CONTACT NO"];
        hospitalPrimaryDetails.ownerEmailId = items[0]["PROPREITOR EMAIL ID"];
        hospitalPrimaryDetails.ownerAddress = items[0]["PROPREITOR ADDRESS"];
        hospitalPrimaryDetails.website = items[0]["WEBSITE"];


        _.each(items, function (item) {
            var job = {};
            var address = {};
            var shippinAddress = {};
            var branchContactDetails = [];
            var timingVistit = {};
            var timingWork = [];
            // job.branchImage

            var stationId = SmtCollections.SmtCompanyLocations.findOne({locationName:item["STATION"],locationType:"LEVEL-0","companyId":companyId,"companyDivisionId":divisionId})
            if(stationId){
                job.stationId = stationId._id;
                job.branchRegistrationNo = item["BRANCH REG NO"];
                job.branchName = item["BRANCH NAME"];
                job.numberOfBeds = item["NO OF BEDS"];
                address.addressLine1 = item["BRANCH ADDRESS LINE 1"];
                address.addressLine2 = item["BRANCH ADDRESS LINE 2"];
                address.addressLine3 = item["BRANCH ADDRESS LINE 3"];
                address.latitude = item["Lat"];
                address.longitude = item["Long"];
                address.city = item["BRANCH CITY"];
                var state = SmtCollections.SmtStates.findOne({name:item["BRANCH STATE"]});
                if(state)
                    address.state = state._id;
                address.country = item["COUNTRY"];
                job.address = {};
                job.address.address = address;
                job.mobileNo = item["BRANCH MOBILE NO"];
                job.landlineNo = item["BRANCH LANDLINE NO"];
                job.faxNo = item["BRANCH FAX NO"];
                job.website = item["BRANCH WEBSITE"];

                //job.associatedProducts = item["BRANCH PRODUCTS"];
                shippinAddress.addressLine1 = item["BRANCH SHIPPING ADDRESS LINE 1"];
                shippinAddress.addressLine2 = item["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.addressLine2 = item["BRANCH SHIPPING ADDRESS LINE 2"];
                shippinAddress.city = item["BRANCH SHIPPING CITY"];
                var shippingState = SmtCollections.SmtStates.findOne({name:item["BRANCH SHIPPING STATE"]});
                if(shippingState)
                    shippinAddress.state = shippingState._id;

                shippinAddress.country = item["BRANCH SHIPPING COUNTRY"];
                job.shippingAddress = {};
                job.shippingAddress.address = shippinAddress;
                timingVistit.timingFrom = item["BRANCH BEST TIME FROM"];
                timingVistit.timingEnd = item["BRANCH BEST TIME TO"];
                job.timingVistit = timingVistit;
                timingWork.days = item["BRANCH  WORK TIMINGS DAYS"];
                timingWork.timingTo = item["BRANCH  WORK TIMINGS FROM"];
                timingWork.timingEnds = item["BRANCH  WORK TIMINGS TO"];
                job.timingWork = timingWork;
                job.frequencyType = item["BRANCH FREQUENCY TYPE"];
                job.frequencyCall = item["BRANCH FREQUENCY CALL"];
                hospitalBusinessDetails.push(job);
            }else {
                throw new Error("Station:"+item["STATION"] +" Does not Exist")
            }
        })
        SmtCompaniesCustomer.audit={};
        SmtCompaniesCustomer.personalDetails = personalDetails
        SmtCompaniesCustomer.hospitalPrimaryDetails = hospitalPrimaryDetails;
        SmtCompaniesCustomer.hospitalBusinessDetails = hospitalBusinessDetails;
        //console.log(SmtCompaniesCustomer)
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        insertStatus("SUCCESS",items[0]["SLID"],companyId,divisionId,customerType,filePath);
        //console.log(SmtCollections.SmtCompaniesCustomer.find().fetch())
        }catch(err){
            insertStatus("FAILED",items[0]["SLID"],companyId,divisionId,customerType,filePath,err)
        }
    })
}