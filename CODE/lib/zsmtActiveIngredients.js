var SmtActiveIngredientsSchema = new SimpleSchema({
    id:{
      type: String,
      autoValue: function () {
          if(!this.isSet){
              return Random.id()
          }
      }
    },
    name:{
      type: String,
        optional: true,
    },
    basisOfStrength: {
        type: String,
        optional: true,
    },
    strength:{
        type: String,
        optional: true,
    }
});

var SmtInActiveIngredientsSchema = new SimpleSchema({
    id:{
        type: String,
        autoValue: function () {
            if(!this.isSet){
                return Random.id()
            }
        }
    },
    name:{
        type: String,
        optional: true,
    },
    strength:{
        type: String,
        optional: true,
    }
});
SmtSchemas.SmtActiveIngredientsSchema = SmtActiveIngredientsSchema;
SmtSchemas.SmtInActiveIngredientsSchema = SmtInActiveIngredientsSchema;