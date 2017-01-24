var SmtProductLibrarySchema = new SimpleSchema({
    id:{
        type: String,
        optional: false,
        autoValue: function () {
            if(!this.isSet){
                return Random.id()
            }
        }
    },
    libraryId:{
        type: String,
        optional: false,
    },
    isActive:{
        type: String,
        optional: false,
    },
    type:{
        type: String,
        optional: false,
    },
});
SmtSchemas.SmtProductLibrarySchema = SmtProductLibrarySchema;