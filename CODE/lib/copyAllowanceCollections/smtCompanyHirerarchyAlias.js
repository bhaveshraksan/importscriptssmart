var SmtCompanyHierarchyAlias = new Mongo.Collection("smtCompanyHierarchyAlias");
var SmtCompanyHierarchyAliasSchema = new SimpleSchema({
    isActive: {
        type: Boolean,
        autoValue: function () {
            if(!this.isSet && (this.isInsert || this.isUpsert)){
                return false;
            }
        }
    },
    companyId:{
        type: String
    },
    companyDivisionId:{
        type: String
    },
    departmentId:{
        type: String,
        optional:true
    },
    subDepartmentId:{
        type: String,
        optional:true
    },
    fileId:{
        type: String
    },
    landingPage:{
        type:[String],
        optional:true
    },
    companyHierarchyStructure:{
        type:[SmtSchemas.SmtCompanyHierarchyStructureSchema]
    },
    "companyHierarchyStructure.$.roleName":{
        type: String,
        optional:true
    },
    "companyHierarchyStructure.$.roleShortName":{
        type: String,
        optional:true
    },
    audit:{
        blackbox:true,
        type: Object
    }
});
SmtCollections.SmtCompanyHierarchyAlias = SmtCompanyHierarchyAlias;

SmtSchemas.SmtCompanyHierarchyAliasSchema = SmtCompanyHierarchyAliasSchema;
SmtCollections.SmtCompanyHierarchyAlias.attachSchema(SmtSchemas.SmtCompanyHierarchyAliasSchema);