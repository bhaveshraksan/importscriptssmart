// var csvjson = Npm.require('csvjson');
var Converter = Npm.require("csvtojson").Converter;
var fs = Npm.require('fs');
var Fiber = Npm.require('fibers');

/*
Meteor.startup(function () {
    var customers = SmtCollections.SmtCompaniesCustomer.find().fetch();
    _.each(customers, function (val, index) {
        if (val && val._id && val.jobDetails) {
            _.each(val.jobDetails, function (val2, index2) {
                val2.isActive = true;
            });
            SmtCollections.SmtCompaniesCustomer.update({_id: val._id}, {
                $set: {
                    jobDetails: val.jobDetails,
                    isActive: val.isActive
                }
            })
        } else if (val && val._id && val.hospitalBusinessDetails) {
            _.each(val.hospitalBusinessDetails, function (val2, index2) {
                val2.isActive = true;
            })
            SmtCollections.SmtCompaniesCustomer.update({_id: val._id}, {
                $set: {
                    hospitalBusinessDetails: val.hospitalBusinessDetails,
                    isActive: val.isActive
                }
            })
        }
    })
})
*/
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
    "processData": function (fileData, context)
    {
        var converter = new Converter({});
        converter.fromString(fileData, Meteor.bindEnvironment(function(err,result){
            if(err)
                return err;

            else {
                processData(result, context);
            }
        }));
    }
})

function processData(list, context) {
    var arr = [];
    _.map(_.groupBy(list,function(doc){
        return doc.SLID;
    }),function(grouped){
        arr.push(grouped);
        return grouped;
    });
    var alias = SmtCollections.SmtCompanyCustomersAlias.findOne({_id:context.customerTypeId})
    if(alias.code == "DOCTOR")
        saveDoctorData(arr, context.companyId,context.divisionId, context.customerTypeId);

    else if (alias.code == "CHEMIST")
        saveChemistData(arr, context.companyId,context.divisionId, context.customerTypeId)
    else if(alias.code=="STOCKIST"){
        saveStockistData(arr, context.companyId,context.divisionId,context.customerTypeId)
    }else if(alias.code=="HOSPITAL"){
        saveHospitalData(arr, context.companyId,context.divisionId,context.customerTypeId)
    }else if(alias.code=="INSTITUTE"){
        saveInstituteData(arr, context.companyId,context.divisionId,context.customerTypeId)
    }
}

function saveDoctorData(list, companyId,divisionId, customerType) {
    _.each(list, function (items) {
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
        if(items[0]["DATE OF BIRTH"] != ""){
            var dob = moment(items[0]["DATE OF BIRTH"].replace(new RegExp("/","g"),"-"),"DD-MM-YYYY").format("YYYY-MM-DD")
            personalDetails.dateOfBirth = new Date(dob);
        }
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

        var qualification = SmtCollections.SmtCustomerQualification.findOne({type:items[0]["QUALIFICATION"]});
        if(qualification)
            personalDetails.qualification = qualification._id;

        var specialisation = SmtCollections.SmtCustomerSpecialization.findOne({type:items[0]["SPECIALIZATION"]});
        if(specialisation)
        personalDetails.specialisation = [specialisation._id];
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
                console.error("Station:"+item["STATION"] +"Does not Exist")
            }
        })
        SmtCompaniesCustomer.audit={};
        SmtCompaniesCustomer.personalDetails = personalDetails;
        SmtCompaniesCustomer.jobDetails      = jobDetails;
        //console.log(SmtCompaniesCustomer)
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        //console.log(SmtCollections.SmtCompaniesCustomer.find().fetch())
    })
}

function saveChemistData(list, companyId,divisionId,customerType) {
    _.each(list, function (items) {
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
                console.error("Station:"+item["STATION"] +"Does not Exist")
            }
        })
        //SmtCompaniesCustomer.audit={};
        SmtCompaniesCustomer.personalDetails = personalDetails;
        SmtCompaniesCustomer.chemistPersonalDetails = chemistPersonalDetails;
        SmtCompaniesCustomer.jobDetails      = jobDetails;
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        //console.log(SmtCompaniesCustomer)
    })
}
function saveStockistData(list, companyId,divisionId,customerType) {
    _.each(list, function (items) {
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
                job.isActive = true;
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
                console.error("HEADQUARTER: "+item["HEADQUARTER"]+" Does not Exist")
            }
        })
        SmtCompaniesCustomer.audit = {};
        SmtCompaniesCustomer.personalDetails = personalDetails;
        SmtCompaniesCustomer.stockistPrimaryDetails = stockistPrimaryDetails;
        SmtCompaniesCustomer.jobDetails      = jobDetails;
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        //console.log(SmtCompaniesCustomer)
    })
}
function saveHospitalData(list, companyId,divisionId, customerType) {
    _.each(list, function (items) {
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
                job.isActive = true;
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
                console.error("Station:"+item["STATION"] +"Does not Exist")
            }
        })
        SmtCompaniesCustomer.audit={};
        SmtCompaniesCustomer.personalDetails = personalDetails
        SmtCompaniesCustomer.hospitalPrimaryDetails = hospitalPrimaryDetails;
        SmtCompaniesCustomer.hospitalBusinessDetails = hospitalBusinessDetails;
        //console.log(SmtCompaniesCustomer)
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        //console.log(SmtCollections.SmtCompaniesCustomer.find().fetch())
    })
}
function saveInstituteData(list, companyId,divisionId, customerType) {
    _.each(list, function (items) {
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
                job.isActive = true;
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
                console.error("Station:"+item["STATION"] +"Does not Exist")
            }
        })
        SmtCompaniesCustomer.audit={};
        SmtCompaniesCustomer.personalDetails = personalDetails
        SmtCompaniesCustomer.hospitalPrimaryDetails = hospitalPrimaryDetails;
        SmtCompaniesCustomer.hospitalBusinessDetails = hospitalBusinessDetails;
        //console.log(SmtCompaniesCustomer)
        SmtCollections.SmtCompaniesCustomer.insert(SmtCompaniesCustomer);
        //console.log(SmtCollections.SmtCompaniesCustomer.find().fetch())
    })
}