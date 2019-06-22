<template>
	<section class="list-container">
		<div class="search-form">
			<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
				<el-form-item label="系统订单号：" prop="serial">
					<el-input v-model="searchForm.serial" clearable style="width:150px" />
				</el-form-item>
				<el-form-item label="蒂森订单号：" prop="sourceserial" v-if="needSource">
					<el-input v-model="searchForm.sourceserial" clearable style="width:150px" />
				</el-form-item>
				<el-form-item label="项目号：" prop="projectNo">
					<el-input v-model="searchForm.projectNo" clearable style="width:150px" />
				</el-form-item>
				<el-form-item label="项目名称：" prop="projectName">
					<el-input v-model="searchForm.projectName" clearable style="width:150px" />
				</el-form-item>
				<el-form-item label="制单日期：" prop="orderDate">
					<el-date-picker v-model="searchForm.orderDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
				</el-form-item>
				<el-form-item label="交付日期：" prop="deliveryDate">
					<el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="submitSearch">搜索</el-button>
				</el-form-item>
			</el-form>
		</div>
		<div class="table-content">
			<el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500" @selection-change="handleSelectionChange" style="width:100%">
				<el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :gutter="20" v-for="(item,idx) in scope.row.result" :key="item.id">
                            <el-col :span="4"><span style="width:30px">{{idx+1}}、</span>物料号：{{item.materialNo}}</el-col>
                            <el-col :span="5">物料描述：{{item.productName}}</el-col>
                            <el-col :span="3">订单量：{{item.count}}</el-col>
                            <el-col :span="3">订单单价：{{item.price}}</el-col>
                            <el-col :span="3">总价：{{parseMoney(item)}}</el-col>
                        </el-row>
                        <!-- <div>{{scope.row.result}}</div> -->
                    </template>
                </el-table-column>
                <el-table-column type="selection" width="50" align="center" />
				<el-table-column prop="serial" label="系统订单号" width="90">
					<template slot-scope="scope">
						<span>{{scope.row.serial}}</span>
					</template>
				</el-table-column>
				<el-table-column label="蒂森订单号" width="100" v-if="needSource">
					<template slot-scope="scope">
						<span>{{scope.row.sourceserial}}</span>
					</template>
				</el-table-column>
                <!-- <el-table-column prop="boxNo" label="箱号" width="70" /> -->
				<el-table-column prop="projectNo" label="项目号" width="120" />
				<el-table-column prop="projectName" label="项目名称" />
				<el-table-column prop="total" label="订单总数" width="80">
					<template slot-scope="scope">
						<span>共 {{scope.row.total}} 件</span>
					</template>
				</el-table-column>
                <el-table-column label="税率" width="60">
					<template slot-scope="scope">
						<span>{{dsCrm.slv}}%</span>
					</template>
				</el-table-column>
                <el-table-column prop="slvMoney" label="税额" width="100">
					<template slot-scope="scope">
						<span>{{scope.row.slvMoney | currency}}</span>
					</template>
				</el-table-column>

                <el-table-column prop="orderMoney" label="订单金额" width="100">
					<template slot-scope="scope">
						<span>{{scope.row.orderMoney | currency}}</span>
					</template>
				</el-table-column>

				<el-table-column prop="orderTotalPrice" label="合计" width="100">
					<template slot-scope="scope">
						<span>{{scope.row.orderTotalPrice | currency}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="orderDate" label="制单日期" width="100">
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.orderDate)}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="deliveryDate" label="交付日期" width="100">
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.deliveryDate)}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="updateDate" label="最后更新" width="100">
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.updateDate)}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="updateByUser" label="操作人" width="80"/>
			</el-table>
			<div class="page-container">
				<div>
					<span style="margin-right:15px;">共计{{total}}个已出库送货的订单，请选择开票</span>
					<el-button size="mini" type="primary" @click="submitInvoice">开票</el-button>
				</div>
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200, 500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
				</el-pagination>
			</div>
		</div>
		<el-dialog class="invoice-dialog" title="订单开票" :visible.sync="openDialogVisible" :close-on-click-modal="false" width="70%">
			<div class="order-title" v-if="selectRows.length">
				<div style="font-weight:bold">开票总额：{{allPrice | currency}}</div>
				<div>
					<el-form size="mini" :inline="true" :model="payForm" :rules="payRules" ref="payForm" class="pay-form">
						<el-form-item label="发票号：" prop="invoiceNumber">
							<el-input v-model="payForm.invoiceNumber" placeholder="请填写发票号或单据号" clearable />
						</el-form-item>
						<el-form-item label="备注：" prop="content">
							<el-input v-model="payForm.content" placeholder="请填写备注" clearable style="width:300px;"/>
						</el-form-item>
						<el-form-item>
							<el-button size="mini" type="success" @click="payOrder" icon="my-icon-retweet">提交开票</el-button>
						</el-form-item>
					</el-form>
				</div>
			</div>
			<el-table :data="selectRows" border fit highlight-current-row stripe size="mini" max-height="500">
				<el-table-column prop="serial" label="系统订单号" width="150">
					<template slot-scope="scope">
						<span>{{scope.row.serial}}</span>
					</template>
				</el-table-column>
				<el-table-column label="蒂森订单号" width="120" v-if="needSource">
					<template slot-scope="scope">
						<span>{{scope.row.sourceserial}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="projectNo" label="项目号" width="150" />
				<el-table-column prop="projectName" label="项目名称" />
				<el-table-column prop="total" label="订单总数" width="100">
					<template slot-scope="scope">
						<span>共 {{scope.row.total}} 件</span>
					</template>
				</el-table-column>
				<el-table-column prop="orderTotalPrice" label="订单合计" width="100">
					<template slot-scope="scope">
						<span>{{scope.row.orderTotalPrice | currency}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="orderDate" label="制单日期" width="100">
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.orderDate)}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="deliveryDate" label="交付日期" width="100">
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.deliveryDate)}}</span>
					</template>
				</el-table-column>
			</el-table>
		</el-dialog>
	</section>
