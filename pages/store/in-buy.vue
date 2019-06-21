<template>
	<section class="order-main">
		<div class="head-title">
			<div>
				<div>
					<span :class="{'inactive':!isAdded}" @click="setOrderParams(false)">待入库订单</span>
					<span :class="{'inactive':isAdded}" @click="setOrderParams(true)">已入库订单</span>
				</div>
			</div>
		</div>
		<div class="grid-container">
			<div class="search-content">
				<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
					<el-form-item label="制单单号：" prop="orderSerial">
						<el-input v-model="searchForm.orderSerial" clearable style="width:160px" />
					</el-form-item>
					<el-form-item label="蒂森订单号：" prop="sourceserial">
						<el-input v-model="searchForm.sourceserial" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="系统订单号：" prop="serial">
						<el-input v-model="searchForm.serial" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="供应商" prop="crmId" v-if="setting">
						<el-select v-model="searchForm.crmId" placeholder="请选择" clearable filterable>
							<el-option v-for="crm in setting.crm.filter(o=>o.typeId==1)" :key="crm.id" :label="crm.name" :value="crm.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="产品名称：" prop="productName">
						<el-input v-model="searchForm.productName" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="物料号/版本号：" prop="materialNo">
						<el-input v-model="searchForm.materialNo" clearable style="width:150px" />
					</el-form-item>
					<el-form-item label="交货日期：" prop="deliveryDate">
						<el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
					</el-form-item>
				</el-form>
			</div>
			<el-table class="table-container" ref="listTable" v-loading="listLoading" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500">
				<el-table-column type="index" width="70" label="序号" align="center">
					<template slot-scope="scope">
						<span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
					</template>
				</el-table-column>
				<el-table-column prop="orderSerial" label="制单号" width="150">
					<template slot-scope="scope">
						<el-button type="text" @click.stop="showDetail(scope.row)">{{scope.row.orderSerial}}</el-button>
					</template>
				</el-table-column>
				<el-table-column label="蒂森订单号" width="200">
					<template slot-scope="scope">
						<span :title="scope.row.sourceserial">{{scope.row.sourceserial}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="crmName" label="供应商" />
				<el-table-column prop="productName" label="订单产品名称" width="150">
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
				<el-table-column prop="deliveryDate" label="制单交货日期" width="100">
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.deliveryDate)}}</span>
					</template>
				</el-table-column>
				<el-table-column label="操作" fixed="right" align="center" width="70">
					<template slot-scope="scope">
						<div>
							<el-button size="mini" type="text" @click="showDetail(scope.row)" icon="el-icon-download">{{scope.row.isAdded?'查阅':'入库'}}</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
			<div class="page-container">
				<div>共有{{total}}个采购订单，请点击供应商名称查阅或操作订单</div>
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total" />
			</div>
		</div>
		<el-dialog title="采购订单仓库入库清单" append-to-body :close-on-click-modal="false" :visible.sync="openOrderVisible" width="85%">
			<div class="order-title">
				<span v-if="currItem">供应商：{{currItem.crmName}}，地址：{{currItem.address}}，联系人：{{currItem.contactName}}，电话：{{currItem.contactPhone}}</span>
			</div>
			<div class="order-title" style="padding:10px 0" v-if="crmOrderList.length">
				<span style="font-weight:bold">订单总价：{{parseAllOrderMoney(true)}}</span>
			</div>
			<div>
				<el-table ref="exportTable" :data="crmOrderList" border fit highlight-current-row stripe size="mini" max-height="350" v-loading="searchLoading" @selection-change="handleSelectionChange">
					<el-table-column type="selection" width="40" align="center" v-if="currItem && !currItem.isAdded" :selectable="checkSelectable" />
					<el-table-column type="index" width="50" align="center" />
					<el-table-column prop="orderSerial" label="制单号" width="140" />
					<el-table-column prop="materialNo" label="物料号" width="120" />
					<el-table-column prop="productName" label="物料名称" />
					<el-table-column prop="price" label="订单单价" width="70" />
					<el-table-column prop="metaprice" label="采购单价" width="100">
						<template slot-scope="scope">
							<div v-if="scope.$index<crmOrderList.length-1">
								<el-input-number v-if="!scope.row.isAdded" size="mini" controls-position="right" :min="0" :step="0.1" @change="changeMetaPrice(scope.row)" v-model="scope.row.metaprice" style="width:80" />
								<span v-else>{{scope.row.metaprice}}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="count" label="订单量" width="80">
						<template slot-scope="scope">
							<span>{{scope.row.count}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="count" label="当前库存" width="70">
						<template slot-scope="scope">
							<span v-if="scope.$index<crmOrderList.length-1">{{scope.row.store?scope.row.store.count:0}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="incount" label="实际入库数量" width="100">
						<template slot-scope="scope">
							<div v-if="scope.$index<crmOrderList.length-1">
								<el-input-number v-if="!scope.row.isAdded" size="mini" controls-position="right" :min="0" @change="changeInCount(scope.row)" v-model="scope.row.incount" style="width:80" />
								<span v-else>{{scope.row.incount}}</span>
							</div>
							<div v-else>{{scope.row.incount}}</div>
						</template>
					</el-table-column>
					<el-table-column label="订单金额" width="100">
						<template slot-scope="scope">
							<span v-if="scope.$index<crmOrderList.length-1">{{parseReleaseMoney(scope.row)}}</span>
							<span v-else>{{parseAllOrderMoney(true)}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="deliveryDate" label="交货日期" width="100">
						<template slot-scope="scope">
							<span>{{parseDate(scope.row.deliveryDate)}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="updateDate" label="最后更新" width="100">
						<template slot-scope="scope">
							<span v-if="scope.row.isAdded">{{parseDate(scope.row.updateDate)}}</span>
							<span v-else>{{parseDate(scope.row.createDate)}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="updateByUser" label="操作人" width="70">
						<template slot-scope="scope">
							<span v-if="scope.row.isAdded">{{scope.row.updateByUser}}</span>
							<span v-else>{{scope.row.createByUser}}</span>
						</template>
					</el-table-column>
				</el-table>
			</div>
			<div class="btns" v-if="crmOrderList.length">
				<div>
					<span>合计：共{{queryInTotal}}个采购订单；</span>
					<span v-if="!currItem.isAdded">请勾选需要入库的订单；已选个{{selectOrders.length}}订单</span>
					<span v-else>订单已全部入库</span>
				</div>
				<div>
					<el-pagination size="mini" @size-change="handleSizeOrder" @current-change="handleCurrentOrder" :current-page.sync="queryIn.page" :page-sizes="[3,20, 50, 100, 200]" :page-size="queryIn.pagesize" layout="total,sizes,prev,pager,next" :total="queryInTotal" />
					<el-button v-if="!currItem.isAdded" type="success" @click="inOrder" icon="el-icon-document" :loading="inLoading">采购订单入库</el-button>
					<el-button @click="openOrderVisible=false">取消退出</el-button>
				</div>
			</div>
		</el-dialog>
	</section>
</template>

<script>
import { mapState } from "vuex";
export default {
	computed: {
		...mapState(["checkStatus", "floor", "seatList"])
	},
	data() {
		return {
			isAdded: false,
			setting: null,
			listLoading: false,
			gridList: [],
			query: {
				page: 1,
				pagesize: 50
			},
			total: 0,
			searchForm: {
				orderSerial: "",
				serial: "",
				sourceserial: "",
				productName: "",
				crmId: "",
				materialNo: "",
				deliveryDate: ""
			},
			searchLoading: false,
			currItem: null,
			crmOrderList: [],
			openOrderVisible: false,
			selectOrders: [],
			inLoading: false,
			storeLastId: 0,
			queryIn: {
				page: 1,
				pagesize: 50
			},
			queryInTotal: 0
		};
	},
	methods: {
		// 改变入库数量
		changeInCount(row) {
			this.$refs.exportTable.toggleRowSelection(row, row.incount > 0);
			this.updateStoreInData({
				id: row.id,
				incount: row.incount
			})
		},
		// 改变订单单价
		changeMetaPrice(row) {
			this.updateStoreInData({
				id: row.id,
				metaprice: row.metaprice
			})
		},
		updateStoreInData(data = {}) {
			let condition = {
				type: 'updateData',
				collectionName: 'storeIn',
				data: data,
				notNotice: true
			};
			console.log('changeMetaPrice', condition)
			this.$axios.$post('mock/db', { data: condition }).then(result => {
				console.log('changeMetaPrice', result)
			});
		},
		handleSelectionChange(val) {
			this.selectOrders = val.filter(item => {
				return item.id;
			});
		},
		checkSelectable(row) {
			return row.id && row.count >= 0 && row.incount >= 0;
		},
		// 提交入库
		inOrder() {
			//console.log(this.selectOrders);
			let storeIds = [], storeData = [], orderIds = [];
			this.selectOrders.forEach((item, index) => {
				if (item.id) {
					//debugger
					storeIds.push(item.id);
					orderIds = orderIds.concat(item.orderIds);
					let obj = {
						typeId: item.typeId,
                        storeTypeId: 1,
                        crmId:item.crmId,
						materialNo: item.materialNo,
						productId: item.productId,
						productName: item.productName,
						price: item.price,
						metaprice: item.metaprice,
						util: item.util,
						count: item.incount,
						incount: item.incount,
						atcount: item.incount,
						createByUser: this.$store.state.user.name,
						updateByUser: this.$store.state.user.name
					};
					if (item.store) {
						obj.storeId = item.store.id;
						obj.storeCount = item.store.count + item.incount;
					} else {
						this.storeLastId++;
						obj.id = this.storeLastId;
						obj.storeCount = item.incount;
					}
					storeData.push(obj);
				}
			});
           /*  console.log('storeData', storeData)
            return; */
			if (!storeIds.length) {
				this.$message.error("请选择需要入库的订单！");
				return;
			}
			this.inLoading = true;
			let condition = {
				type: "updatePatch",
				collectionName: "storeIn",
				notNotice: true,
				param: { id: { $in: storeIds } },
				set: {
					$set: {
						isAdded: true,
						updateByUser: this.$store.state.user.name,
						updateDate: new Date().getTime()
					}
				}
			};
			console.log("inOrder", condition, storeData, orderIds);
            /* debugger
            return; */
			this.$confirm("确定将所选采购订单入库, 是否继续?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				// 先更新订单的状态
				this.$axios.$post("mock/db", { data: condition }).then(result => {
					// 加入仓库
					let cn = {
						type: "addStore",
						collectionName: "store",
						data: storeData
					};
					this.$axios.$post("mock/db", { data: cn }).then(res1 => {
						// 更新原始订单流程状态
						let orderCn = {
							type: "updatePatch",
							collectionName: "order",
							notNotice: true,
							param: { id: { $in: orderIds } },
							set: {
								$set: {
									flowStateId: 3
								}
							}
						}
						this.$axios.$post("mock/db", { data: orderCn }).then(res2 => {
							this.inLoading = false;
							this.selectOrders = [];
							this.crmOrderList = [];
							this.openOrderVisible = false;
							this.inLoading = false;
							this.submitSearch(true);
						});
					});
				});

			}).catch(() => {
				this.inLoading = false;
			});
		},
		handleSizeOrder(val) {
			this.queryIn.pagesize = val;
			this.showDetail(this.currItem);
		},
		handleCurrentOrder(val) {
			this.queryIn.page = val;
			this.showDetail(this.currItem);
		},
		// 显示明细
		async showDetail(row) {
			let crm = _.find(this.setting.crm, { id: row.crmId });
			//console.log('searchForm', this.searchForm);
			this.currItem = _.merge(row, {
				contactName: crm.contactName,
				contactPhone: crm.contactPhone,
				address: crm.address
			});
			let params = {
				crmId: row.crmId,
				isAdded: row.isAdded,
				typeId: row.typeId,
				orderSerial: row.orderSerial
			}
			// 查询供应商的具体订单
			let condition = {
				type: "aggregate",
				collectionName: "storeIn",
				data: params,
				aggregate: [
					{
						$lookup: {
							from: "store",
							localField: "materialNo",
							foreignField: "materialNo",
							as: "store"
						}
					},
					{
						$unwind: {
							path: "$store",
							preserveNullAndEmptyArrays: true // 空的数组也拆分
						}
					},
					{ $match: params },
					{ $sort: { finishedDate: 1 } },
					{ $skip: (this.queryIn.page - 1) * this.queryIn.pagesize },
					{ $limit: this.queryIn.pagesize }
				]
			};
			let result = await this.$axios.$post("mock/db", { data: condition });
			//debugger
			this.queryInTotal = result.total;
			this.crmOrderList = result.list;
			this.crmOrderList.push({ serial: "当前合计" });
			this.parseAllOrderMoney();
			this.openOrderVisible = true;
			this.$nextTick(() => {
				this.checkedOrder(); //每次更新了数据，触发这个函数即可。
			});
		},
		checkedOrder() {
			this.crmOrderList.forEach((item, i) => {
				if (item.id) {
					this.$refs.exportTable.toggleRowSelection(this.crmOrderList[i], true);
				}
			});
		},
		setOrderParams(flag) {
			this.isAdded = flag;
			this.query.page = 1;
			this.getList();
		},
		parseAllOrderMoney(flag) {
			let money = 0,
				count = 0;
			this.crmOrderList.forEach((item, index) => {
				if (index < this.crmOrderList.length - 1) {
					count += item.incount;
					money += item.incount * item.metaprice;
				}
			});
			//debugger
			this.crmOrderList[this.crmOrderList.length - 1]["incount"] = count;
			this.crmOrderList[this.crmOrderList.length - 1]["allPrice"] = money;
			return this.$options.filters["currency"](money);
		},
		parseReleaseMoney(row) {
			let money = row.incount * row.metaprice;
			row.allPrice = money;
			return this.$options.filters["currency"](money);
		},
		parseDate(date, format) {
			return date ? moment(date).format(format || "YYYY-MM-DD") : "";
		},
		submitSearch(flag, re) {
			let params = {};
			for (let k in this.searchForm) {
				if (this.searchForm[k] && this.searchForm[k] != "") {
					if (_.isNumber(this.searchForm[k])) {
						params[k] = Number(this.searchForm[k]);
					} else if (_.isBoolean(this.searchForm[k])) {
						params[k] = this.searchForm[k];
					} else if (_.isArray(this.searchForm[k]) && k === "deliveryDate") {
						params[k] = {
							$gte: this.searchForm[k][0],
							$lt: this.searchForm[k][1] + 24 * 3600 * 1000
						};
					} else if (_.isArray(this.searchForm[k])) {
						params[k] = { $in: this.searchForm[k] };
					} else {
						params[k] = { $regex: this.searchForm[k] };
					}
				}
			}
			if (re) {
				return params;
			}
			if (!flag) {
				// 不需要再做分页复位
				this.query = {
					page: 1,
					pagesize: 50
				};
			}
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
		// 从临时仓库中获取数据
		async getList(match = {}) {
			this.listLoading = true;
			match = _.merge({ typeId: 1, isAdded: this.isAdded }, match);
			let groupId = { crmId: "$crmId", orderSerial: "$orderSerial" };
			let condition = {
				type: "groupList",
				collectionName: "storeIn",
				data: match,
				distinct: "crmId",
				groupCount: [
					{ $match: match },
					{ $group: { _id: groupId } },
					{ $group: { _id: null, total: { $sum: 1 } } }
				],
				aggregate: [
					{ $match: match },
					{
						$group: {
							_id: groupId, // 按字段分组
							id: { $first: "$id" },
							isAdded: { $first: "$isAdded" },
							orderIds: { $first: "$orderIds" },
							orderSerial: { $first: "$orderSerial" },
							serial: { $first: "$serial" },
							sourceserial: { $first: "$sourceserial" },
							crmId: { $first: "$crmId" },
							crmName: { $first: "$crmName" },
							productName: { $first: "$productName" },
							finishedDate: { $first: "$finishedDate" },
							deliveryDate: { $first: "$deliveryDate" },
							updateDate: { $first: "$updateDate" },
							total: { $sum: 1 }
						}
					},
					{ $sort: { deliveryDate: 1, crmId: 1 } },
					{ $skip: (this.query.page - 1) * this.query.pagesize },
					{ $limit: this.query.pagesize }
				]
			};
			let result = await this.$axios.$post("mock/db", { data: condition });
			console.log(result)
			this.total = result.total;
			this.gridList = result.list;
			this.listLoading = false;
			console.log("this.gridList", this.gridList);
		},
		async getSetting() {
			let condition = {
				type: "getData",
				collectionName: "setting",
				data: {}
			};
			let result = await this.$axios.$post("mock/db", { data: condition });
			if (result) {
				this.setting = result.content;
			}
		},
		async _getLastId() {
			// 仓库待入库Id
			let cn = {
				type: "getId",
				data: {
					model: "store"
				}
			};
			let res = await this.$axios.$post("mock/db", { data: cn });
			if (res) {
				console.log("lastId-storeId", res);
				this.storeLastId = res;
			}
		}
	},
	created() {
		this.getSetting();
	},
	mounted() {
		this.getList();
		this._getLastId();
	}
};
</script>

<style lang="scss" scoped>
@import "~/assets/scss/order.scss";
</style>

