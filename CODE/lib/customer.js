var SmtCompaniesCustomer =new Mongo.Collection("smtCompaniesCustomer");
var SmtCompanies = new Mongo.Collection("smtCompanies");
SmtCollections.SmtCompanies = SmtCompanies;
var SmtCompaniesDivision = new Mongo.Collection("smtCompaniesDivison");
SmtCollections.SmtCompaniesDivision = SmtCompaniesDivision;
var SmtCompanyCustomersAlias = new Mongo.Collection("smtCompanyCustomersAlias");
SmtCollections.SmtCompanyCustomersAlias = SmtCompanyCustomersAlias;
var SmtCompaniesCustomerSchema = new SimpleSchema({
    companyId: {
        type: String,
        optional: true
    },
    countryId: {
        type: String,
        optional: true
    },
    customerTypeId: {
        type: String,
    },
    isAdHoc:{
        type:Boolean,
        optional:true,
        defaultValue:false
    },
    /*stationId:{
     type:String,
     optional:true
     },*/
    customerType: {
        type: String,
        optional: true
    },
    customerImage:{
        type: String,
        optional: true
    },
    isActive: {
        type: Boolean,
        defaultValue:true,
    },
    reason: {
        type: String,
        optional: true
    },
    audit: {
        type: SmtSchemas.SmtAuditSchema
    },
    divisionId:{
        type: String,
    },
    personalDetails: {
        type: Object
    },
    "personalDetails.smartId": {
        type: String,

    },
    "personalDetails.slId":{
        type: String,
        optional: true
    },
    "personalDetails.oldMslid":{
        type: String,
        optional: true
    },
    "personalDetails.name": {
        type: String,
    },
    "personalDetails.middleName":{
        type: String,
        optional: true
    },
    "personalDetails.lastName":{
        type: String,
        optional: true
    },

    "personalDetails.dateOfBirth": {
        type: Date,
        optional: true

    },
    "personalDetails.bloodGroup": {
        type: String,
        optional: true

    },
    "personalDetails.language": {
        type: String,
        optional: true

    },
    "personalDetails.gender": {
        type: String,
        optional: true
    },
    "personalDetails.maritalStatus": {
        type: String,
        optional: true
    },
    "personalDetails.anniversayDate": {
        type: String,
        optional: true
    },
    "personalDetails.opdField": {
        type: String,
        optional: true
    },
    "personDetails.contactDetails": {
        type: [Object],
        optional: true

    },
    "personalDetails.contactDetails.$.mobileNo": {
        type: String,
        optional: true
    },
    "personalDetails.contactDetails.$.landlineNo": {
        type: String,
        optional: true
    },
    "personalDetails.contactDetails.$.fax": {
        type: String,
        optional: true
    },
    "personalDetails.email": {
        type: [String],
        optional: true
    },
    "personalDetails.socialLinks": {
        type: [SmtSchemas.SmtSocialLinksSchema],
        optional: true
    },

    "personalDetails.regNo": {
        type: String,
        optional: true

    },
    "personalDetails.designation": {
        type: String,
        optional: true

    },

    "personalDetails.specialisation": {
        type: [String],
        optional: true

    },
    "personalDetails.qualification": {
        type: String,
        optional: true

    },
    "personalDetails.lineOfPractise": {
        type: String,
        optional: true

    },
    "personalDetails.practiseStartDate": {
        type: Date,
        optional: true

    },
    "personalDetails.experience": {
        type: String,
        optional: true
    },
    "personalDetails.address": {
        type: SmtSchemas.SmtAddressSchema,
        optional: true
    },
    "personalDetails.category": {
        type: String,
        optional: true
    },
    "personalDetails.type": {
        type: String,
        optional: true
    },

    jobDetails: {
        type: [Object],
        optional: true
    },
    "jobDetails.$.branchImage": {
        type: String,
        optional: true

    },
    "jobDetails.$.stationId": {
        type: String,
        optional: true

    },
    "jobDetails.$.id": {
        type: String,
        autoValue: function () {
            if (!this.isSet) {
                return Random.id();
            }
        }

    },
    "jobDetails.$.headquarterId":{
        type: String,
        optional:true// its not necessay so no need to create the auto value of random id
        // autoValue: function () {
        //     if (!this.isSet) {
        //         return Random.id();
        //     }
        // }
    },
    "jobDetails.$.isActive":{
        type: Boolean,
        autoValue: function () {
            if (!this.isSet) {
                return false
            }
        }

    },
    "jobDetails.$.opd":{
        type: Boolean,
        autoValue: function () {
            if (!this.isSet) {
                return false
            }
        }

    },
    "jobDetails.$.sharePercentage": {
        type: String,
        optional: true
    },
    "jobDetails.$.businessPotential": {
        type: String,
        optional: true
    },
    "jobDetails.$.regisNo": {
        type: String,
        optional: true
    },
    "jobDetails.$.jobPlaceName": {
        type: String,
        optional: true
    },
    "jobDetails.$.website": {
        type: String,
        optional: true
    },
    "jobDetails.$.associatedProducts": {
        type: [String],
        optional: true

    },
    "jobDetails.$.description": {
        type: String,
        optional: true
    },
    "jobDetails.$.drugLicenseNo": {
        type: String,
        optional: true
    },
    "jobDetails.$.vat": {
        type: String,
        optional: true
    },
    "jobDetails.$.cst": {
        type: String,
        optional: true
    },
    "jobDetails.$.tinRegisNo": {
        type: String,
        optional: true
    },
    "jobDetails.$.address": {
        type: SmtSchemas.SmtAddressSchema,
        optional: true
    },

    "jobDetails.$.shippingAddress": {
        type: SmtSchemas.SmtAddressSchema,
        optional: true
    },
    "jobDetails.$.shipCheck":{
        type: Boolean,
        optional: true

    },
    "jobDetails.$.mobileNo": {
        type: String,
        optional: true
    },
    "jobDetails.$.landlineNo": {
        type: String,
        optional: true
    },
    "jobDetails.$.faxNo": {
        type: String,
        optional: true
    },
    "jobDetails.$.timingVistit": {
        type: Object,
        optional: true
    },
    "jobDetails.$.timingVisit.timingFrom": {
        type: String,
        optional: true
    },
    "jobDetails.$.timingVisit.timingEnd": {
        type: String,
        optional: true
    },
    "jobDetails.$.timingWork": {
        type: [Object],
        optional: true
    },
    "jobDetails.$.timingWork.$.days": {
        type: String,
        optional: true
    },
    "jobDetails.$.timingWork.$.timingTo": {
        type: String,
        optional: true
    },
    "jobDetails.$.timingWork.$.timingEnds": {
        type: String,
        optional: true
    },
    "jobDetails.$.frequencyType": {
        type: String,
        optional: true
    },
    "jobDetails.$.frequencyCall": {
        type: Number,
        optional: true
    },
    "jobDetails.$.modeOfPayment": {
        type: String,
        optional: true
    },
    "jobDetails.$.durationOfPay": {
        type: String,
        optional: true
    },
    "jobDetails.$.daysApplicable": {
        type: String,
        optional: true
    },
    "jobDetails.$.category": {
        type: String,
        optional: true
    },"jobDetails.$.type": {
        type: String,
        optional: true
    },
    "jobDetails.$.associatedStockist": {
        type: [String],
        optional: true
    },
    "jobDetails.$.associatedChemist": {
        type: [String],
        optional: true
    },
    "jobDetails.$.associatedDoctor": {
        type: [String],
        optional: true
    },
    chemistPersonalDetails: {
        type: Object,
        optional: true
    },
    "chemistPersonalDetails.contactNo": {
        type: String,
        optional: true
    },
    "chemistPersonalDetails.shortName": {
        type: String,
        optional: true
    },
    "chemistPersonalDetails.establishedYear": {
        type: String,
        optional: true
    },
    "chemistPersonalDetails.registrationNo": {
        type: String,
        optional: true
    },
    "chemistPersonalDetails.pharmacyType": {
        type: String,
        optional: true
    },
    "chemistPersonalDetails.pharmacyCategory": {
        type: String,
        optional: true
    },
    "chemistPersonalDetails.owner": {
        type: Object,
        optional: true
    },
    "chemistPersonalDetails.owner.name": {
        type: String,
        optional: true
    },
    "chemistPersonalDetails.owner.owncontactNo": {
        type: String,
        optional: true
    },
    "chemistPersonalDetails.owner.ownemailId": {
        type: String,
        optional: true
    },
    "chemistPersonalDetails.owner.ownAddress": {
        type: String,
        optional: true
    },
    "chemistPersonalDetails.socialLinks": {
        type: [SmtSchemas.SmtSocialLinksSchema],
        optional: true
    },
    hospitalPrimaryDetails: {
        type: Object,
        optional: true
    },

    "hospitalPrimaryDetails.shortName":{
        type:String,
        optional:true
    },
    "hospitalPrimaryDetails.speciality":{
        type:String, //// need to be an array
        optional:true
    },
    "hospitalPrimaryDetails.establishedYear": {
        type: String,
        optional: true
    },
    "hospitalPrimaryDetails.registrationNumber":{
        type:String,
        optional:true
    },
    "hospitalPrimaryDetails.registrationDate":{
        type:Date,
        optional:true
    },
    "hospitalPrimaryDetails.certificateId":{
        type:String,
        optional:true
    },
    "hospitalPrimaryDetails.ISO":{
        type:String,
        optional:true
    },
    "hospitalPrimaryDetails.hospitalType":{
        type:String,
        optional:true
    },
    "hospitalPrimaryDetails.hospitalCategory":{
        type:String,
        optional:true
    },
    "hospitalPrimaryDetails.ownerName":{
        type:String,
        optional:true
    },
    "hospitalPrimaryDetails.ownerContactNo":{
        type:[String],
        optional:true
    },
    "hospitalPrimaryDetails.ownerEmailId":{
        type:[String],
        optional:true
    },
    "hospitalPrimaryDetails.ownerAddress":{
        type:[String],
        optional:true
    },
    "hospitalPrimaryDetails.website":{
        type:String,
        optional:true
    },
    hospitalBusinessDetails:{
        type :[Object],
        optional: true
    },
    "hospitalBusinessDetails.$.id": {
        type: String,
        autoValue: function () {
            if (!this.isSet) {
                return Random.id();
            }
        }

    },
    "hospitalBusinessDetails.$.stationId":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.headquarterId":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.branchImage": {
        type: String,
        optional: true

    },
    "hospitalBusinessDetails.$.opd":{
        type: Boolean,
        autoValue: function () {
            if (!this.isSet) {
                return false
            }
        }

    },
    "hospitalBusinessDetails.$.isActive":{
        type: Boolean,
        autoValue: function () {
            if (!this.isSet) {
                return false
            }
        }

    },
    "hospitalBusinessDetails.$.numberOfBeds":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.incorporationDate":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.branchType":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.branchName":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.branchRegistrationNo":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.branchRegistrationDate":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.branchAddress":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.description":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.branchEmailId":{
        type:[String],
        optional:true
    },
    "hospitalBusinessDetails.$.branchContactNo":{
        type:[String],
        optional:true
    },
    "hospitalBusinessDetails.$.branchFaxNo":{
        type:[String],
        optional:true
    },
    "hospitalBusinessDetails.$.branchPerson":{
        type:Object,
        optional:true
    },
    "hospitalBusinessDetails.$.branchPerson.name":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.branchPerson.phoneNo":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.branchPerson.emailId":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.departmentId":{
        type:[String],
        optional:true
    },
    "hospitalBusinessDetails.$.associatedStockist":{
        type:[String],
        optional:true
    },
    "hospitalBusinessDetails.$.latitude":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.longitude":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.hospitalType":{
        type:String,
        optional:true
    },
    "hospitalBusinessDetails.$.socialLinks":{
        type: [SmtSchemas.SmtSocialLinksSchema],
        optional: true
    },
    "hospitalBusinessDetails.$.timingVistit": {
        type: Object,
        optional: true
    },
    "hospitalBusinessDetails.$.timingVisit.timingFrom": {
        type: String,
        optional: true
    },
    "hospitalBusinessDetails.$.timingVisit.timingEnd": {
        type: String,
        optional: true
    },
    "hospitalBusinessDetails.$.timingWork": {
        type: [Object],
        optional: true
    },
    "hospitalBusinessDetails.$.timingWork.$.days": {
        type: String,
        optional: true
    },
    "hospitalBusinessDetails.$.timingWork.$.timingTo": {
        type: String,
        optional: true
    },
    "hospitalBusinessDetails.$.timingWork.$.timingEnds": {
        type: String,
        optional: true
    },
    "hospitalBusinessDetails.$.frequencyType": {
        type: String,
        optional: true
    },
    "hospitalBusinessDetails.$.frequencyCall": {
        type: String,
        optional: true
    },
    "hospitalBusinessDetails.$.modeOfPayment": {
        type: String,
        optional: true
    },
    "hospitalBusinessDetails.$.durationOfPay": {
        type: String,
        optional: true
    },
    "hospitalBusinessDetails.$.modeOfPurchase": {
        type: String,
        optional: true
    },
    "hospitalBusinessDetails.$.purchaseInCharge": {
        type: String,
        optional: true
    },
    "hospitalBusinessDetails.$.typeOfPurchase": {
        type: String,
        optional: true
    },
    "hospitalBusinessDetails.$.daysApplicable": {
        type: String,
        optional: true
    },
    "hospitalBusinessDetails.$.address": {
        type: SmtSchemas.SmtAddressSchema,
        optional: true
    },
    "hospitalBusinessDetails.$.shipCheck":{
        type: Boolean,
        optional: true

    },
    "hospitalBusinessDetails.$.shippingAddress": {
        type: SmtSchemas.SmtAddressSchema,
        optional: true
    },

    cfAgentPrimaryDetails:{
        type:Object,
        optional:true
    },
    "cfAgentPrimaryDetails.smartId":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.fullName":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.shortName":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.licenseNo":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.vat": {
        type: String,
        optional: true
    },
    "cfAgentPrimaryDetails.cst": {
        type: String,
        optional: true
    },
    "cfAgentPrimaryDetails.tinRegisNo": {
        type: String,
        optional: true
    },
    "cfAgentPrimaryDetails.msit":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.establishedYear":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.registrationNo":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.cAndfType":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.cAndfCategory":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.registrationDate":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.certificateId":{
        type:String,
        optional:true
    } ,
    "cfAgentPrimaryDetails.dateofBirth":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.socialLinks":{
        type: [SmtSchemas.SmtSocialLinksSchema],
        optional:true
    },
    "cfAgentPrimaryDetails.contactDetails":{
        type:[Object],
        optional:true
    },
    "cfAgentPrimaryDetails.contactDetails.$.mobileNo":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.contactDetails.$.landlineNo":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.contactDetails.$.faxNo":{
        type:String,
        optional:true
    },
    "cfAgentPrimaryDetails.email":{
        type:[String],
        optional:true
    },
    "cfAgentPrimaryDetails.address": {
        type: [SmtSchemas.SmtAddressSchema],
        optional: true
    },
    stockistPrimaryDetails:{
        type: Object,
        optional: true
    },
    "stockistPrimaryDetails.certificationId":{
        type: String,
        optional: true
    },
    "stockistPrimaryDetails.stockistTye":{
        type: String,
        optional: true
    },

    "stockistPrimaryDetails.stockistCategory":{
        type: String,
        optional: true
    },
    "stockistPrimaryDetails.website":{
        type: String,
        optional: true
    },

    "stockistPrimaryDetails.ownerPersonNo":{
        type: [String],
        optional: true
    },
    "stockistPrimaryDetails.ownerPersonEmail":{
        type: [String],
        optional: true
    },
    "stockistPrimaryDetails.socialLinks":{
        type: [SmtSchemas.SmtSocialLinksSchema],
        optional: true
    },
});

SmtSchemas.SmtCompaniesCustomerSchema = SmtCompaniesCustomerSchema;
SmtCollections.SmtCompaniesCustomer = SmtCompaniesCustomer;
SmtCollections.SmtCompaniesCustomer.attachSchema(SmtSchemas.SmtCompaniesCustomerSchema);

