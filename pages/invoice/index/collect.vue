<template>
	<section class="list-container">
		<div class="search-form" v-loading="listLoading">
			<el-form :inline="true" :model="searchForm" :rules="searchRule" ref="searchForm" size="mini">
				<el-form-item label="起始日期：" prop="startDate">
					<el-date-picker v-model="searchForm.startDate" value-format="timestamp" type="date" placeholder="起始日期" style="width:250px" />
				</el-form-item>
				<el-form-item label="截止日期：" prop="endDate">
					<el-date-picker v-model="searchForm.endDate" value-format="timestamp" type="date" placeholder="截止日期" style="width:250px" />
				</el-form-item>
				<el-form-item>
					<el-button size="mini" type="primary" @click="exportExcel(1)">生成汇总</el-button>
					<el-button size="mini" type="warning" @click="exportExcel(2)">生成明细清单</el-button>
				</el-form-item>
			</el-form>
		</div>
	</section>
</template>
<script>
export default {
	data: () => ({
		listLoading: false,
		setting: {},
		dsCrm: {},
		searchForm: {
			startDate: '',
			endDate: ''
		},
		searchRule: {
			startDate: [{ type: 'date', required: true, message: '请选择起始日期：', trigger: 'change' }],
			endDate: [{ type: 'date', required: true, message: '请选择截止日期：', trigger: 'change' }]
		},
		typeId: 1,
		loadingMask: null,
		gridList: [],
		allPrice: 0,

	}),
	methods: {
		parseDate(date, format) {
			if (!date) return '';
			return moment(date).format(format || 'YYYY-MM-DD');
		},
		// 生成汇总
		exportExcel(type) {
			this.$refs['searchForm'].validate((valid) => {
				if (valid) {
					this.typeId = type;
					this.loadingMask = this.$loading({ background: 'rgba(0, 0, 0, 0.5)' });
					let params = {
						createDate: {
							$gte: this.searchForm['startDate'],
							$lte: this.searchForm['endDate']
						}
					}
					this.getFinanceList(params);
				}
			});
		},
		async getFinanceList(match = {}) {
			let condition = {
				type: 'listData',
				collectionName: 'finance',
				data: _.merge({ payType: 2 }, match),
				sortby: 'createDate'
			}
			let result = await this.$axios.$post('mock/db', { data: condition });
			if (this.typeId == 1) {
                this.setCollectData(result.list);
			} else {
                this.setDetailData(result.list);
			}
        },
        setDetailData(list){
            let arr = [], num = 1;
            list.forEach((item,idx)=>{
                this.getOrders(item.orderIds).then(res=>{
                    res.forEach(order=>{
                        order.num = num;
                        order.crmName = this.dsCrm.name;
                        order.invoiceNumber = item.invoiceNumber;
                        order.createDate = item.createDate;
                        order.revenueNo = this.dsCrm.revenueNo;
                        order.bank = this.dsCrm.bank;
                        order.address = this.dsCrm.address;
                        order.slvMonry = (order.count * order.price * this.dsCrm.slv/100).toFixed(2);
                        order.allPrice = (order.count * order.price - order.slvMonry).toFixed(2);
                        order.slv = this.dsCrm.slv/100;
                        num++;
                    })
                    arr = _.concat(arr, res);
                    if(idx == list.length-1){
                        this.exportDetail(arr);
                    }
                });
            });
            
        },
        async getOrders(ids){
            let cn = {
                type:'listData',
                collectionName: 'order',
                data:{id:{$in:ids}},
                column:{sourceserial:1,productName:1,materialNo:1,modelNo:1,util:1,count:1,price:1}
            };
            return new Promise((resolve, reject)=>{
                this.$axios.$post('mock/db', { data: cn }).then(res=>{
                    resolve(res.list);
                });
            });
        },
        // 明细清单数据
        exportDetail(arr){
            console.log('Promise', arr);
            let tHeader = ['序号','发票代码','发票号码','购方企业名称','购方税号','银行账号','地址电话','开票日期','单据号','商品名称','物料号','规格','单位','数量','单价','金额','税率','税额'];
            let filterVal = ['num','','invoiceNumber','crmName','revenueNo','bank','address','createDate','sourceserial','productName','materialNo','modelNo','util','count','price','allPrice','slv','slvMonry'];
            this.exportOrder({ tHeader, filterVal, arr });
        },
		// 汇总数据
		setCollectData(list) {
			let arr = [], num = 1, total = {allPrice:0,slvMoney:0,price:0},  allTotal = {allPrice:0,slvMoney:0,price:0};
			list.forEach((item, idx) => {
                let obj = {
                    "num":num,
					"createDate": item.createDate,
					"invoiceNumber": item.invoiceNumber,
					"allPrice": item.price - item.price * this.dsCrm.slv / 100,
					"slvMoney": item.price * this.dsCrm.slv / 100,
					"price": item.price,
					"sourceserial": item.sourceserial,
                }
                total.allPrice += obj.allPrice;
                total.slvMoney += obj.slvMoney;
                total.price += obj.price;
                allTotal.allPrice += obj.allPrice;
                allTotal.slvMoney += obj.slvMoney;
                allTotal.price += obj.price;
                arr.push(obj);
				if (idx > 0 && item.createDate>list[idx-1]['createDate']) {
                    arr.push({
                        "num":"小计",
                        "allPrice":total.allPrice,
                        "slvMoney": total.slvMoney,
					    "price": total.price,
                    });
                    total = {allPrice:0,slvMoney:0,price:0};
                }
                num++;
            });
            arr.push({
                "num":"总计",
                "allPrice":allTotal.allPrice,
                "slvMoney": allTotal.slvMoney,
                "price": allTotal.price,
            });
			let tHeader = ['序号','发票日期', '发票号码', '金额', '税额', '合计', '订单号'];
			let filterVal = ['num','createDate', 'invoiceNumber', 'allPrice', 'slvMoney', 'price', 'sourceserial'];
            this.exportOrder({ tHeader, filterVal, arr });
		},

		exportOrder(obj = {}) {
			import('@/components/Export2Excel').then(excel => {
				const tHeader = obj.tHeader;
				const filterVal = obj.filterVal;
				const data = this.formatJson(filterVal, obj.arr);
                const now = moment(new Date()).format('YYYYMMDD');
                const fileName = (this.typeId==1?'发票汇总':'发票明细清单') + moment(this.searchForm.startDate).format('YYYYMMDD') + '--' + moment(this.searchForm.endDate).format('YYYYMMDD');
				excel.export_json_to_excel({
					header: tHeader,
					data,
					filename: fileName
                });
                this.loadingMask.close();
			})
		},
		formatJson(filterVal, jsonData) {
			return jsonData.map(v => filterVal.map(j => {
				if (j == 'createDate' || j == 'deliveryDate') {
					v[j] = this.parseDate(v[j]);
				}
				return v[j];
			}))
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
			}
		}
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

