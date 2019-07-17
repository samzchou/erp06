<template>
	<section class="list-container">
		<div class="search-form">
			<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
				<el-form-item label="发票号：" prop="invoiceNumber">
					<el-input v-model="searchForm.invoiceNumber" clearable style="width:150px" />
				</el-form-item>
				<!-- <el-form-item label="系统订单号：" prop="serial">
					<el-input v-model="searchForm.serial" clearable style="width:150px" />
				</el-form-item>
				<el-form-item label="蒂森订单号：" prop="sourceserial">
					<el-input v-model="searchForm.sourceserial" clearable style="width:150px" />
				</el-form-item>
				<el-form-item label="项目号：" prop="projectNo">
					<el-input v-model="searchForm.projectNo" clearable style="width:150px" />
				</el-form-item>
				<el-form-item label="项目名称：" prop="projectName">
					<el-input v-model="searchForm.projectName" clearable style="width:150px" />
				</el-form-item> -->
				<el-form-item label="开票日期：" prop="createDate">
					<el-date-picker v-model="searchForm.createDate" value-format="timestamp" type="daterange"
						range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable
						unlink-panels style="width:250px" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="submitSearch">搜索</el-button>
				</el-form-item>
			</el-form>
		</div>
		<div class="table-content">
			<el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe
				size="mini" max-height="500" style="width:100%" @selection-change="handleSelectionChange">
				<el-table-column type="selection" width="50" align="center" />
				<el-table-column type="expand">
					<template slot-scope="scope">
						<el-row :gutter="20" v-for="(item,idx) in scope.row.result" :key="idx">
							<el-col :span="4"><span style="width:30px">{{idx+1}}、</span>项目号：{{item.projectNo}}</el-col>
							<el-col :span="6">项目名称：{{item.projectName}}</el-col>
							<el-col :span="3">订单号：{{item.sourceserial}}</el-col>
							<el-col :span="4">订单合计数：{{item.orderIds.length}}</el-col>
							<el-col :span="4">总金额(含税)：{{item.price | currency}}</el-col>
							<el-col :span="3">交货日期：{{parseDate(item.deliveryDate)}}</el-col>
						</el-row>
					</template>
				</el-table-column>
				<el-table-column type="index" width="70" label="序号" align="center">
					<template slot-scope="scope">
						<span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
					</template>
				</el-table-column>
				<el-table-column prop="invoiceNumber" label="发票号" width="150" />

				<el-table-column prop="crmName" label="客户" width="240">
					<span>蒂森克虏伯电梯（上海）有限公司</span>
				</el-table-column>
				<el-table-column prop="createDate" label="开票日期" width="100">
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.createDate)}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="slv" label="税率" width="60">
					<template slot-scope="scope">
						<span>{{scope.row.slv}}%</span>
					</template>
				</el-table-column>
				<el-table-column prop="slvMoney" label="税额" width="100">
					<template slot-scope="scope">
						<span>{{scope.row.slvMoney | currency("",4)}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="payPrice" label="开票金额" width="120">
					<template slot-scope="scope">
						<span>{{scope.row.payPrice | currency("",4)}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="allPrice" label="总金额(含税)" width="120">
					<template slot-scope="scope">
						<span>{{scope.row.allPrice | currency("",4)}}</span>
					</template>
				</el-table-column>
				<el-table-column prop="createByUser" label="开票人" width="80" />
				<el-table-column prop="content" label="备注" />
				<el-table-column label="操作" width="170" align="center">
					<template slot-scope="scope">
						<el-button type="text" icon="el-icon-document" @click="showDetail(scope.row)">查看详情</el-button>
						<el-button type="text" icon="el-icon-delete" @click="reInvoice(scope.row)">重新开票</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="page-container">
				<div>
					<span style="margin-right:15px;">共计{{total}}个已开票订单</span>
					<el-button size="mini" type="primary" @click="submitExport" :disabled="!selectRows.length">导出
					</el-button>

					<el-button size="mini" type="danger" @click="exportXML"
						:disabled="!selectRows.length || exportLoading"
						:icon="exportLoading?'el-icon-loading':'el-icon-download'">导出XML
					</el-button>
				</div>
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange"
					:current-page.sync="query.page" :page-sizes="[20, 50, 100, 200, 500]" :page-size="query.pagesize"
					layout="total,sizes,prev,pager,next" :total="total">
				</el-pagination>
			</div>
		</div>
		<el-dialog class="invoice-dialog" title="开票详情" append-to-body :close-on-click-modal="false"
			:visible.sync="openDialogVisible" width="75%">
			<div>
				<el-table :data="currOrders" border fit highlight-current-row stripe size="mini" max-height="450"
					style="width:100%">
					<el-table-column type="index" label="序号" align="center" width="55" />
					<el-table-column prop="serial" label="系统单号" width="150" />
					<el-table-column prop="sourceserial" label="蒂森单号" width="100" />
					<el-table-column prop="projectName" label="项目名称" />
					<el-table-column prop="materialNo" label="物料号" width="120" />
					<el-table-column prop="productName" label="物料描述" />
					<el-table-column prop="count" label="数量" width="80" />
					<el-table-column prop="util" label="单位" width="60" />
					<el-table-column prop="price" label="单价" width="100" />
				</el-table>
			</div>
		</el-dialog>
	</section>
</template>
<script>
import x2js from 'x2js';
export default {
	data: () => ({
		dsCrm: {},
		setting: {},
		searchForm: {
			invoiceNumber: '',
			/* serial: '',
			sourceserial: '',
			projectNo: '',
			projectName: '', */
			createDate: '',
			//deliveryDate: ''
		},
		listLoading: false,
		query: {
			page: 1,
			pagesize: 500
		},
		gridList: [],
		total: 0,
		selectRows: [],
		allPrice: 0,
		openDialogVisible: false,
		currOrders: [],
		orderIds: [],
		exportLoading: false,

	}),
	methods: {
		// 重新删除并开票
		reInvoice(row) {
			this.$confirm('将删除该已开票数据并退回重新开票, 是否继续?', '提示', {
				confirmButtonText: '确定',
				cancelButtonText: '取消',
				type: 'warning'
			}).then(() => {
				console.log('reInvoice', row);
				let orderIds = [];
				row.result.forEach(item => {
					orderIds = orderIds.concat(item.orderIds);
				});
                console.log('orderIds', orderIds);
                //return;
				// 更新原始订单状态
				let condition = {
					type: "updatePatch",
					collectionName: "order",
					param: { id: { $in: orderIds } },
					set: {
						$set: {
							'isPayed': false,
							'flowStateId': 10,
							'updateByUser': this.$store.state.user.name,
							'updateDate': new Date().getTime()
						}
					}
				};
				this.$axios.$post("mock/db", { data: condition }).then(result => {
					if(result){
                        // 删除已开票数据
                        let cn = {
                            type: 'removePatch',
                            collectionName: 'finance',
                            notNotice:true,
                            data: { "invoiceNumber": row.invoiceNumber }
                        };
                        this.$axios.$post('mock/db', { data: cn }).then(res => {
                            this.$message({
                                type: 'success',
                                message: '删除成功!'
                            });
                            this.submitSearch(true);
                        });
                    }
					
				});

			}).catch(() => { });
		},
		showDetail(row) {
			let ids = this.getAllOrderIds([row]);
			this.getOrders(ids).then(res => {
				this.currOrders = _.sortBy(res, ['projectNo']);
				//console.log('this.currOrders', this.currOrders);
				this.openDialogVisible = true;
			});
		},
		// 导出XML
		exportXML() {
			this.exportLoading = true;
			const x2jsone = new x2js({
				attributePrefix: "$"
			});
			let exportData = [], num = 1;
			let ids = this.getAllOrderIds(this.selectRows);

			this.getOrders(ids).then(res => {
				res = _.sortBy(res, ['projectNo']);
				res.forEach(order => {
					let obj = {
						"Xh": num,
						"Spmc": order.productName,
						"Ggxh": order.materialNo,
						"Jldw": order.util,
						"Spbm": "1090115040000000000",
						"Qyspbm": "",
						"Syyhzcbz": "",
						"Lslbz": "",
						"Yhzcsm": "",
						"Dj": order.price,
						"Sl": order.count,
						"Je": order.price * order.count,
						"Slv": this.dsCrm.slv / 100,
						"Kce": ""
					}
					exportData.push(obj);
					num++;
				});
				//console.log('exportData', exportData);
				var testObjC = {
					'Kp': {
						'Version': '2.0',
						'Fpxx': {
							"Zsl": 1,
							"Fpsj": {
								"Fp": {
									"Djh": "41501",
									"Gfmc": this.dsCrm.name, //"蒂森克虏伯电梯（上海）有限公司",
									"Gfsh": this.dsCrm.revenueNo, //"9131000060736170XA"
									"Gfyhzh": this.dsCrm.bank, //"德意志银行（中国）有限公司上海分行 3509965015",
									"Gfdzdh": this.dsCrm.address, //"上海市松江工业区佘山分区勋业路2号 021 37869898",
									"Bz": "",
									"Fhr": "张士明",
									"Skr": "张士明",
									"Spbmbbh": this.dsCrm.slv,
									"Hsbz": "0",
									"Spxx": {
										"Sph": exportData
									}
								}
							}
						}
					}
				}
				var xmlDocStr = x2jsone.js2xml(testObjC);
				const blob = new Blob([xmlDocStr], { type: 'text/xml' });
				const fileName = `${moment(new Date()).format("YYYY-MM-DD")}.xml`;
				const link = document.createElement('a');
				link.href = window.URL.createObjectURL(blob);
				link.download = fileName;
				link.click();
				window.URL.revokeObjectURL(link.href);
				link.remove();
				//console.log(xmlDocStr);
				setTimeout(() => {
					this.exportLoading = false;
				}, 1500);
			});

			/* this.selectRows.forEach(item => {
				item.orders.forEach(order => {
					let obj = {
						"Xh": num,
						"Spmc": order.productName,
						"Ggxh": order.materialNo,
						"Jldw": order.util,
						"Spbm": "1090115040000000000",
						"Qyspbm": "",
						"Syyhzcbz": "",
						"Lslbz": "",
						"Yhzcsm": "",
						"Dj": order.price,
						"Sl": order.count,
						"Je": order.price * order.count,
						"Slv": this.dsCrm.slv / 100,
						"Kce": ""
					}
					exportData.push(obj);
					num++;
				})
			}); */


		},
		// 导出汇总
		exportcollect() {
			let exportData = [], num = 1, startDate = 9999999999999, endDate = 0, total_allPrice = 0, total_slvPrice = 0, total_price = 0;
			this.selectRows.forEach(item => {
				item.orders.forEach(order => {
					if (order.orderDate < startDate) {
						startDate = order.orderDate;
					}
					if (order.orderDate > endDate) {
						endDate = order.orderDate;
					}
				});
				let obj = {
					"num": num,
					"invoiceNumber": item.invoiceNumber,
					"createDate": item.createDate,
					"allPrice": this.$options.filters["currency"](item.price - item.price * this.dsCrm.slv / 100, ''),
					"slvPrice": this.$options.filters["currency"](item.price * this.dsCrm.slv / 100, ''),
					"price": this.$options.filters["currency"](item.price, ''),
					"sourceserial": item.sourceserial
				};
				total_allPrice += item.price - item.price * this.dsCrm.slv / 100;
				total_slvPrice += item.price * this.dsCrm.slv / 100;
				total_price += item.price;
				exportData.push(obj);
				num++;
			});
			exportData.push({
				"num": "总计",
				"allPrice": this.$options.filters["currency"](total_allPrice, ''),
				"slvPrice": this.$options.filters["currency"](total_slvPrice, ''),
				"price": this.$options.filters["currency"](total_price, '')
			})
			import("@/components/Export2Excel").then(excel => {
				const tHeader = ["序号", "发票号码", "发票日期", "金额", "税额", "合计", "订单号"];
				const filterVal = ["num", "invoiceNumber", "createDate", "allPrice", "slvPrice", "price", "sourceserial"];
				const data = this.formatJson(filterVal, exportData);
				excel.export_json_to_excel({
					header: tHeader,
					data,
					filename: "发票汇总" + moment(startDate).format("MM.DD") + '-' + moment(endDate).format("MM.DD"),
					autoWidth: true,
					bookType: "xlsx"
				});
			});
		},
		// 导出明细
		exportDetail() {
			let exportData = [], num = 1, startDate = 9999999999999, endDate = 0;
			this.selectRows.forEach(item => {
				item.orders.forEach(order => {
					if (order.orderDate < startDate) {
						startDate = order.orderDate;
					}
					if (order.orderDate > endDate) {
						endDate = order.orderDate;
					}
					exportData.push({
						"num": num,
						"invoiceNumber": item.invoiceNumber,
						"crmName": item.crmName,
						"revenueNo": this.dsCrm.revenueNo,
						"bank": this.dsCrm.bank,
						"address": this.dsCrm.address,
						"createDate": item.createDate,
						"productName": order.productName,
						"materialNo": order.materialNo,
						"modelNo": order.modelNo,
						"util": order.util,
						"count": order.count,
						"price": order.price,
						"allPrice": order.price * order.count,
						"slv": this.dsCrm.slv / 100,
						"slMoney": this.$options.filters["currency"](order.price * order.count * this.dsCrm.slv / 100, '')
					})
					num++;
				})
			});
			import("@/components/Export2Excel").then(excel => {
				const tHeader = ["序号", "发票号码", "购方企业名称", "购方税号", "银行账号", "地址电话", "开票日期", "商品名称", "物料号", "规格", "单位", "数量", "单价", "金额", "税率", "税额"];
				const filterVal = ["num", "invoiceNumber", "crmName", "revenueNo", "bank", "address", "createDate", "productName", "materialNo", "modelNo", "util", "count", "price", "allPrice", "slv", "slMoney"];
				const data = this.formatJson(filterVal, exportData);
				excel.export_json_to_excel({
					header: tHeader,
					data,
					filename: "发票明细" + moment(startDate).format("MM.DD") + '-' + moment(endDate).format("MM.DD"),
					autoWidth: true,
					bookType: "xlsx"
				});
			});
		},

		splitSerial(serial) {
			let s = serial.split('-');
			return s.length ? s[1] : serial;
		},
		parseDate(date, format) {
			if (!date) return '';
			return moment(date).format(format || 'YYYY-MM-DD');
		},
		parseMoney(row) {
			return this.$options.filters['currency'](row.count * row.price);
		},
		handleSelectionChange(rows) {
			this.selectRows = rows;
			this.orderIds = this.getAllOrderIds(rows);
			//console.log(this.orderIds);
		},
		getAllOrderIds(rows) {
			let ids = [];
			rows.forEach(item => {
				item.result.forEach(order => {
					ids = ids.concat(order.orderIds); //this.orderIds.concat()
				})
			});
			return ids;
		},
		submitExport() {
			let arr = _.cloneDeep(this.selectRows);
			//this.allPrice = 0;
			let allSlvMoney = 0, allPayPrice = 0, allTotal = 0;
			arr.forEach(item => {
				allSlvMoney += item.slvMoney;
				allPayPrice += item.payPrice;
				allTotal += item.allPrice;
			});
			arr.push({
				invoiceNumber: '合计',
				slvMoney: allSlvMoney,
				payPrice: allPayPrice,
				allPrice: allTotal
			});

			import('@/components/Export2Excel').then(excel => {
				const tHeader = ['开票日期', '开票人', '发票号', '税率', '税额', '开票金额', '总金额(含税)'];
				const filterVal = ['createDate', 'createByUser', 'invoiceNumber', 'slv', 'slvMoney', 'payPrice', 'allPrice'];
				const data = this.formatJson(filterVal, arr);
				const now = moment(new Date()).format('YYYYMMDD');
				excel.export_json_to_excel({
					header: tHeader,
					data,
					filename: '发票汇总-' + now
				});
			})
		},
		formatJson(filterVal, jsonData) {
			return jsonData.map(v => filterVal.map(j => {
				if (j == 'createDate') {
					v[j] = this.parseDate(v[j]);
				} else if (['allPrice', 'slvPrice', 'price'].includes(j)) {
					v[j] = this.$options.filters['currency'](v[j], ''); //this.parseMoney(v[j], true);
				} else if (j == 'slv') {
					v[j] = v[j] ? (v[j] + '%') : '';
				}
				return v[j];
			}))
		},


		submitSearch(flag) {
			let params = {};
			for (let k in this.searchForm) {
				if (this.searchForm[k] != '' && this.searchForm[k]) {
					if (_.isNumber(this.searchForm[k])) {
						params[k] = Number(this.searchForm[k]);
					} else if (_.isArray(this.searchForm[k]) && (k === 'createDate')) {
						params[k] = {
							$gte: this.searchForm[k][0],
							$lt: this.searchForm[k][1] + 24 * 3600 * 1000 - 1
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
			let groupId = { "invoiceNumber": "$invoiceNumber" };
			let condition = {
				type: 'groupList',
				collectionName: 'finance',
				data: _.merge({ payType: 2 }, match),
				distinct: "invoiceNumber",
				/* groupCount: [
					{ $match: match },
					{ $group: { _id: groupId } }
				], */
				aggregate: [
					{ "$match": _.merge({ payType: 2 }, match) },
					{
						"$group": {
							"_id": groupId, // 按字段分组
							"id": { "$first": "$id" },
							"invoiceNumber": { "$first": "$invoiceNumber" },
							"crmName": { "$first": "$crmName" },
							"createDate": { "$first": "$createDate" },
							"createByUser": { "$first": "$createByUser" },
							"content": { "$first": "$content" },
							"allPrice": { "$sum": "$price" },
							"total": { $sum: 1 },
							"result": { "$push": "$$ROOT" }
						}
					}
				]
			};
			let result = await this.$axios.$post('mock/db', { data: condition });
			this.total = result.total;
			this.gridList = result.list.map(item => {
				item.slv = this.dsCrm.slv;
				item.slvMoney = item.allPrice * this.dsCrm.slv / 100 / 1.13; // 税额
				item.payPrice = item.allPrice - item.slvMoney; // 订单金额
				return item;
			});
			//console.log('result', result);
			this.listLoading = false;
		},
		async getOrders(ids) {
			let cn = {
				type: 'listData',
				collectionName: 'order',
				data: { id: { $in: ids } }
			};
			return new Promise((resolve, reject) => {
				this.$axios.$post('mock/db', { data: cn }).then(res => {
					resolve(res.list)
				});
			});
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
				this.dsCrm = _.find(this.setting.crm, { id: 4 });
				this.getList();
			}
		}
	},
	mounted() {

	},
	created() {
		this.getSetting();
	}
}
</script>


<style lang="scss" scoped>
@import "~/assets/scss/order.scss";
.list-container {
	padding: 20px 0;
}
.invoice-dialog {
	/deep/ .el-dialog__body {
		padding: 0;
		.btns {
			padding: 10px;
			display: flex;
			justify-content: center;
		}
	}
}
</style>

