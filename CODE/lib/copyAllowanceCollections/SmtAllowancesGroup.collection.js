var SmtAllowancesGroup = new Mongo.Collection("smtAllowancesGroup");

var SmtAllowancesRoleBasedValues = new SimpleSchema({
    roleCode:{
        type : String,
        optional : true
    },
    allowedSts:{    // STANDARD, ACTUALS
        type : String,
        optional : true
    },
    value : {
        type : String,
        optional : true
    },
    isActive:{
        type: Boolean,
        optional : true,
        defaultValue : false
    }
});

SmtSchemas.SmtAllowancesRoleBasedValues = SmtAllowancesRoleBasedValues;

var SmtLocationAllowanceValuesSettings = new SimpleSchema({
    value : {
        type : String,
        optional : true
    },
    isActive:{
        type: Boolean,
        optional : true,
        defaultValue : true
    },
    "roleBasedSettings":{
        type: Object,
        optional : true
    },
    "roleBasedSettings.isRoleBased":{
        type: Boolean,
        optional : true,
        defaultValue : false
    },
    "roleBasedSettings.roleBasedValues":{
        type: [SmtSchemas.SmtAllowancesRoleBasedValues],
        optional : true,
    }
});

SmtSchemas.SmtLocationAllowanceValuesSettings = SmtLocationAllowanceValuesSettings;

var StationTypeAllowanceGroup = new SimpleSchema({
    stationTypeIds:{
        type:[String],
        optional:true
    },
    "list": {
        type : [Object],
        optional : true
    },
    "list.$.allowanceTypeId":{
        type : String,
        optional : true
    },
    "list.$.isActive":{
        type : Boolean,
        optional : true,
        defaultValue : true
    },
    "list.$.isDeleted":{
        type : Boolean,
        optional : true,
        defaultValue : false
    },
    "list.$.sameStationTravel":{
        type: SmtSchemas.SmtLocationAllowanceValuesSettings,
        optional : true
    },
    "list.$.otherStationsTravel":{
        type: SmtSchemas.SmtLocationAllowanceValuesSettings,
        optional : true
    }
});

SmtSchemas.StationTypeAllowanceGroup = StationTypeAllowanceGroup;

var SmtAllowancesGroupSchema = new SimpleSchema({
    companyId:{
        type:String
    },
    companyDivisionId:{
        type:String
    },
    name:{
        type: String,
        optional: false
    },
    displayName:{
        type: String,
        optional: true
    },
    description:{
        type: String,
        optional: true
    },
    isActive:{
        type: Boolean,
        index:1,
        defaultValue : false
    },
    allowanceTypesList:{
        type : [String],
        optional : true
    },
    stationTypeSettings:{
        type:[SmtSchemas.StationTypeAllowanceGroup],
        optional:true
    },
    startDate:{
        type: Date,
        optional : true
    },
    endDate:{
        type: Date,
        optional : true
    },
    audit:{
        blackbox:true,
        type: Object
    }
});
SmtSchemas.SmtAllowancesGroupSchema = SmtAllowancesGroupSchema;
SmtCollections.SmtAllowancesGroup = SmtAllowancesGroup;
SmtCollections.SmtAllowancesGroup.attachSchema(SmtSchemas.SmtAllowancesGroupSchema);