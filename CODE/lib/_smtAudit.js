var SmtAuditSchema = new SimpleSchema({
    createdAt: {
        type: Date,
        autoValue: function () {
            if(this.isInsert || this.isUpsert){
                return new Date();
            }
        }
    },
    updatedAt:{
        type: Date,
        optional: true,
        autoValue: function () {
            if(this.isUpdate){
                return new Date();
            }
        }
    },
    createdBy:{
        type: String,
        optional: true,
        autoValue: function () {
            if(this.isClient && Meteor.user()){
                return Meteor.user().username;
            }
        }
    }
});
SmtSchemas.SmtAuditSchema = SmtAuditSchema;