var SmtCustomerLineOfPractice = new Mongo.Collection("smtCustomerLineOfPractice");

var SmtCustomerLineOfPracticeSchema = new SimpleSchema({
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
       type: String,
    },
    divisionId:{
        type: String
    },
    audit:{
        type: SmtSchemas.SmtAuditSchema
    }
});
SmtSchemas.SmtCustomerLineOfPracticeSchema = SmtCustomerLineOfPracticeSchema;
SmtCollections.SmtCustomerLineOfPractice = SmtCustomerLineOfPractice;
SmtCollections.SmtCustomerLineOfPractice.attachSchema(SmtSchemas.SmtCustomerLineOfPracticeSchema);

