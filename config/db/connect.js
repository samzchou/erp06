var dbServer = require('./index');
const mongoose = require('mongoose');
// 连接数据库
var myUri = 'mongodb://'+dbServer.dbConect.dataUrl+':'+dbServer.dbConect.dataPort+'/'+dbServer.dbConect.dataName;
if(dbServer.dbConect.username && dbServer.dbConect.password){
    myUri = myUri = 'mongodb://'+dbServer.dbConect.username+':'+dbServer.dbConect.password+'@'+dbServer.dbConect.dataUrl+':'+dbServer.dbConect.dataPort+'/'+dbServer.dbConect.dataName;
}
const optionsMongoose = {
    useNewUrlParser: true
};

mongoose.Promise = Promise;
mongoose.connect(myUri, optionsMongoose);

// 为这次连接绑定事件
const connect = mongoose.connection;
connect.once('error', (err) => console.log('Mongo connection error', myUri, err));
connect.once('open', () => console.log('Mongo connection successed', myUri));

/**cnpm install mongoose@5.2.8 --save 需要此版本 否则会有警告*/
//const autoIncrement = require('mongoose-auto-increment');
//autoIncrement.initialize(connect);
var Schema = mongoose.Schema;

/*---------计数器-----------*/
var counterScheme = new Schema(dbServer.collections.counters,{collection:'counters'});
exports.counters = connect.model('counters', counterScheme);

/*---------用户-----------*/
var userScheme = new Schema(dbServer.collections.user,{collection:'user'});
exports.user = connect.model('user', userScheme);

/*----------权限-----------*/
var roleScheme = new Schema(dbServer.collections.role,{collection:'role'});
exports.role = connect.model('role', roleScheme);

/*----------部门-----------*/
var orgScheme = new Schema(dbServer.collections.org,{collection:'org'});
exports.org = connect.model('org', orgScheme);

/*----------职务-----------*/
var posScheme = new Schema(dbServer.collections.pos,{collection:'pos'});
exports.pos = connect.model('pos', posScheme);

/*----------仓库库位数据-----------*/
var storeNoScheme = new Schema(dbServer.collections.storeNo,{collection:'storeNo'});
exports.storeNo = connect.model('storeNo', storeNoScheme);

/*----------业务分类-----------*/
var typeScheme = new Schema(dbServer.collections.type,{collection:'type'});
exports.type = connect.model('type', typeScheme);

/*----------产品分类-----------*/
var ptypeScheme = new Schema(dbServer.collections.ptype,{collection:'ptype'});
exports.ptype = connect.model('ptype', ptypeScheme);

/*---------付款方式-----------*/
var payTypeScheme = new Schema(dbServer.collections.payType,{collection:'payType'});
exports.payType = connect.model('payType', payTypeScheme);

/*---------业务流程状态-----------*/
var flowStateScheme = new Schema(dbServer.collections.flowState,{collection:'flowState'});
exports.flowState = connect.model('flowState', flowStateScheme);

/*---------客户数据-----------*/
var crmScheme = new Schema(dbServer.collections.crm,{collection:'crm'});
exports.crm = connect.model('crm', crmScheme);

/*---------产品数据-----------*/
var productScheme = new Schema(dbServer.collections.product,{collection:'product'});
exports.product = connect.model('product', productScheme);

/*---------订单数据-----------*/
var orderScheme = new Schema(dbServer.collections.order,{collection:'order'});
exports.order = connect.model('order', orderScheme);
/*---------原始订单数据-----------*/
var orderUploadScheme = new Schema(dbServer.collections.orderUpload,{collection:'orderUpload'});
exports.orderUpload = connect.model('orderUpload', orderUploadScheme);

/*---------仓库数据(待入库)-----------*/
var storeInScheme = new Schema(dbServer.collections.storeIn,{collection:'storeIn'});
exports.storeIn = connect.model('storeIn', storeInScheme);

/*---------仓库数据-----------*/
var storeScheme = new Schema(dbServer.collections.store,{collection:'store'});
exports.store = connect.model('store', storeScheme);

/*---------仓库盘点清单数据-----------*/
var storeCalcScheme = new Schema(dbServer.collections.storeCalc,{collection:'storeCalc'});
exports.storeCalc = connect.model('storeCalc', storeCalcScheme);

/*---------仓库损耗数据-----------*/
var storeLossScheme = new Schema(dbServer.collections.storeLoss,{collection:'storeLoss'});
exports.storeLoss = connect.model('storeLoss', storeLossScheme);

/*---------财务数据-----------*/
var financeScheme = new Schema(dbServer.collections.finance,{collection:'finance'});
exports.finance = connect.model('finance', financeScheme);

/*---------全局设置数据-----------*/
var settingScheme = new Schema(dbServer.collections.setting,{collection:'setting'});
exports.setting = connect.model('setting', settingScheme);

exports.connect = connect;
