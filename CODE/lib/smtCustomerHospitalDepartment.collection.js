var SmtCustomerHospitalDepartment = new Mongo.Collection("smtCustomerHospitalDepartment");

var SmtCustomerHospitalDepartmentSchema = new SimpleSchema({
    type:{
        type: String,
    },
    description:{
        type: String,
    },
    isActive: {
        type: Boolean,
        autoValue:function(){
            if(!this.isSet){
                return false
            }
        }
    },
    companyId:{
      type: String  
    },
    divisionId:{
        type: String
    },
    audit:{
        type: SmtSchemas.SmtAuditSchema
    }
});
SmtSchemas.SmtCustomerHospitalDepartmentSchema = SmtCustomerHospitalDepartmentSchema;
SmtCollections.SmtCustomerHospitalDepartment = SmtCustomerHospitalDepartment;
SmtCollections.SmtCustomerHospitalDepartment.attachSchema(SmtSchemas.SmtCustomerHospitalDepartmentSchema);
