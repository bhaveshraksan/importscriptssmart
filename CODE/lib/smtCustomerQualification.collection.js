var SmtCustomerQualification = new Mongo.Collection("smtCustomerQualification");

var SmtCustomerQualificationSchema = new SimpleSchema({
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
SmtSchemas.SmtCustomerQualificationSchema = SmtCustomerQualificationSchema;
SmtCollections.SmtCustomerQualification = SmtCustomerQualification;
SmtCollections.SmtCustomerQualification.attachSchema(SmtSchemas.SmtCustomerQualificationSchema);