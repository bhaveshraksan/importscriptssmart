var SmtCustomerTypes = new Mongo.Collection("smtCustomerTypes");

var SmtCustomerTypesSchema = new SimpleSchema({
    customerId:{
      type: String
    },
    type:{
        type: String
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
        type:String,
    },
    audit:{
        type: SmtSchemas.SmtAuditSchema
    }
});
SmtSchemas.SmtCustomerTypesSchema = SmtCustomerTypesSchema;
SmtCollections.SmtCustomerTypes = SmtCustomerTypes;
SmtCollections.SmtCustomerTypes.attachSchema(SmtSchemas.SmtCustomerTypesSchema);