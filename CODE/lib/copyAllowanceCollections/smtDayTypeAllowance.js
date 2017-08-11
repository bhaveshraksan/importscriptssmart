var SmtDayTypeAllowance = new Mongo.Collection("smtDayTypeAllowance");
var SmtDayTypeAllowanceSchema = new SimpleSchema({
    companyId:{
        type: String,
    },
    divisionId:{
        type: String,
    },
    countryId:{
        type: String,
    },
    typeName:{
        type: String,
        optional:true
    },
    displayName:{
        type: String,
        optional:true
    },
    recordType:{
        type: String,
        optional:true
    },
    criteria:{
      type:[String],
        optional:true
    },
    type:{
        type: String,
    },
    isUserDefined:{
        type: Boolean,
        optional: true,
        defaultValue : true
    },
    dailyAllowanceApplicable:{
      type: Boolean,
      optional: true
    },
    travelAllowanceApplicable:{
        type: Boolean,
        optional: true
    },
    description:{
        type: String,
        optional:true,
    },
    indicationFormat:{
        type: String,
        optional: true
    },
    indicationSource:{
        type: String,
        optional: true
    },
    eligibleForAllowance:{
        type: Boolean,
        defaultValue:false
    },
    canAllowTourPlan:{
        type: Boolean,
        defaultValue:true
    },
    additionalSettings:{
        type:Object,
        optional:true
    },
    "additionalSettings.unitName":{
        type: String,
        optional:true,
        defaultValue:"RS"
    },
    "additionalSettings.frequency":{
        type: String,
        optional:true,
        defaultValue: "DAILY"
    },
    isActive:{
        type: Boolean,
        index:1,
        defaultValue:true
    },
    audit:{
        blackbox:true,
        type: Object
    },
/*    nightTransit:{
        type: Boolean,
        defaultValue : false
    },
    dayTransit:{
        type: Boolean,
        defaultValue : false
    },*/
    dayOvernight:{
        type: Boolean,
        defaultValue : false
    },
    stationTypes:{
        type: [String],
        optional:true,
    }
});
SmtSchemas.SmtDayTypeAllowanceSchema = SmtDayTypeAllowanceSchema;
SmtCollections.SmtDayTypeAllowance = SmtDayTypeAllowance;

SmtCollections.SmtDayTypeAllowance.attachSchema(SmtSchemas.SmtDayTypeAllowanceSchema);
