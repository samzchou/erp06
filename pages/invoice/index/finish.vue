<template>
    <section class="list-container">
        <div class="search-form">
			<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                <el-form-item label="发票号：" prop="invoiceNumber">
					<el-input v-model="searchForm.invoiceNumber" clearable style="width:150px" />
				</el-form-item>
				<el-form-item label="系统订单号：" prop="serial">
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
				</el-form-item>
                <el-form-item label="开票日期：" prop="createDate">
					<el-date-picker v-model="searchForm.createDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
				</el-form-item>
				<el-form-item>
					<el-button type="primary" @click="submitSearch">搜索</el-button>
				</el-form-item>
			</el-form>
		</div>
        <div class="table-content">
			<el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500" style="width:100%" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="50" align="center" /> 
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :gutter="20" v-for="(item,idx) in scope.row.orders" :key="item.id">
                            <el-col :span="4"><span style="width:30px">{{idx+1}}、</span>物料号：{{item.materialNo}}</el-col>
                            <el-col :span="5">物料描述：{{item.productName}}</el-col>
                            <el-col :span="3">订单量：{{item.count}}</el-col>
                            <el-col :span="3">订单单价：{{item.price}}</el-col>
                            <el-col :span="3">总价：{{parseMoney(item)}}</el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" width="70" label="序号" align="center">
					<template slot-scope="scope">
						<span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
					</template>
				</el-table-column>
                <el-table-column prop="invoiceNumber" label="发票号" width="150"/>
                <el-table-column prop="crmName" label="客户" width="150"/>
                <el-table-column prop="createDate" label="开票日期" width="100">
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.createDate)}}</span>
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
                <el-table-column prop="price" label="合计" width="120">
					<template slot-scope="scope">
						<span>{{scope.row.price | currency}}</span>
					</template>
				</el-table-column>
                <el-table-column prop="createByUser" label="开票人" width="80"/>
				<el-table-column prop="serial" label="系统订单号" width="150">
					<template slot-scope="scope">
						<span>{{scope.row.serial}}</span>
					</template>
				</el-table-column>
				<el-table-column label="蒂森订单号" width="120">
					<template slot-scope="scope">
						<span>{{scope.row.sourceserial}}</span>
					</template>
				</el-table-column>
                <el-table-column prop="projectNo" label="项目号" width="120" />
				<el-table-column prop="projectName" label="项目名称" />
                <el-table-column prop="content" label="备注" />
			</el-table>
			<div class="page-container">
				<div>
					<span style="margin-right:15px;">共计{{total}}个已开票订单</span>
                    <el-button size="mini" type="primary" @click="submitExport" :disabled="!selectRows.length">导出</el-button>
                    
                    <el-button size="mini" type="danger" @click="exportXML" :disabled="!selectRows.length">导出XML</el-button>
				</div>
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200, 500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
				</el-pagination>
			</div>
		</div>
    </section>
