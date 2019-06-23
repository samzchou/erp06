/**
 * mongoDB数据处理后台接口
 */
const dbServer = require('../config/db/');
const mongoDB = require('../config/db/connect');
const mongoose = require('mongoose');
//const dbConfig = require('../config/db');
const crypto = require('crypto');
const _ = require('lodash');
const tokenPrefix = 'samz.com';
const jwt = require('jsonwebtoken');
const svgCaptcha = require('svg-captcha');

const dbFun = {
    async initDB(){
        // 列出所有集合
        let cols = await mongoose.connection.db.collections();
        let colStrArr = [];
        for(let c of cols){
            colStrArr.push(c.s.name);
        }
        var keys = Object.keys(dbServer.collections);
        for(var i=0; i<keys.length; i++){
            let tn = keys[i];
            let counters =  await mongoDB.counters.findOne({'model':tn});
            if(!colStrArr.includes(tn) && !counters){ // 如果不存则创建集合
                let res = await mongoose.connection.db.createCollection(tn);
                await mongoDB.counters.create({'model':tn, 'count':0});
            }
        }
        return {
            success:true
        };
    },
    async clearAll(){
        await mongoDB['counters'].updateMany({ model: { $in: ['order','store','storeCalc','storeIn','storeLoss','finance'] } },{ $set: { "count" : 0 } });
        await mongoDB.order.remove({});
        await mongoDB.store.remove({});
        await mongoDB.storeCalc.remove({});
        await mongoDB.storeIn.remove({});
        await mongoDB.finance.remove({});
        return {
            success:true,
            response:{}
        }
    },
    /**
     * --------多表联合查询数据--------
     * aggregate:[
                    {
                        $lookup:{// 左连接
                            from: "orgs", // // 关联到的表
                            localField: "orgId", //主表关联的字段
                            foreignField: "id", //外联表关联的字段
                            as: "org" // 隐射到特定字段
                        }
                    },
                    {
                        $unwind: { // 拆分子数组
                            path: "$org", //隐射的特定字段
                            preserveNullAndEmptyArrays: true // 空的数组也拆分
                        }
                    }
                ]
     *  */
    async aggregate(params){
        const tn = params.collectionName;
        let condition = params.data || {};
        let total = await mongoDB[tn].find(condition).countDocuments();
        let list = await mongoDB[tn].aggregate(params.aggregate);
        return {
            success:true,
            response:{
                total:total,
                list : list
            }
        }
    },
	async groupList(params){
        const tn = params.collectionName;
		let total = 0;
        let condition = params.data || {};
		let countTotal = await mongoDB[tn].distinct(params.distinct, condition);
		if(params.groupCount && countTotal.length){
			let gtotal = await mongoDB[tn].aggregate(params.groupCount);
			total = gtotal[0]['total'];
			//console.log('total', gtotal[0]['total'])
		}else{
			total = countTotal.length;
		}
		let list = await mongoDB[tn].aggregate(params.aggregate);
        return {
            success:true,
            response:{
                total:total,
                list : list
            }
        }
    },

	/*--------列出几天后的所有采购订单数据--------*/
    async listOrderByDate(params){
        let now = new Date();
		let sd = new Date(now.setDate(now.getDate() -1));
		let ed = new Date(now.setDate(now.getDate() + 6));
        let condition = {'typeId':1,'flowStateId':1,'deliveryDate':{'$gte':sd.getTime(),'$lte':ed.getTime()}};

		//console.log('listOrderByDate',condition);

        let total = await mongoDB['order'].find(condition).countDocuments();
        let list = await mongoDB['order'].find(condition);
        return {
            success:true,
            response:{
                total:total,
                list : list
            }
        }
    },
	/*--------去重查询数据--------*/
    async distinctData(params){
        const tn = params.collectionName;
        let condition = params.data || {};
        let list =  await mongoDB[tn].distinct(params.distinct,condition);
        return {
            success:true,
            response:list
        }
    },
	/*--------统计数量--------*/
    async countData(params){
        const tn = params.collectionName;
        let condition = params.data || {};
        let total =  await mongoDB[tn].find(condition).countDocuments();
        return {
            success:true,
            response:total
        }
    },

    /*--------列出数据--------*/
    async listData(params){
        const tn = params.collectionName;
        let condition = params.data || {};
		let column = params.column || {};
		let sortCondition = {};
		let sortby = params.sortby ? params.sortby : '_id';
		let ascby = params.ascby ? params.ascby : 1;
        var page = params.page ? parseInt(params.page)-1 : 0;
        var pagesize = params.pagesize ? parseInt(params.pagesize) : 0;
        var skips = page * pagesize;
        sortCondition[sortby] = ascby;

        let total = await mongoDB[tn].find(condition).countDocuments();
        //console.log('listData', condition, total);
        let list = [];
        if(pagesize){
            list =  await mongoDB[tn].find(condition,column).sort(sortCondition).skip(skips).limit(pagesize);
        }else{
            list =  await mongoDB[tn].find(condition,column).sort(sortCondition);
        }
        return {
            success:true,
            response:{
                total:total,
                list : list
            }
        }
    },

    /*--------批量添加数据--------*/
    async addPatch(params){
        const tn = params.collectionName;
        const data = params.data;
        let result = await mongoDB[tn].insertMany(data);
        //console.log(params, result);
        let cc = await mongoDB.counters.findOneAndUpdate({'model':tn}, {$inc:{count:data.length}});
		let response = {
			success:true,
            msgDesc:'数据保存成功'
		}
		if(params.notNotice && response.success){
			delete response.msgDesc;
		}
        return response;
    },
    /*--------批量更新数据--------*/
    async updatePatch(params){
        const tn = params.collectionName;
        let result = await mongoDB[tn].updateMany(params.param, params.set);
        //console.log('updatePatch', params, result);
		let response = {
			success:result.n?true:false,
            msgDesc:result.n?'数据更新成功':'数据更新失败',
			response:result
		}
		if(params.notNotice && response.success){
			delete response.msgDesc;
		}
        return response;
    },
    /*--------批量删除数据--------*/
    async removePatch(params){
        const tn = params.collectionName;
        const data = params.data;
        let result = await mongoDB[tn].deleteMany(data);
		//console.log('removePatch', result)
		let response = {
			success:true,
            msgDesc:'数据删除成功'
		}
		if(params.notNotice && response.success){
			delete response.msgDesc;
		}
        return response;
    },
    /*--------添加数据--------*/
    async addData(params){
        let tn = params.collectionName;
        let data = params.data;
        if(data.password){
            data.password = this._setHash(data.password);
        }
        // 计数器
        let counters =  await mongoDB.counters.findOne({'model':tn});
        data.id = counters.count + 1;
        let result =  await mongoDB[tn].create(data);
        //console.log('addData',result);
        if(result){
            await mongoDB.counters.findOneAndUpdate({'model':tn}, {$inc:{count:1}});
        }
        let response = {
            success:true,
            msgDesc:'数据添加成功',
            response:result
        }
        if(params.notNotice && response.success){
            delete response.msgDesc;
        }
        return response;
    },
    /*--------批量加入或更新仓库数据--------*/
    async addStore(params){
        const tn = params.collectionName;
		let data = params.data;
		let counters =  await mongoDB.counters.findOne({'model':'storeCalc'});
		let lastId = counters.count;
		//console.log('lastId', lastId)
        for(let i=0; i<data.length; i++){
            let item = data[i];
            // 获取库存信息
            let storeInfo = await mongoDB[tn].findOne({ 'materialNo':item.materialNo},{id:1});
            if (storeInfo){ // 更新库存量
                await mongoDB[tn].findOneAndUpdate({ 'id': storeInfo.id}, {'$inc':{count:item.incount,incount:item.incount},'crmId':item.crmId,'updateByUser':item.updateByUser,'updateDate':new Date().getTime()});
            }else{
                let storeCounters =  await mongoDB.counters.findOne({'model':tn});
                let storeLastId = storeCounters.count + 1;
                item.id = storeLastId;
                await mongoDB[tn].create(item);
				await mongoDB.counters.findOneAndUpdate({'model':tn}, {$inc:{count:1}});
            }

			// 盘点详细清单
			lastId++;
			let calcItem = {
				id:lastId,
				typeId:item.typeId,
				crmId:item.crmId,
				productName:item.productName,
				materialNo:item.materialNo,
				storeTypeId:item.storeTypeId,
				price:item.price,
				metaprice:item.metaprice,
				util:item.util,
				incount:item.incount,
				storeCount:item.storeCount,
				createByUser:item.createByUser
			}
			await mongoDB.storeCalc.create(calcItem);
		}
		await mongoDB.counters.findOneAndUpdate({'model':'storeCalc'}, {$inc:{count:data.length}});
        return {
            success:true,
            msgDesc:'订单入库成功'
        };
    },
    /*--------批量更新数据--------*/
    async updateArr(params){
        const tn = params.collectionName;
        let data = params.data;
        for(let i=0; i<data.length; i++){
            let condition = {id:data[i].id};
            let set = data[i];
            if(params.updateDate){
                set.updateDate = new Date().getTime();
            }
			//console.log(condition, set);
            //let result = await mongoDB[tn].updateOne(condition, set, $currentDate: { lastModified: true });//{upsert:true}
			let result = await mongoDB[tn].updateOne(condition, {$set:set}, {upsert:true});
			console.log('result',result);
        }
		let response = {
			success:true,
            msgDesc:'数据更新成功'
		}
		if(params.notNotice && response.success){
			delete response.msgDesc;
		}
        return response;
    },
    /*--------更新数据--------*/
    async updateData(params){
        const tn = params.collectionName;
        let data = params.data;
        let condition = data.id?{id:data.id}:params.condition;
        if(params.updateDate){
            data.updateDate = new Date().getTime();
        }
        let update = {$set : data};
		let result = null;
		if(params.multi){ // 更新多个
			result =  await mongoDB[tn].update(condition, update, {multi: true});
		}else{
			let total = await mongoDB[tn].countDocuments(condition);
			if(total){
				result =  await mongoDB[tn].updateOne(condition, update, {upsert : true});
			}
		}
        let response = {
            success:result?true:false,
            msgDesc:result?'数据更新成功':'数据更新失败'
        }

        if(params.notNotice && response.success){
            delete response.msgDesc;
        }
        return response;
        /*
        return {
            success:result?true:false,
            msgDesc:result?'数据更新成功':'数据更新失败'
        }
        */
    },
	/*--------批量出库--------*/
    async outStore(params){
		const tn = params.collectionName;
		return new Promise((resolve, reject)=>{
			mongoDB[tn].updateMany(params.data, params.set).then(res=>{
				let aggregates = [
					{"$match": params.data},
					{
						$lookup:{
							from: "store",
							localField: "materialNo", //materialNo
							foreignField: "materialNo", //materialNo
							as: "store"
						}
					},
					{
						$unwind: { // 拆分子数组
							path: "$store",
							preserveNullAndEmptyArrays: true // 空的数组也拆分
						}
					},
					{
						$group:{
							_id:{ "id":"$id"},
							"id":{"$first" :"$id"},
							"typeId":{"$first" :"$typeId"},
							"productName":{"$first" :"$productName"},
							"materialNo":{"$first" :"$materialNo"},
							"price":{"$first" :"$price"},
							"metaprice":{"$first" :"$metaprice"},
							"util":{"$first" :"$util"},
							"count":{"$first" :"$count"},
							"storeId":{"$first" :"$store.id"},
							"storeCount":{"$first" :"$store.count"},
							"atcount":{"$first" :"$store.atcount"},
							"incount":{"$first" :"$store.incount"},
							"outcount":{"$first" :"$store.outcount"}
						}
					},
				];
				mongoDB[tn].aggregate(aggregates).then(result=>{
					for(let i=0; i<result.length; i++){
						let item = result[i];
						mongoDB.store.updateOne({id:item.storeId},{$inc:{count:-item.count,outcount:item.count},$set:{updateByUser:params.user,updateDate:new Date().getTime()}},{ upsert: true }).then(rs=>{
							//console.log('updateOne', rs);
						});
					}
					resolve( {
						success:true,
						response:result
					})
				});
			})
		});
    },

    /*--------列出所有订单的指定字段列-------*/
    async getColumns(params){
        const tn = params.collectionName;
        const condition = params.condition || {};
        const cols = params.cols;
        let result =  await mongoDB[tn].find(condition, cols);
        return {
            success:true,
            response:result
        }
    },

    /*--------获取数据最后的ID--------*/
    async getId(params){
        let result =  await mongoDB.counters.findOne(params.data);
        return {
            success:true,
            response:result.count
        }
    },
    /*--------获取单条数据--------*/
    async getData(params){
        let tn = params.collectionName;
        let data = params.data;
        let result =  await mongoDB[tn].findOne(data);
        return {
            success:result?true:false,
            msgDesc:result?null:'获取数据失败',
            response:result
        }
    },
    /*--------删除数据--------*/
    async removeData(params){
        let tn = params.collectionName;
        let data = params.data;
        let result =  await mongoDB[tn].remove(data);
		console.log(params, result)
        return {
            success:result['n']==0?false:true,
            msgDesc:result['n']==0?'删除数据失败':null
        }
    },
    /*--------基础数据和元数据更新--------*/
    async updateSetting(params){
        let tn = params.collectionName;
        let data = params.data;
        let opts =  await mongoDB['setting'].findOne({name:'opts'});
        opts['content'][tn] = params.data;
        let result = await mongoDB['setting'].updateOne({name:'opts'}, {$set : {'content':opts['content']}}, {upsert : true});
        return {
            success:result['n']==1?true:false,
            msgDesc:result['n']==1?null:'参数更新失败'
        }
    },

    async captcha(params){
        //console.log('captcha', params)
        let captcha = svgCaptcha.create({
            inverse: false,
            color:true,
            background: '#cc9966',
            fontSize: 36,
            noise: 2,
            width: 90,
            height: 36,
        });
        return {
            success:true,
            msgDesc:'',
            response:{svg:captcha.data,text:captcha.text}
        }
    },
    _setHash(str){
        var hash = crypto.createHash("md5");
        hash.update(new Buffer(str, "binary"));
        str = hash.digest('hex');
        return str;
    },
    async login(params){
        let tn = params.collectionName;
        let data = params.data;
        let content = {'name':data.username}; // 要生成token的主题信息
        let token = jwt.sign(content, tokenPrefix, {
            expiresIn: 60*60*1  // 1小时过期
        });
        if(data.password){
            data.password = this._setHash(data.password);
        }
        let result =  await mongoDB[tn].findOne(data);
        if(result){
            result.token = token;
            this.updateData({collectionName:tn,data:result})
        }
        return {
            success:result?true:false,
            msgDesc:result?'':'登录失败',
            response:result
        }
    },
    async logout(){

    }
}

module.exports = ({data}) => {
    return new Promise((resolve, reject)=>{
        dbFun[data.type](data).then(result=>{
            resolve(result);
        });

    });
}
