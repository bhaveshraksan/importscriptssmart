var SmtCompanyHierarchy = new Mongo.Collection("smtCompanyHierarchy");
SmtCollections.SmtCompanyHierarchy = SmtCompanyHierarchy;

var SmtCompanyHierarchyStructureSchema = new SimpleSchema({
    id:{
        type: String,
        autoValue:function () {
            if(!this.isSet){
                return Random.id();
            }
        }
    },
    code:{
        type: String,
        index:false
    },
    name:{
        type: String,
        optional: true
    },
    parentNodes:{
        type: [String],
        optional: true
    },
    childrenNodes:{
        type: [String],
        optional: true
    },
    noOfChildrens:{
        type: Number,
        autoValue:function (){
            if(this.siblingField("childrenNodes") && this.siblingField("childrenNodes").isSet && this.siblingField("childrenNodes").value){
                return this.siblingField("childrenNodes").value.length;
            }else{
                return 0;
            }
        }
    },
    isActive: {
        type: Boolean,
        autoValue:function (){
            if(!this.isSet && (this.isInsert || this.isUpsert)){
                return false;
            }
        }
    }
});
SmtSchemas.SmtCompanyHierarchyStructureSchema = SmtCompanyHierarchyStructureSchema;
var SmtCompanyHierarchySchema = new SimpleSchema({
    isActive: {
        type: Boolean,
        autoValue: function () {
            if(!this.isSet && (this.isInsert || this.isUpsert)){
                return false;
            }
        }
    },
    departmentId:{
        type: String,
        optional:true
    },
    subDepartmentId:{
        type: String,
        optional:true
    },
    companyHierarchyStructure:{
        type:[SmtSchemas.SmtCompanyHierarchyStructureSchema]
    },
    audit:{
        blackbox:true,
        type: Object
    }
});
SmtSchemas.SmtCompanyHierarchySchema = SmtCompanyHierarchySchema;
SmtCollections.SmtCompanyHierarchy.attachSchema(SmtSchemas.SmtCompanyHierarchySchema);
