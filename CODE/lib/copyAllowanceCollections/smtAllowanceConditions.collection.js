var SmtAllowanceConditions = new Mongo.Collection("smtAllowanceConditions");

var SmtAllowanceConditionsListSchema = new SimpleSchema({
    "da":{
        type: String,
        optional:true
    },
    "ta":{
        type: String,
        optional:true
    },
    "overnight":{
        type: Boolean,
        defaultValue: false
    },
    "conditions":{
        type: [Object],
        optional:true
    },
    "conditions.$.sourceId":{
        type: String,
        optional:true
    },
    "conditions.$.destinationId":{
        type: String,
        optional:true
    },
    "conditions.$.fieldType":{
        type: String,
        optional:true
    },
    "conditions.$.travelType":{
        type: String,
        optional:true
    }
});

SmtSchemas.SmtAllowanceConditionsListSchema= SmtAllowanceConditionsListSchema;

var SmtAllowanceConditionsSchema=new SimpleSchema({
    companyId:{
        type: String,
        optional:false
    },
    companyDivisionId:{
        type: String,
        optional:false
    },
    role:{
        type: [String],
        optional:false
    },
    name:{
        type: String,
        optional:false
    },
    displayName:{
        type: String,
        optional:true
    },
    description:{
        type: String,
        optional:true
    },
    departmentId:{
        type: String,
        optional:true
    },
    subDepartmentId:{
        type: String,
        optional:true
    },
    allowanceId:{
        type: String,
        optional : false
    },
    allowanceTypesSettings:{
        type: [Object],
        optional:true
    },
    "allowanceTypesSettings.$.allowanceTypeId":{
        type: String,
        optional:true
    },
    "allowanceTypesSettings.$.allowedStatus":{
        type: String,
        optional:true
    },
    allowanceConditions:{
      type: [SmtSchemas.SmtAllowanceConditionsListSchema],
        //blackbox: true
    },
    isActive:{
        type: Boolean,
        index:1,
        autoValue:function(){
            if(!this.isSet && (this.isInsert || this.isUpsert)){
                return false;
            }
        }
    },
    audit:{
        blackbox:true,
        type: Object
    }
});

SmtSchemas.SmtAllowanceConditionsSchema = SmtAllowanceConditionsSchema;
SmtCollections.SmtAllowanceConditions = SmtAllowanceConditions;

SmtCollections.SmtAllowanceConditions.attachSchema(SmtSchemas.SmtAllowanceConditionsSchema);