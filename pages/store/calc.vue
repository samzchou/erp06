<template>
	<section>
		<div class="page-title">
			<div>
				<span>库存列表</span>
			</div>
		</div>
		<div class="grid-container">
			<div class="search-content">
				<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
					<el-form-item label="业务类型：" prop="typeId">
						<el-select v-model="searchForm.typeId" placeholder="请选择" style="width:100px" v-if="setting" clearable="" @change="submitSearch">
							<el-option v-for="typeItem in setting.type" :key="typeItem.id" :label="typeItem.name" :value="typeItem.id" />
						</el-select>
					</el-form-item>
                    <el-form-item label="供应商：" prop="crmId">
						<el-select v-model="searchForm.crmId" placeholder="请选择" clearable>
							<el-option v-for="crm in crmList.filter(o=>o.typeId==1)" :key="crm.id" :label="crm.name" :value="crm.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="货品名称：" prop="productName">
						<el-input v-model="searchForm.productName" clearable style="width:140px" />
					</el-form-item>
					<el-form-item label="物料号：" prop="materialNo">
						<el-input v-model="searchForm.materialNo" clearable style="width:140px" />
					</el-form-item>
					<el-form-item label="库存小于：" prop="count">
						<el-input v-model="searchForm.count" clearable style="width:70px" />
					</el-form-item>
					<el-form-item label="最后更新：" prop="updateDate">
						<el-date-picker v-model="searchForm.updateDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
					</el-form-item>
				</el-form>
			</div>
			<div id="printTable">
				<el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500">
					<el-table-column label="序号" type="index" width="50" align="center">
						<template slot-scope="scope">
						    <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                        </template>
					</el-table-column>
                    <el-table-column label="物料来源" prop="typeId" width="80">
						<template slot-scope="scope">{{parseType(scope.row.typeId)}}</template>
					</el-table-column>
					<el-table-column label="物料名称" prop="productName">
						<template slot-scope="scope">{{scope.row.product && scope.row.product.name}}</template>
					</el-table-column>
					<el-table-column label="物料号/版本号" prop="materialNo" width="150" />
					<el-table-column prop="util" label="单位" width="70">
						<template slot-scope="scope">
							<span>{{scope.row.util}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="atcount" label="总入库量" width="70">
						<template slot-scope="scope">
							<span>{{scope.row.incount}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="outcount" label="总出库量" width="70">
						<template slot-scope="scope">
							<span>{{scope.row.outcount}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="count" label="当前库存" width="100">
						<template slot-scope="scope">
							<span>{{scope.row.count}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="losscount" label="遗失总量" width="100">
						<template slot-scope="scope">
							<span>{{scope.row.losscount||0}}</span>
							<el-button type="text" icon="el-icon-edit" style="margin-left:5px;" @click="updateloss(scope.row, 1)" />
						</template>
					</el-table-column>
					<el-table-column prop="scrappcount" label="报废总量" width="100">
						<template slot-scope="scope">
							<span>{{scope.row.scrapcount||0}}</span>
							<el-button type="text" icon="el-icon-edit" style="margin-left:5px;" @click="updateloss(scope.row, 2)" />
						</template>
					</el-table-column>
					<el-table-column prop="incount" label="未来采购量">
						<template slot-scope="scope">
							<span :class="{'warning':scope.row.incount==0}">
								<span style="margin-right:10px;">{{parseMaterialNo(scope.row)}}</span>
								<span v-if="scope.row.orderCount && scope.row.orderCount>scope.row.count" style="color:red">库存缺少 {{scope.row.orderCount - scope.row.count}}</span>
							</span>
						</template>
					</el-table-column>
					<el-table-column prop="updateDate" label="最后更新" width="120">
						<template slot-scope="scope">
							<span>{{parseDate(scope.row.updateDate)}}</span>
						</template>
					</el-table-column>
					<el-table-column prop="updateByUser" label="操作人" width="90" />
				</el-table>
			</div>
			<div class="page-container">
				<div></div>
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200,500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total"></el-pagination>
			</div>
		</div>
		<el-dialog title="更新库存遗失或损耗" append-to-body :visible.sync="openDialogVisible" width="480px">
			<div style="margin-top:-10px" v-if="editRow">
				<div style="padding-bottom:10px;line-height:20px;border-bottom:1px solid #DDD">
					物料名称：{{editRow.productName}}；<br />物料号：{{editRow.materialNo}}；<br />总入库：{{editRow.atcount}}；总出库：{{editRow.outcount}}；当前可用库存：{{getUseCount(editRow)}}；总遗失：{{editRow.losscount}}；总报废：{{editRow.scrapcount}}
				</div>
				<div class="compare" style="padding-top:10px">
					<el-form :model="lossForm" ref="ruleForm" :inline="true" label-width="80px">
						<el-form-item label="总遗失" prop="lostcount">
							<el-input-number size="mini" v-model="lossForm.losscount" controls-position="right" :min="0" :step="1" @change="checkLoss" placeholder="请输入数量" />
						</el-form-item>
						<el-form-item label="总报废" prop="scrapcount">
							<el-input-number size="mini" v-model="lossForm.scrapcount" controls-position="right" :min="0" :step="1" @change="checkScrap" placeholder="请输入数量" />
						</el-form-item>
					</el-form>
				</div>
			</div>
			<div class="sub-btns">
				<el-button size="mini" type="primary" @click="submitEdit">确定</el-button>
				<el-button size="mini" @click="openDialogVisible=false">取消</el-button>
			</div>
		</el-dialog>
	</section>
</template>

<script>
export default {
	data() {
		return {
			openDialogVisible: false,
			afterOrderItem: null,
			currItem: null,
			afterOrderList: [],
			listLoading: false,
			total: 0,
			query: {
				page: 1,
				pagesize: 500
			},
			setting: {},
			crmList: [],
			flowList: [], //settings.flowState,
			typeList: [], //settings.type,
			storeNoList: [], //settings.storeNo,
			gridList: [],
			searchForm: {
                typeId: "",
                crmId:"",
				materialNo: "", //330171276/aa
				productName: "",
				count: ""
			},
			editRow: null,
			lossForm: {
				losscount: 0,
				scrapcount: 0
			},
			lossType: 1,
		};
	},
	methods: {
		getUseCount(row) {
            return row.incount - row.outcount - (row.losscount || 0) - (row.scrapcount || 0);
		},
		parseDate(date, format) {
			return moment(date).format(format || "YYYY-MM-DD");
		},
		parseType(id) {
			if (!id || id == "") return "";
			let type = _.find(this.typeList, { id: id });
			return type.name;
		},
		parseReleaseMoney(row) {
			return this.$options.filters["currency"](row.outcount * row.order.price);
		},
		checkLoss(val) {
			this.editRow.losscount = val;
		},
		checkScrap(val) {
			this.editRow.scrapcount = val;
		},
		updateloss(row, typeId) {
			this.lossForm = { losscount: row.losscount || 0, scrapcount: row.scrapcount || 0 };
			this.editRow = _.cloneDeep(row);
			this.lossType = typeId;
			this.openDialogVisible = true;
		},
		// 更新遗失或报废
		submitEdit() {
			let count = this.getUseCount(this.editRow);
			let row = _.merge(this.lossForm, this.editRow, { count: count, updateByUser: this.$store.state.user.name, updateDate: new Date().getTime() });
			let condition = {
				type: "updateData",
				collectionName: "store",
				updateDate: true,
				data: row
			};
			//console.log('submitEdit', row)
			this.$axios.$post("mock/db", { data: condition }).then(res => {
				this.openDialogVisible = false;
				let index = _.findIndex(this.gridList, { id: row.id });
				this.$set(this.gridList, index, row);
			});
		},

		// 比较物料号相同
		parseMaterialNo(row) {
			let order = _.find(this.afterOrderList, {
				materialNo: row.materialNo
			});

			let counts = order ? order.count : 0;
			row.orderCount = counts;
			return counts;
		},
		parseStoreNo(id) {
			if (!id || id == "") return "";
			let type = _.find(this.storeNoList, { id: id });
			return type.name;
		},
		parseFlow(id) {
			if (!id) return "";
			let flow = _.find(this.flowList, { id: id });
			return flow.name;
		},
		handleSizeChange(val) {
			this.query.pagesize = val;
			this.submitSearch(true);
		},
		handleCurrentChange(val) {
			this.query.page = val;
			this.submitSearch(true);
		},
		submitSearch(flag) {
			let params = {};
			for (let k in this.searchForm) {
				if (this.searchForm[k] != "" && this.searchForm[k]) {
					if (_.isNumber(this.searchForm[k])) {
						params[k] = Number(this.searchForm[k]);
					} else if (_.isArray(this.searchForm[k]) && k === "updateDate") {
						params[k] = {
							$gte: this.searchForm[k][0],
							$lte: this.searchForm[k][1]
						};
					} else if (_.isArray(this.searchForm[k])) {
						params[k] = { $in: this.searchForm[k] };
					} else {
						if (k === "count") {
							params[k] = { $lt: Number(this.searchForm[k]) };
						} else {
							params[k] = { $regex: this.searchForm[k] };
						}
					}
				}
			}
			if (!flag) {
				// 不需要再做分页复位
				this.query = {
					page: 1,
					pagesize: 20
				};
			}
			this.getList(params);
		},
		async getList(match = {}) {
			this.listLoading = true;
			let condition = {
				type: "aggregate",
				collectionName: "store",
				data: _.merge(match),
				aggregate: [
					{ $match: _.merge(match) },
					{
						$lookup: {
							from: "product",
							localField: "materialNo",
							foreignField: "materialNo",
							as: "product"
						}
					},
					{
						$unwind: {
							path: "$product",
							preserveNullAndEmptyArrays: true // 空的数组也拆分
						}
					},
					{ $sort: { materialNo: -1 } },
					{ $skip: (this.query.page - 1) * this.query.pagesize },
					{ $limit: this.query.pagesize }
				]
			};

			let result = await this.$axios.$post("mock/db", { data: condition });
			this.total = result.total;
			//debugger
			this.gridList = result.list;
			this.listLoading = false;
		},
		async getSetting() {
			let condition = {
				type: "getData",
				collectionName: "setting",
				data: {}
			};
			let result = await this.$axios.$post("mock/db", { data: condition });
			if (result) {
				//console.log('getSetting',result)
				this.setting = result.content;
				this.typeList = this.setting.type;
				this.flowList = this.setting.flowState;
				this.storeNoList = this.setting.storeNo;
				this.crmList = this.setting.crm;
				this.getList();
			}
		},
		async getBuys() {
			let params = {
                'flowStateId': { $in: [2, 6] }, //$in:[1,5] $lte:6 { $in: [2, 6] } {$gte:2,$lte:8}
                'isCanceled':false,
				//'dupdateDate': { $gte: new Date().getTime() - 24 * 3600 * 1000, $lte: new Date().getTime() + 24 * 3600 * 1000 * 10 } //deliveryDate
			};
			let condition = {
				type: "aggregate",
				collectionName: "order",
				data: params,
				aggregate: [
					{ $match: params },
					{
						$group: {
							_id: { materialNo: "$materialNo" }, // 按字段分组
							productName: { $first: "$productName" },
							materialNo: { $first: "$materialNo" },
							count: { $sum: "$count" },
							total: { $sum: 1 }
						}
					}
				]
			};
			//debugger
			let result = await this.$axios.$post("mock/db", { data: condition });
			//console.log("getBuys", result);
			this.afterOrderList = result.list;
		}
	},
	created() {
		this.getSetting();
		// 获取七天后的采购订单数据
		this.getBuys();
	},
	mounted() { }
};
</script>
<style lang="scss" scoped>
@import "~/assets/scss/order.scss";
</style>