</template>
<script>
import x2js from 'x2js';
export default {
	data: () => ({
        dsCrm:{},
		setting: {},
		searchForm: {
            invoiceNumber:'',
			serial: '',
			sourceserial: '',
			projectNo: '',
			projectName: '',
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
		
	}),
	methods: {
        // 导出XML
        exportXML(){
            const x2jsone = new x2js({
                attributePrefix : "$"
            });

            let exportData = [], num = 1;
            this.selectRows.forEach(item=>{
                item.orders.forEach(order=>{
                    let obj = {
                        "Xh":num,
                            "Spmc":order.productName,
                            "Ggxh":order.materialNo,
                            "Jldw":order.util,
                            "Spbm":"1090115040000000000",
                            "Qyspbm":"",
                            "Syyhzcbz":"",
                            "Lslbz":"",
                            "Yhzcsm":"",
                            "Dj":order.price,
                            "Sl":order.count,
                            "Je":order.price*order.count,
                            "Slv":this.dsCrm.slv/100,
                            "Kce":""
                    }
                    exportData.push(obj)
                    num++;
                })
            });
            
            var testObjC = {
                'Kp' : {
                    'Version' : '2.0',
                    'Fpxx' : {
                        "Zsl":1,
                        "Fpsj":{
                            "Fp":{
                                "Djh":"41501",
                                "Gfmc":this.dsCrm.name, //"蒂森克虏伯电梯（上海）有限公司",
                                "Gfsh":this.dsCrm.revenueNo, //"9131000060736170XA"
                                "Gfyhzh":this.dsCrm.bank, //"德意志银行（中国）有限公司上海分行 3509965015",
                                "Gfdzdh":this.dsCrm.address, //"上海市松江工业区佘山分区勋业路2号 021 37869898",
                                "Bz":"",
                                "Fhr":"张士明",
                                "Skr":"张士明",
                                "Spbmbbh":this.dsCrm.slv,
                                "Hsbz":"0",
                                "Spxx":{
                                    "Sph":exportData
                                }
                            }
                        }
                    }
                }
            }
            var xmlDocStr = x2jsone.js2xml(
                testObjC
            );
            const blob = new Blob([xmlDocStr], {type: 'text/xml'});
            const fileName = `${moment(new Date()).format("YYYY-MM-DD")}.xml`;
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            link.click();
            window.URL.revokeObjectURL(link.href);
            link.remove();
            console.log(xmlDocStr)
        },
        // 导出汇总
        exportcollect(){
            let exportData = [], num = 1, startDate=9999999999999, endDate=0, total_allPrice=0, total_slvPrice=0, total_price=0;
            this.selectRows.forEach(item=>{
                item.orders.forEach(order=>{
                    if(order.orderDate<startDate){
                        startDate = order.orderDate;
                    }
                    if(order.orderDate>endDate){
                        endDate = order.orderDate;
                    }
                });
                let obj = {
                    "num":num,
                    "invoiceNumber":item.invoiceNumber,
                    "createDate":item.createDate,
                    "allPrice":this.$options.filters["currency"](item.price - item.price*this.dsCrm.slv/100,''),
                    "slvPrice":this.$options.filters["currency"](item.price*this.dsCrm.slv/100,''),
                    "price":this.$options.filters["currency"](item.price,''),
                    "sourceserial":item.sourceserial
                };
                total_allPrice += item.price - item.price*this.dsCrm.slv/100;
                total_slvPrice += item.price*this.dsCrm.slv/100;
                total_price += item.price;
                exportData.push(obj);
                num++;
            });
            exportData.push({
                "num":"总计",
                "allPrice":this.$options.filters["currency"](total_allPrice,''),
                "slvPrice":this.$options.filters["currency"](total_slvPrice,''),
                "price":this.$options.filters["currency"](total_price,'')
            })
            import("@/components/Export2Excel").then(excel => {
				const tHeader = ["序号","发票号码","发票日期","金额","税额","合计","订单号"];
				const filterVal = ["num","invoiceNumber","createDate","allPrice","slvPrice","price","sourceserial"];
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
        exportDetail(){
            let exportData = [], num = 1, startDate=9999999999999, endDate=0;
            this.selectRows.forEach(item=>{
                item.orders.forEach(order=>{
                    if(order.orderDate<startDate){
                        startDate = order.orderDate;
                    }
                    if(order.orderDate>endDate){
                        endDate = order.orderDate;
                    }
                    exportData.push({
                        "num":num,
                        "invoiceNumber":item.invoiceNumber,
                        "crmName":item.crmName,
                        "revenueNo":this.dsCrm.revenueNo,
                        "bank":this.dsCrm.bank,
                        "address":this.dsCrm.address,
                        "createDate":item.createDate,
                        "productName":order.productName,
                        "materialNo":order.materialNo,
                        "modelNo":order.modelNo,
                        "util":order.util,
                        "count":order.count,
                        "price":order.price,
                        "allPrice":order.price*order.count,
                        "slv":this.dsCrm.slv/100,
                        "slMoney":this.$options.filters["currency"](order.price*order.count*this.dsCrm.slv/100,'')
                    })
                    num++;
                })
            });
            import("@/components/Export2Excel").then(excel => {
				const tHeader = ["序号","发票号码","购方企业名称","购方税号","银行账号","地址电话","开票日期","商品名称","物料号","规格","单位","数量","单价","金额","税率","税额"];
				const filterVal = ["num","invoiceNumber","crmName","revenueNo","bank","address","createDate","productName","materialNo","modelNo","util","count","price","allPrice","slv","slMoney"];
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
		parseMoney(row){
            return this.$options.filters['currency'](row.count*row.price);
        },
		handleSelectionChange(rows) {
			this.selectRows = rows;
			console.log(rows)
        },
        submitExport(){
            let arr = _.cloneDeep(this.selectRows);
            this.allPrice = 0;
            arr.forEach(item=>{
                this.allPrice += item.price;
            });
            arr.push({invoiceNumber:'合计',price:this.allPrice});

            import('@/components/Export2Excel').then(excel => {
				const tHeader = ['开票日期', '发票号', '金额', '订单号'];
				const filterVal = ['createDate','invoiceNumber','price','sourceserial'];
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
            
			let condition = {
                type:'listData',
                collectionName: 'finance',
                data:_.merge({payType:2}, match)
            }
            let result = await this.$axios.$post('mock/db', { data: condition });
			this.total = result.total;
			this.gridList = result.list.map(item=>{
                this.getOrders(item.orderIds).then(res=>{
                    item.orders = res;
                });
                item.slvMoney = item.price * this.dsCrm.slv / 100;
                item.orderMoney = item.price - item.slvMoney;
                return item;
            });
            console.log('gridList', this.gridList)
			this.listLoading = false;
        },
        async getOrders(ids){
            let cn = {
                type:'listData',
                collectionName: 'order',
                data:{id:{$in:ids}}
            };
            return new Promise((resolve, reject)=>{
                this.$axios.$post('mock/db', { data: cn }).then(res=>{
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
                this.dsCrm = _.find(this.setting.crm, {id:4});
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

