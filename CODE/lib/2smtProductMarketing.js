var SmtProductMarketingSchema = new SimpleSchema({
    id:{
      type: String,
      autoValue: function () {
          if(!this.isSet){
              return Random.id();
          }
      }
    },
    categoryId:{
        type: String,
        optional: true,
    },
    startDate: {
        type: Date,
        optional: true,
    },
    endDate:{
        type: Date,
        optional: true,
    }
});
SmtSchemas.SmtProductMarketingSchema = SmtProductMarketingSchema;