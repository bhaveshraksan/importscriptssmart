var SmtAllowanceTypesAlias = new Mongo.Collection("smtAllowanceTypesAlias");
var SmtAllowanceTypesAliasSchema = new SimpleSchema({
    companyId:{
        type:String
    },
    companyDivisionId:{
        type:String
    },
    typeCode:{
        type: String,
        optional: false
    },
    typeName:{
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
    indicationFormat:{
        type: String,
        optional: true
    },
    indicationSource:{
        type: String,
        optional: true
    },
    isActive:{
        type: Boolean,
        defaultValue : false,
        index:1
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
    audit:{
        blackbox:true,
        type: Object
    }
});
SmtSchemas.SmtAllowanceTypesAliasSchema = SmtAllowanceTypesAliasSchema;
SmtCollections.SmtAllowanceTypesAlias = SmtAllowanceTypesAlias;
SmtCollections.SmtAllowanceTypesAlias.attachSchema(SmtSchemas.SmtAllowanceTypesAliasSchema);