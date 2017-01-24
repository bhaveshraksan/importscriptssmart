var SmtCompanyLocations = new Mongo.Collection("smtCompanyLocations");
var SmtCompanyLocationSchema = new SimpleSchema({
    countryId:{
        type: String
    },
    companyId: {
        type: String
    },
    locationType: {
        type: String
    },
    locationName:{
        type: String
    },
    description: {
        type: String,
        optional: true
    },
    companyDivisionId: {
        type: String,
    },
    parentLocations:{
        type: [Object],
        optional: true
    },
    "parentLocations.$.id": {
        type: String,
        autoValue: function () {
            if(!this.isSet){
                return Random.id()
            }
        }
    },
    "parentLocations.$.code": {
        type: String,
        optional: true
    },
    "parentLocations.$.locationId": {
        type: String,
        optional: true
    },
    divisionId:{
      type: String,
        optional: true
    },
    zoneId:{
        type: String,
        optional: true
    },
    regionId:{
        type: String,
        optional: true
    },
    areaId:{
        type: String,
        optional: true
    },
    headquarterId:{
        type: String,
        optional: true
    },
    additionalAllowance:{
        type: Boolean,
        optional: true
    },
    latitude:{
        type: String,
        optional: true
    },
    longitude:{
        type: String,
        optional: true
    },
    stationsDetail: {
      type: Object,
      optional: true
    },
    "stationsDetail.stationType": {
        type: String,
        optional: true
    },
    isActive: {
        type: Boolean
    },
    audit:{
        type: SmtSchemas.SmtAuditSchema
    },
    companyDivisionId: {
        type: String,
    },
    sourceStation:{
        type: String,
        optional : true
    }
});

SmtCollections.SmtCompanyLocations = SmtCompanyLocations;
SmtCollections.SmtCompanyLocations.attachSchema(SmtCompanyLocationSchema);