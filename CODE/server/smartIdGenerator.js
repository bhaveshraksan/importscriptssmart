smartIdGenService = (function() {
        SerialNo = new Mongo.Collection("serialNumbers");
        var smartId = SerialNo.findOne({_id:"smartId"});
        if(!smartId){
            SerialNo.insert({_id:"smartId", seq:0});
        }
        var appointmentId = SerialNo.findOne({_id:"appointmentId"});
        if(!appointmentId){
            SerialNo.insert({_id:"appointmentId", seq:0});
        }
        var meetingId = SerialNo.findOne({_id:"meetingId"});
        if(!meetingId){
            SerialNo.insert({_id:"meetingId", seq:0});
        }

        var jointWorkId=SerialNo.findOne({_id:"jointWorkId"});
        if(!jointWorkId){
            SerialNo.insert({_id:"jointWorkId",seq:0});
        }

        var hirerarchyFileId=SerialNo.findOne({_id:"fileHirerarchy"});
        if(!hirerarchyFileId){
            SerialNo.insert({_id:"fileHirerarchy",seq:0});
        }

        /*var companyWiseTransactionFileId=SerialNo.findOne({_id:"inventoryTransactionFileId","companyId":getCompany()});
        if(!companyWiseTransactionFileId){
            SerialNo.insert({_id:"inventoryTransactionFileId",seq:0,"companyId":getCompany()});
        }

        var companyWiseInventoryFileId=SerialNo.findOne({_id:"inventoryFileId","companyId":getCompany()});
        if(!companyWiseInventoryFileId){
            SerialNo.insert({_id:"inventoryFileId",seq:0,"companyId":getCompany()});
        }*/



    function getNextSequence(name) {
        var ret = SerialNo.findOne({ _id: name });
        ret.seq = ret.seq + 1;
        SerialNo.update({ _id: name },{$set:{seq:ret.seq}});
        return ret.seq;
    }
    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    return {
        smartId: function (br) {
            br.smartId = "SMT-" + FormatUtil.leadingZeros(getNextSequence("smartId"), 6);
        },
        appointmentId:function(br) {
            br.appointmentId = "SMT-APT-" + FormatUtil.leadingZeros(getNextSequence("appointmentId"), 6);
        },
        meetingId:function(br) {
            br.meetingId = "SMT-MET-" + FormatUtil.leadingZeros(getNextSequence("meetingId"), 6);
        },
        jointWorkId:function(jwk){
            jwk.meetingId="SMT-JWK-"+  FormatUtil.leadingZeros(getNextSequence("jointWorkId"),6);
        },
        fileIdForHirerarchy:function (br) {
            br.fileId="SMT-HIRERARCHY-"+  FormatUtil.leadingZeros(getNextSequence("fileHirerarchy"),6);
        },
        /*transactionIdGenerationCompanyScientific: function (br) {
            br.transactionFileId = "SMT-INVENTORY-TRANSACTION-SCIENTIFIC-"+ FormatUtil.leadingZeros(getNextSequence("fileHirerarchy"),6);
        },
        transactionIdGenerationCompanyGift: function (br) {
            br.transactionFileId = "SMT-INVENTORY-TRANSACTION-GIFTS-"+ FormatUtil.leadingZeros(getNextSequence("fileHirerarchy"),6);
        },
        transactionIdGenerationCompanySample: function (br) {
            br.transactionFileId = "SMT-INVENTORY-TRANSACTION-SAMPLE-"+ FormatUtil.leadingZeros(getNextSequence("fileHirerarchy"),6);
        },
        inventoryIdGenerationCompanySample: function (br) {
            br.inventoryFileId = "SMT-INVENTORY-SAMPLE-"+FormatUtil.leadingZeros(getNextSequence("fileHirerarchy"),6);
        },
        inventoryIdGenerationCompanyScientificInput: function (br) {
            br.inventoryFileId = "SMT-INVENTORY-SCIENTIFIC-"+FormatUtil.leadingZeros(getNextSequence("fileHirerarchy"),6);
        },
        inventoryIdGenerationCompanyGift: function (br,cb) {
            br.inventoryFileId = "SMT-INVENTORY-GIFTS-"+FormatUtil.leadingZeros(getNextSequence("fileHirerarchy"),6);
            cb(true)
        },
*/
        generationCompanySubInventoryAccounting:function(br) {
            br.inventoryFileId = "SMT-SUB-INVENTORY-ACC-"+FormatUtil.leadingZeros(getNextSequence("fileHirerarchy"),6);
        }

    }
})();