</template>

<script>
export default {
	data: () => ({
        setting: {},
        lastId:0,
        dsCrm:{},
		searchForm: {
			serial: '',
			sourceserial: '',
			projectNo: '',
			projectName: '',
			orderDate: '',
			deliveryDate: ''
		},
		needSource: true,
		listLoading: false,
		query: {
			page: 1,
			pagesize: 100
		},
		gridList: [],
		total: 0,
		selectRows: [],
		allPrice: 0,
		openDialogVisible: false,
		payForm: {
			invoiceNumber: '',
			content: ''
		},
		payRules: {
			invoiceNumber: [{ required: true, message: '请填写发票号或单据号', trigger: 'blur' }]
		}
	}),
	methods: {
		splitSerial(serial) {
			let s = serial.split('-');
			return s.length ? s[1] : serial;
		},
		parseDate(date, format) {
			if (!date) return '';
			return moment(date).format(format || 'YYYY-MM-DD');
        },
        
		parseMoney(row){
            return this.$options.filters['currency'](row.count*row.price);
        },
		handleSelectionChange(rows) {
			this.selectRows = rows;
			console.log(rows)
        },
		payOrder() {
			this.$refs['payForm'].validate((valid) => {
				if (valid) {
					
					this.$confirm("确定为已选中的订单开票?", "提示", {
						confirmButtonText: "确定",
						cancelButtonText: "取消",
						type: "warning"
					}).then(() => {
                        this.payLoading = true;
                        let orderIds = [], dataList = [];
                        this.selectRows.forEach(order => {
                            let ids = [];
                            order.result.forEach(item => {
                                ids.push(item.id);
                            });
                            orderIds = _.concat(orderIds, ids);
                            this.lastId++;
                            dataList.push({
                                'id':this.lastId,
                                'payType': 2,
                                'orderIds': ids,
                                'serial': order.serial,
                                'sourceserial': order.sourceserial,
                                'crmId': order.crmId,
                                'crmName': order.crmName,
                                "projectNo": order.projectNo,
                                "projectName": order.projectName,
                                "deliveryDate":order.deliveryDate,
                                'price': order.orderTotalPrice,
                                'invoiceNumber': this.payForm.invoiceNumber,
                                'createByUser': this.$store.state.user.name,
                                'content': this.payForm.content
                            });
                        });
                        // 添加财务数据
						let cn = {
							type: "addPatch",
                            collectionName: "finance",
                            data: dataList
						};
						this.$axios.$post("mock/db", { data: cn }).then(result => {
                            // 更新原始订单状态
							let condition = {
								type: "updatePatch",
								collectionName: "order",
								param: { id: { $in: orderIds } },
								set: {
									$set: {
										'isPayed': true,
                                        'flowStateId': 12,
										'updateByUser': this.$store.state.user.name,
										'updateDate': new Date().getTime()
									}
								}
							};
							this.$axios.$post("mock/db", { data: condition }).then(result => {
								this.payLoading = false;
                                this.selectRows = [];
                                this.$refs.payForm.resetFields();
								this.openDialogVisible = false;
								this.submitSearch(true);
							});
						});
					}).catch(() => { });
				}
			});
		},
		submitInvoice() {
			this.allPrice = 0;
			if (!this.selectRows.length) {
				this.$message.error('请选择开票项！');
				return;
			}
			this.selectRows.forEach(item => {
				this.allPrice += item.orderTotalPrice;
			})
			this.openDialogVisible = true;
		},
		submitSearch(flag) {
			let params = {};
			for (let k in this.searchForm) {
				if (this.searchForm[k] != '' && this.searchForm[k]) {
					if (_.isNumber(this.searchForm[k])) {
						params[k] = Number(this.searchForm[k]);
					} else if (_.isArray(this.searchForm[k]) && (k === 'orderDate' || k === 'deliveryDate')) {
						params[k] = {
							$gte: this.searchForm[k][0],
							$lte: this.searchForm[k][1] + 24 * 3600 * 1000
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
					pagesize: 20
				}
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
		async getList(match = {}) {
			this.listLoading = true;
			let groupId = { "sourceserial": "$sourceserial" };
			let bySerial = { 'sourceserial': { $ne: '' } };
			match = _.merge({ flowStateId: {$in:[10,11]}, isCanceled:false }, bySerial, match);
			let condition = {
				type: 'groupList',
				collectionName: 'order',
				data: match,
				distinct: "sourceserial",
				groupCount: [
					{ $match: match },
					{ $group: { _id: groupId } },
					{ $group: { _id: null, total: { $sum: 1 } } }
				],
				aggregate: [
					{ "$match": match },
					{
						"$group": {
							"_id": groupId, // 按字段分组
							"id": { "$first": "$id" },
							"serial": { "$first": "$serial" },
							"sourceserial": { "$first": "$sourceserial" },
							"projectNo": { "$first": "$projectNo" },
							"projectName": { "$first": "$projectName" },
                            "productName": { "$first": "$productName" },
                            "crmId":{ "$first": "$crmId" },
                            "crmName":{ "$first": "$crmName" },
							"boxNo": { "$first": "$boxNo" },
							"price": { "$first": "$price" },
							"count": { "$first": "$count" },
							"orderDate": { "$first": "$orderDate" },
							"deliveryDate": { "$first": "$deliveryDate" },
							"updateDate": { "$first": "$updateDate" },
							"updateByUser": { "$first": "$updateByUser" },
                            "payTotalPrice": { "$sum": { "$multiply": ["$metaprice", "$count"] } },
                            "orderTotalPrice": { "$sum": { "$multiply": ["$price", "$count"] } },
							"total": { $sum: 1 },
							"result": { "$push": "$$ROOT" }
						}
					},
					{ $sort: { deliveryDate: 1 } },
					{ $skip: (this.query.page - 1) * this.query.pagesize },
					{ $limit: this.query.pagesize }
				]
			};
            let result = await this.$axios.$post('mock/db', { data: condition });
            //this.gridList = result.list;
			this.total = result.total;
			console.log(result)
			this.gridList = result.list.map(item => {
                item.slvMoney = item.orderTotalPrice * this.dsCrm.slv / 100;
                item.orderMoney = item.orderTotalPrice - item.slvMoney;
				return item;
			});
			this.listLoading = false;
		},
		getCrm(arr) {
			let crm;
			for(let i=0; i<arr.length; i++){
                if(arr[i]['typeId'] == 2){
                    crm = _.find(this.setting.crm, {id:arr[i]['crmId']});
                    break;
                }
            }
			return crm;
		},
		checkFinished(row) {
			let countFinish = 0;
			row.result.forEach(item => {
				if ([3, 8].includes(item.flowStateId)) {
					countFinish++;
				}
			});
			console.log('countFinish', row, countFinish)
			return countFinish;
        },
        async _getLastId(){
            let condition = {
                type:"getId",
                data:{
                    model:'finance'
                }
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            if(result){
                this.lastId = result;
            }
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
                this.dsCrm = _.find(this.setting.crm, {id:4});
                //console.log('dsCrm',this.dsCrm)
				this.getList();
			}
		}
	},
	mounted() {
        this.getSetting();
	},
	created() {
        this._getLastId();
	}
}
</script>


<style lang="scss" scoped>
@import '~/assets/scss/order.scss';
.list-container {
	padding: 20px 0;
	
}
.invoice-dialog {
	/deep/ .el-dialog__body {
		padding: 10px 20px 20px;
		.order-title {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 10px 0px 20px;
		}
		.el-form {
			.el-form-item {
				margin-bottom: 0;
			}
		}
	}
}
</style>
