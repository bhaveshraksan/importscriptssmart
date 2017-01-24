var SmtSocialLinksSchema = new SimpleSchema({
    id:{
        type: String,
        autoValue:function () {
            if(!this.isSet){
                return Random.id();
            }
        }
    },
    name:{
        type: String
    },
    url:{
        type: String
    },
    image: {
        type: String,
        optional:true
    }

});
SmtSchemas.SmtSocialLinksSchema = SmtSocialLinksSchema;