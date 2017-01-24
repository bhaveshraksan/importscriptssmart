var SmtCustomerSpecialization = new Mongo.Collection("smtCustomerSpecialization");

var SmtCustomerSpecializationSchema = new SimpleSchema({
    type:{
        type: String,
    },
    description: {
        type: String
    },
    qualificationId:{
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
SmtSchemas.SmtCustomerSpecializationSchema = SmtCustomerSpecializationSchema;
SmtCollections.SmtCustomerSpecialization = SmtCustomerSpecialization;
SmtCollections.SmtCustomerSpecialization.attachSchema(SmtSchemas.SmtCustomerSpecializationSchema);
