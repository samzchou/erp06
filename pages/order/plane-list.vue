<template>
	<section class="order-main">
		<div class="head-title">
			<div>
				<div>
					<span class="inactive">计划单</span>
				</div>
			</div>
		</div>
		<div class="grid-container">
			<div class="search-content">
				<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="项目名称：" prop="projectName">
						<el-input v-model="searchForm.projectName" clearable  style="width:150px"/>
					</el-form-item>
                    <el-form-item label="下单日期：" prop="orderDate">
						<el-date-picker v-model="searchForm.orderDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
					</el-form-item>
					<el-form-item label="交货日期：" prop="deliveryDate">
						<el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
						<el-button v-if="gridList.length" type="warning" @click="exportOrder" icon="el-icon-document">导出计划单</el-button>
					</el-form-item>
				</el-form>
			</div>
			<el-table class="table-container" ref="listTable" v-loading="listLoading" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500">
				<el-table-column type="index" width="70" label="序号" align="center">
					<template slot-scope="scope">
						<span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
					</template>
				</el-table-column>
				<el-table-column prop="orderDate" label="下单日期" width="100">
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.orderDate)}}</span>
					</template>
				</el-table-column>
                <el-table-column prop="projectName" label="项目名称"/>
				<el-table-column prop="projectNo" label="项目号"  width="150" sortable />
                <el-table-column prop="modelNo" label="梯号" width="80" />
                <el-table-column prop="deliveryDate" label="交货日期" width="120" sortable>
					<template slot-scope="scope">
						<span>{{parseDate(scope.row.deliveryDate)}}</span>
					</template>
				</el-table-column>
                <el-table-column prop="sourceserial" label="蒂森订单号" width="120" />
				<el-table-column prop="model" label="梯形" width="120"/>
				<el-table-column prop="materialNo" label="参考物号" width="120"/>
			</el-table>
			<div class="page-container">
				<div>共有{{total}}个计划单</div>
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200,500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total" />
			</div>
		</div>

	</section>
</template>

<script>
export default {
	computed: {
        stateArr(){
            //console.log('setting',this.setting)
            if(this.setting && this.setting.flowState){
                return this.setting.flowState.filter(item=>[6,7,8,9,10,11].includes(item.id))
            }
            return [];
        }
	},
	data() {
		return {
			setting: null,
			listLoading: false,
			gridList: [],
			query: {
				page: 1,
				pagesize: 100
			},
			total: 0,
			searchForm: {
                flowStateId:6,
                projectName:'',
				orderDate: '',
				deliveryDate: ''
			},
		}
	},
	methods: {
		exportOrder() {
            
			let sd = 88888888888888888, ed = 0, num = 1;
			this.gridList.forEach(item=>{
                item.num = num;
				if(item.orderDate < sd){
					sd = item.orderDate;
				}
				if(item.orderDate > ed){
					ed = item.orderDate;
                }
                num++;
			});
			sd = this.parseDate(sd, 'MM.DD');
			ed = this.parseDate(ed, 'MM.DD');
		    import('@/components/Export2Excel').then(excel => {
				const tHeader = ['序号','下单日期','项目名称','项目号','梯号','交货日期','订单号','梯形','参考物号','防护栏','焊接长度','A','B','连接长度','斜撑'];
				const filterVal = ['num','orderDate','projectName','projectNo','modelNo','deliveryDate','sourceserial','model','materialNo'];
				const data = this.formatJson(filterVal, _.cloneDeep(this.gridList));
				excel.export_json_to_excel({
					header: tHeader,
					data,
					filename:  '计划单-' + sd + '-' + ed
				});
			})
		},
		formatJson(filterVal, jsonData) {
		return jsonData.map(v => filterVal.map(j => {
				if (j == 'orderDate' || j == 'deliveryDate') {
					v[j] = this.parseDate(v[j]);
				}
				return v[j];
			}))
		},
		parseDate(date, format) {
			return date ? moment(date).format(format || 'YYYY-MM-DD') : '';
		},
		submitSearch(flag) {
			let params = {};
			for (let k in this.searchForm) {
				if (this.searchForm[k] && this.searchForm[k] != '') {
                    if (_.isNumber(this.searchForm[k])) {
                        params[k] = Number(this.searchForm[k]);
                        
					}else if (_.isArray(this.searchForm[k]) && (k === 'deliveryDate' || k === 'orderDate')) {
						params[k] = {
							$gte: this.searchForm[k][0],
							$lt: this.searchForm[k][1] + 24 * 3600 * 1000 - 1
						}
					}else{
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
            let condition = {
				type: 'listData',
				collectionName: 'order',
                data: _.merge({ typeId: 2}, match), //{ typeId: 2, productName:{$regex:'防护栏'}
                sortby:'deliveryDate',
                page:this.query.page,
                pagesize:this.query.pagesize
			};
			let result = await this.$axios.$post('mock/db', { data: condition });
			this.gridList = result.list.map((item,index)=>{
				item.index = index + 1;
				return item;
			});
			this.total = result.total;
			this.listLoading = false;
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
		this.getList({flowStateId:{$gte:6}});
	}
}
</script>

<style lang="scss" scoped>
@import "~/assets/scss/order.scss";
</style>

