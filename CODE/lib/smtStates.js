var SmtStates = new Mongo.Collection("smtStates");
var SmtStatesSchema = new SimpleSchema({
    countryId:{
        type: String
    },
    stateCode:{
        type: String,
        unique: true
    },
    name:{
        type: String
    },
    isActive:{
        type: Boolean,
        autoValue:function(){
            if(!this.isSet){
                return false
            }
        }
    },
    audit:{
        type: SmtSchemas.SmtAuditSchema
    }
})
SmtCollections.SmtStates = SmtStates;
SmtSchemas.SmtStatesSchema = SmtStatesSchema;
SmtCollections.SmtStates.attachSchema(SmtSchemas.SmtStatesSchema);