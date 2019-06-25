<template>
	<section class="order-main">
		<div class="head-title">
			<div>
				<div>
					<span :class="{'inactive':!isAdded}" @click="setOrderParams(false)">待采购入库订单</span>
					<span :class="{'inactive':isAdded}" @click="setOrderParams(true)">已采购入库订单</span>
				</div>
			</div>
		</div>
		<div class="grid-container">
			<div class="search-content">
				<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
					<el-form-item label="制单号：" prop="orderSerial">
						<el-input v-model="searchForm.orderSerial" clearable style="width:150px" />
					</el-form-item>
                    <el-form-item label="蒂森订单号：" prop="sourceserial">
						<el-input v-model="searchForm.sourceserial" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="供应商：" prop="crmId" v-if="setting">
						<el-select v-model="searchForm.crmId" placeholder="请选择" clearable filterable>
							<el-option v-for="crm in setting.crm.filter(o=>o.typeId==1)" :key="crm.id" :label="crm.name" :value="crm.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="物料名称：" prop="productName">
						<el-input v-model="searchForm.productName" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="物料号/版本号：" prop="materialNo">
						<el-input v-model="searchForm.materialNo" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="制单日期：" prop="createDate">
						<el-date-picker v-model="searchForm.createDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
					</el-form-item>
					<el-form-item label="交货日期：" prop="finishedDate">
						<el-date-picker v-model="searchForm.finishedDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
					</el-form-item>
				</el-form>
			</div>
			<el-table class="table-container" ref="listTable" v-loading="listLoading" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500">
				<el-table-column prop="orderSerial" label="制单单号" width="140">
                    <template slot-scope="scope">
						<el-button type="text" @click.stop="showDetail(scope.row)">{{scope.row.orderSerial}}</el-button>
					</template>
				</el-table-column>
				<el-table-column label="蒂森订单号" width="200">
					<template slot-scope="scope">
						<span :title="scope.row.sourceserial">{{scope.row.sourceserial}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="crmName" label="供应商" width="150" />
				<el-table-column prop="projectName" label="项目名称" />
				<el-table-column prop="materialNo" label="物料号" width="120" />
				<el-table-column prop="productName" label="订单产品名称">
					<template slot-scope="scope">
						<span>{{scope.row.productName}}</span>
						<span style="margin-left:5px; color:#CCC">等...</span>
					</template>
				</el-table-column>
				<el-table-column prop="count" label="总量" width="80">
					<template slot-scope="scope">
						<span>{{scope.row.total}} 件</span>
					</template>
				</el-table-column>
				<el-table-column prop="finishedDate" label="制单交货日期" width="100">
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.finishedDate)}}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" fixed="right" align="center" :width="isAdded?90:150">
					<template slot-scope="scope">
						<div v-if="!scope.row.isAdded">
							<el-button size="mini" type="text" @click="showDetail(scope.row)" icon="el-icon-download">重新制单</el-button>
							<!--
							<el-button size="mini" type="text" @click="handleDeleteBySerial(scope.row)" icon="el-icon-delete">删除</el-button>
							-->
						</div>
						<span v-else style="color:#CCC">
							<el-button size="mini" type="text" @click="showDetail(scope.row)" icon="el-icon-download">查阅制单</el-button>
						</span>
					</template>
				</el-table-column>
			</el-table>
			<div class="page-container">
				<div>共有{{total}}个采购订单，请点击供应商名称查阅或操作订单</div>
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200,500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total" />
			</div>
		</div>
		<el-dialog title="供应商采购清单" append-to-body :visible.sync="openOrderVisible" width="85%">
			<div class="order-title">
				<span v-if="currItem">供应商：{{currItem.crmName}}，地址：{{currItem.address}}，联系人：{{currItem.contactName}}，电话：{{currItem.contactPhone}}</span>
			</div>
			<div class="order-title" style="padding:10px 0" v-if="crmOrderList.length">
				<span style="font-weight:bold">订单总价：{{parseAllOrderMoney(true)}}</span>
			</div>
			<div>
				<el-table ref="exportTable" :data="crmOrderList" border fit highlight-current-row stripe size="mini" max-height="350" v-loading="searchLoading" style="width:100%">
                    <el-table-column type="index" width="50" align="center">
                        <template slot-scope="scope">
                            <span  v-if="scope.$index<crmOrderList.length-1">{{scope.$index+(queryIn.page - 1) * queryIn.pagesize + 1}}</span>
                        </template>
                    </el-table-column>
					<el-table-column prop="isPayed" label="订单结算" width="70" v-if="currItem && currItem.isAdded">
						<template slot-scope="scope">
							<span>{{scope.row.isPayed?'已付款':'未付款'}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="orderSerial" label="制单号" width="130" />
                    <!-- <el-table-column prop="serial" label="系统订单号" width="120" />
					<el-table-column prop="sourceserial" label="蒂森订单编号" width="120" /> -->
					<el-table-column prop="materialNo" label="物料号" width="120" />
					<el-table-column prop="productName" label="物料名称" />
					<el-table-column prop="model" label="规格型号" width="100" />
					<el-table-column prop="price" label="订单单价" width="80" />
					<el-table-column prop="metaprice" label="采购单价" width="100">
						<template slot-scope="scope">
							<div v-if="scope.$index<crmOrderList.length-1">
								<el-input-number size="mini" v-if="!scope.row.isAdded" controls-position="right" :min="0" :step="0.1" v-model="scope.row.metaprice" @change="setRowData(scope.row)" style="width:80" />
								<span v-else>{{scope.row.metaprice}}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="count" label="订单数量" width="80">
						<template slot-scope="scope">
							<span>{{scope.row.count}} {{scope.row.util}}</span>
						</template>
					</el-table-column>
					<el-table-column label="库存量" width="70px">
						<template slot-scope="scope">
							<span v-if="scope.$index<crmOrderList.length-1">{{scope.row.store?scope.row.store.count:0}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="incount" label="实际采购量" width="100">
						<template slot-scope="scope">
							<div v-if="scope.$index<crmOrderList.length-1">
								<span v-if="!scope.row.isAdded">
									<el-input-number size="mini" controls-position="right" :min="scope.row.count" v-model="scope.row.incount" @change="setRowData(scope.row)" style="width:80px" />
								</span>
								<span v-else>{{scope.row.incount}}</span>
							</div>
							<span v-else>{{scope.row.incount}}</span>
						</template>
					</el-table-column>
					<el-table-column label="订单金额" width="100">
						<template slot-scope="scope">
							<span v-if="scope.$index<crmOrderList.length-1">{{parseReleaseMoney(scope.row)}}</span>
							<span v-else>{{parseAllOrderMoney(true)}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="finishedDate" label="制单交货日期" width="100">
						<template slot-scope="scope">
                            <span>{{parseDate(scope.row.finishedDate)}}</span>
							<!-- <div v-if="scope.$index<crmOrderList.length-1">
								<span v-if="!scope.row.isAdded">
									<el-date-picker size="mini" v-model="scope.row.finishedDate" type="date" value-format="timestamp" placeholder="选择日期" :clearable="false" style="width:130px" />
								</span>
								<span v-else>{{parseDate(scope.row.finishedDate)}}</span>
							</div> -->
						</template>
					</el-table-column>
					<el-table-column label="操作" align="center" width="70">
						<template slot-scope="scope">
							<div v-if="scope.$index<crmOrderList.length-1">
								<el-button v-if="!scope.row.isAdded" size="mini" type="text" @click="handleDeleteOrder(scope.row)" icon="el-icon-delete">移除</el-button>
								<span v-else>--</span>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="btns" v-if="crmOrderList.length">
				<div>
					<el-pagination size="mini" @size-change="handleSizeOrder" @current-change="handleCurrentOrder" :current-page.sync="queryIn.page" :page-sizes="[3,20, 50, 100, 200,500]" :page-size="queryIn.pagesize" layout="total,sizes,prev,pager,next" :total="queryInTotal" />
				</div>
				<div>
                    <span>采购制单交货日期：</span>
                    <el-date-picker size="small" v-model="currItem.finishedDate" value-format="timestamp" :clearable="false" type="date" placeholder="选择日期" style="width:150px;margin-right:10px"/>
					<el-button type="success" @click="exportOrder" icon="el-icon-document" v-if="currItem && !currItem.isAdded">重新制单采购</el-button>
					<el-button @click="openOrderVisible=false">取消退出</el-button>
				</div>
			</div>
		</el-dialog>
	</section>
</template>

<script>
import { mapState } from 'vuex';
export default {
	computed: {
		...mapState(['checkStatus', 'floor', 'seatList']),
	},
	data() {
		return {
            finishedDate:'',
			isAdded: false,
			setting: null,
			listLoading: false,
			gridList: [],
			query: {
				page: 1,
				pagesize: 500
			},
			total: 0,
			storeType: [
				{ id: 0, label: '未入库' }, { id: 1, label: '已入库' }, { id: 2, label: '已出库' }
			],
			searchForm: {
                orderSerial: '',
				sourceserial: '',
				productName: '',
				crmId: '',
				materialNo: '',
				createDate:'',
				finishedDate: ''
			},
			searchLoading: false,
			currItem: null,
			crmOrderList: [],
			openOrderVisible: false,
			queryIn: {
				page: 1,
				pagesize: 500
			},
            queryInTotal: 0,
            orderSerial:'',
		}
	},
	methods: {
        setOrderSerial(){
            let now = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
			now = now.split(" ");
			let dd = now[0].split("-");
			let tt = now[1].split(":");
			let serial = "JH" + dd[0] + "" + dd[1] + "" + dd[2] + "" + tt[0] + "" + tt[1] + "" + tt[2];
			return serial;
        },
		exportOrder() {
			if (this.crmOrderList.length < 2) {
				this.$message.error('没有订单可制定！');
				return;
            }
            this.orderSerial = this.setOrderSerial();
            this.crmOrderList.forEach(item=>{
                if(item.id){
                    item.orderSerial = this.orderSerial;
                    item.finishedDate = this.currItem.finishedDate;
                }
            });

			import('@/components/Export2Excel').then(excel => {
				const tHeader = ['制单号', '物料号', '物料名称', '规格型号', '数量', '单价', '金额', '交货日期'];
				const filterVal = ['orderSerial', 'materialNo', 'productName', 'model', 'incount', 'metaprice', 'allPrice', 'finishedDate'];
				const data = this.formatJson(filterVal, _.cloneDeep(this.crmOrderList));
				const now = moment(new Date()).format('YYYYMMDD');
				excel.export_json_to_excel({
					header: tHeader,
					data,
					filename: this.currItem.crmName + '-' + this.orderSerial
				});
				this.updateOrderByCrm(this.crmOrderList);
			})
		},
		formatJson(filterVal, jsonData) {
			return jsonData.map(v => filterVal.map(j => {
				if (j == 'finishedDate') {
					v[j] = this.parseDate(v[j]);
				}
				return v[j];
			}))
		},
		updateOrderByCrm() {
			let dataList = [];
			this.crmOrderList.forEach((item, index) => {
				if (item.id) {
					dataList.push({
                        'id': item.id,
                        'orderSerial': item.orderSerial,
						'incount': item.incount,
						'price': item.price,
						'metaprice': item.metaprice,
						'finishedDate': this.currItem.finishedDate,
						'updateByUser': this.$store.state.user.name
					})
				}
			})
			let condition = {
				type: 'updateArr',
				collectionName: 'storeIn',
				updateDate: true,
				data: dataList
			}
            /* console.log('updateOrderByCrm', dataList);
            debugger
            return; */
			this.$axios.$post('mock/db', { data: condition }).then(result => {
                this.openOrderVisible = false;
                this.submitSearch(true);
				//this.$message.success('已下单完成');
			});
		},
		setRowData(row) {
			row.allPrice = row.incount * row.price;
		},
		handleSizeOrder(val) {
			this.queryIn.pagesize = val;
			this.showDetail(this.currItem);
		},
		handleCurrentOrder(val) {
			this.queryIn.page = val;
			this.showDetail(this.currItem);
		},
		async showDetail(row) {
			let crm = _.find(this.setting.crm, { 'id': row.crmId });
			this.currItem = _.merge(row, {
				contactName: crm.contactName,
				contactPhone: crm.contactPhone,
				address: crm.address
            });
            debugger
			console.log('this.currItem', this.currItem);
			let params = _.merge({}, {
                orderSerial: row.orderSerial,
                crmId: row.crmId,
				isAdded: row.isAdded
			});
			// 查询供应商的具体订单
			let condition = {
				type: "aggregate",
				collectionName: 'storeIn',
				data: params,
				aggregate: [
                    { $match: params },
					{
						"$lookup": {
							"from": "store",
							"localField": "materialNo",
							"foreignField": "materialNo",
							"as": "store"
						}
                    },
					{
						$unwind: { // 拆分子数组
							path: "$store",
							preserveNullAndEmptyArrays: true // 空的数组也拆分
						}
                    },
					{ $sort: { finishedDate: 1 } },
					{ "$skip": (this.queryIn.page - 1) * this.queryIn.pagesize },
					{ "$limit": this.queryIn.pagesize }
				]
			}
			let result = await this.$axios.$post('mock/db', { data: condition });
			this.crmOrderList = result.list;
			this.queryInTotal = result.total;
			this.crmOrderList.push({ orderSerial: '合计' });
			this.parseAllOrderMoney();
			this.openOrderVisible = true;
		},
		showSourceOrder(sourceserial) {
			console.log('showSourceOrder', sourceserial);
		},
		setOrderParams(flag) {
			this.isAdded = flag;
			this.query.page = 1;
			this.getList();
		},
		/*
		async handleDeleteBySerial(row) {
			console.log('handleDeleteBySerial', row);
			let condition = {
				type: 'listData',
				collectionName: 'storeIn',
				data: { typeId: row.typeId, isAdded: row.isAdded, crmId: row.crmId }
			};
			let result = await this.$axios.$post('mock/db', { data: condition });
			console.log(result.list);
			this.$confirm('将同时删除所有' + result.total + '条订单，并影响到实际出库！确定删除？', '提示：请谨慎操作此删除', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let ids = result.list.map(item => {
					return item.id;
				})
				let condition = {
					type: 'removePatch',
					collectionName: 'storeIn',
					data: { 'id': { '$in': ids } }
				};
				this.$axios.$post('mock/db', { data: condition }).then(result => {
					this.submitSearch(true);
				});
			}).catch(() => { });
		},
		*/
		handleDeleteOrder(row) {
			let index = _.findIndex(this.crmOrderList, { 'id': row.id });
			debugger
			this.$confirm('确定移除该条订单，同时将删除'+row.orderIds.length+'条原订单，并影响到实际出库！确定删除？', '从供应商订单汇总中移除订单', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				let condition = {
					type: 'removeData',
					collectionName: 'storeIn',
					data: { 'id': row.id }
				};
				this.$axios.$post('mock/db', { data: condition }).then(result => {
					this.crmOrderList.splice(index, 1);
					this.removeSourceOrder(row.orderIds);
					this.submitSearch(true);
				});
			}).catch(() => { });
		},
		removeSourceOrder(ids){
			let condition = {
				type: 'removePatch',
				collectionName: 'order',
				notNotice: true,
				data: { 'id': { $in: ids } }
			};
			console.log('ids', ids);
			this.$axios.$post('mock/db', { data: condition });
		},
		parseAllOrderMoney(flag) {
			let money = 0, count = 0;
			this.crmOrderList.forEach((item, index) => {
				if (index < this.crmOrderList.length - 1) {
					count += item.incount;
					money += item.incount * item.metaprice;
				}
			});
			//debugger
			this.crmOrderList[this.crmOrderList.length - 1]['incount'] = count;
			this.crmOrderList[this.crmOrderList.length - 1]['allPrice'] = money;
			return this.$options.filters['currency'](money);
		},
		parseReleaseMoney(row) {
			let money = row.incount * row.metaprice;
			row.allPrice = money;
			return this.$options.filters['currency'](money);
		},
		parseDate(date, format) {
			return date ? moment(date).format(format || 'YYYY-MM-DD') : '';
		},
		parseStoreType(id) {
			if (id == undefined) return '';
			let type = _.find(this.storeType, { id: id });
			return type ? type.label : '';
		},
		submitSearch(flag) {
			let params = {};
			for (let k in this.searchForm) {
				if (this.searchForm[k] && this.searchForm[k] != '') {
					if (_.isNumber(this.searchForm[k])) {
						params[k] = Number(this.searchForm[k]);
					} else if (_.isArray(this.searchForm[k]) && (k === 'finishedDate' || k === 'createDate')) {
						params[k] = {
							$gte: this.searchForm[k][0],
							$lte: this.searchForm[k][1]
						}
					} else if (_.isArray(this.searchForm[k])) {
						params[k] = { $in: this.searchForm[k] }
					} else {
						params[k] = { $regex: this.searchForm[k] };
					}
				}
			};
			if (!flag) { // 不需要再做分页复位
				this.query = {
					page: 1,
					pagesize: 50
				}
			}
			//debugger
			this.getList(params);
		},
		handleSizeChange(val) {
			this.query.pagesize = val;
			this.submitSearch(true);
		},
		handleCurrentChange(val) {
			this.query.page = val;
			this.submitSearch(true);
		},
		async getList(match = {}) {
            this.listLoading = true;
            match = _.merge({ typeId: 1, isAdded: this.isAdded }, match);
            let groupId = {"orderSerial":"$orderSerial","crmId": "$crmId"};
			let condition = {
				type: 'groupList',
				collectionName: 'storeIn',
				data: match,
                distinct: "crmId",
                groupCount:[
                    { $match: match },
					{ $group: { _id: groupId } },
					{ $group: { _id: null, total: { $sum: 1 } } }
                ],
				aggregate: [
					{ "$match":match },
					{
						"$group": {
							"_id": groupId,
							"isAdded": { "$first": "$isAdded" },
							"id": { "$first": "$id" },
                            "serial": { "$first": "$serial" },
                            "orderSerial": { "$first": "$orderSerial" },
							"sourceserial": { "$first": "$sourceserial" },
							"crmId": { "$first": "$crmId" },
							"crmName": { "$first": "$crmName" },
							"productName": { "$first": "$productName" },
							"materialNo": { "$first": "$materialNo" },
							"projectName": { "$first": "$projectName" },
							"createDate": { "$first": "$createDate" },
							"finishedDate": { "$first": "$finishedDate" },
							"total": { $sum: 1 }
						}
					},
					{ "$sort": { 'createDate': 1, 'crmId': 1 } },
					{ "$skip": (this.query.page - 1) * this.query.pagesize },
					{ "$limit": this.query.pagesize }
				]
			};
            let result = await this.$axios.$post('mock/db', { data: condition });
            //debugger
			this.gridList = result.list;
			this.total = result.total;
			this.listLoading = false;
			console.log('getList', result.list);
		},
		async getSetting() {
			let condition = {
				type: "getData",
				collectionName: "setting",
				data: {}
			}
			let result = await this.$axios.$post('mock/db', { data: condition });
			if (result) {
				this.setting = result.content;
			}
		}
	},
	created() {
		this.getSetting();
	},
	mounted() {
		this.getList();
	}
}
</script>

<style lang="scss" scoped>
@import "~/assets/scss/order.scss";
</style>

