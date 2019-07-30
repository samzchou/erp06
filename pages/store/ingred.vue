<template>
    <section>
        <div class="head-title">
            <div>
                <div>
                    <span class="inactive">已导出的配料单</span>
                </div>
            </div>
        </div>
        <div class="grid-container">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="配料单号：" prop="serial">
                        <el-input v-model="searchForm.serial" clearable style="width:150px" />
                    </el-form-item>
                    <el-form-item label="配料日期：" prop="updateDate">
                        <el-date-picker v-model="searchForm.updateDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div>
                <el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini"
                    max-height="500" style="width:100%">
                    <el-table-column type="index" width="70" align="center">
                        <template slot-scope="scope">
                            <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="serial" label="配料单号" width="250" />
                    <el-table-column prop="count" label="配料总数" width="80" />
                    <el-table-column prop="createByUser" label="配料人" width="150" />
                    <el-table-column prop="deliveryDate" label="配料日期" width="125" sortable>
                        <template slot-scope="scope">
                            <div>
                                <span>{{parseDate(scope.row.updateDate)}}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column label="查看" width="100">
                        <template slot-scope="scope">
                            <el-button type="text" icon="el-icon-document" @click="showDetail(scope.row)">详情</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="page-container" style="padding: 10px 0;">
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page"
                    :page-sizes="[5,20, 50, 100, 200, 500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next"
                    :total="total">
                </el-pagination>
            </div>
        </div>
        <el-dialog :title="dialogTitle" append-to-body :close-on-click-modal="false" :visible.sync="dialogVisible" width="65%">
            <el-table v-loading="detailLoading" ref="detailList" :data="detailList" border fit highlight-current-row stripe size="mini"
                    max-height="500" style="width:100%">
                <el-table-column label="序号" type="index" width="60" align="center" />
                <el-table-column prop="materialNo" label="物料号" width="150" />
                <el-table-column prop="productName" label="物料名称" />
                <el-table-column prop="count" label="汇总数量" width="100"  />
                <el-table-column prop="deliveryDate" label="交货日期" width="120" >
                    <template slot-scope="scope">
                        <div>
                            <span>{{parseDate(scope.row.deliveryDate)}}</span>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <div style="padding: 10px 0;text-align: right;">
                <el-button size="small" type="primary" icon="el-icon-download">导出配料单</el-button>
                <el-button size="small" icon="el-icon-close" @click="dialogVisible=false">取消关闭</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
export default {
    data() {
        return {
            listLoading: false,
            total: 0,
            gridList: [],
            query: {
                page: 1,
                pagesize: 500
            },
            searchForm: {
                serial: '',
                updateDate: ''
            },
            orderList: [],
            exportLoading: false,
            dialogVisible:false,
            detailLoading:false,
            detailList:[],
            dialogTitle:'',
        }
    },
    methods: {
        showDetail(row) {
            this.dialogTitle = row.serial;
            let params = {
                type:'listData',
                collectionName: 'order',
                data:{
                    id:{$in:row.orderIds}
                }
            }
            this.$axios.$post('mock/db', {data:params}).then(res=>{
                console.log('showDetail', row.orderIds, res);
                this.setList(res.list);
                
            });
            this.dialogVisible = true;
        },
        setList(list){
            let arr = [];
            list.forEach(item=>{
                debugger
                let orderIndex = _.findIndex(arr, {'materialNo':item.materialNo});
                if(!~orderIndex){
                    arr.push({
                        "materialNo":item.materialNo,
                        "productName": item.productName,
                        "count": item.count,
                        "deliveryDate": item.deliveryDate
                    })
                }else{
                    arr[orderIndex]['count'] += item.count;
                }
            });
            arr = _.sortBy(arr, ['productName']);
            console.log('setList', arr);
            this.detailList = arr;
        },

        exportTable() {
            this.exportLoading = true;
            let exportData = [], index = 1, ids = [];
            this.orderList.forEach(item => {
                exportData.push({
                    "businessName": "",
                    "productName": item.productName,
                    "count": "",
                    "deliveryDate": "",
                    "a1": "",
                    "a2": "",
                    "a3": ""
                });
                let res = this.totalCount(item.result);
                exportData.push({
                    'index': index,
                    "businessName": this.parseBusiness(item.business),
                    "productName": item.materialNo,
                    "count": res.allCount,
                    "deliveryDate": item.deliveryDate,
                    "a1": "",
                    "a2": "",
                    "a3": ""
                });
                index++;
                ids = _.concat(ids, res.ids);

            });
            // console.log('deliveryDate', this.searchForm.deliveryDate)
            import('@/components/Export2Excel').then(excel => {
                const tHeader = ['序号', '业务类型', '物料信息', '汇总数量', '交货日期', '配料人', '仓管', '领料人'];
                const filterVal = ['index', 'businessName', 'productName', 'count', 'deliveryDate', 'a1', 'a1', 'a3'];
                //debugger
                const data = this.formatJson(filterVal, exportData);
                const now = moment(this.searchForm.deliveryDate ? this.searchForm.deliveryDate : new Date()).format('YYYYMMDDhhmmss');
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: '配料单-' + now
                });
            });
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => {
                if (j == 'deliveryDate' && v[j]) {
                    v[j] = this.parseDate(v[j]);
                }
                return v[j];
            }))
        },
        parseDate(date, format) {
            if (!date) return '';
            return moment(date).format(format || 'YYYY-MM-DD');
        },

        submitSearch(flag) {
            let params = {};
            for (let k in this.searchForm) {
                if (this.searchForm[k] != '' && this.searchForm[k]) {
                    if (_.isNumber(this.searchForm[k])) {
                        params[k] = Number(this.searchForm[k]);
                    } else if (_.isArray(this.searchForm[k]) && (k === 'updateDate')) {
                        params[k] = {
                            $gte: this.searchForm[k][0],
                            $lt: this.searchForm[k][1] + 24 * 3600 * 1000 - 1
                        }
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
            let params = {
                type: 'listData',
                collectionName: 'ingred',
                data: match,
                page: this.query.page,
                pagesize: this.query.pagesize,
                sortby: 'id',
                ascby: -1
            }
            let data = await this.$axios.$post('mock/db', { data: params });
            console.log('getList', data);
            this.total = data.total;
            this.gridList = data.list;
            this.listLoading = false;

        },
    },
    mounted() {
        this.getList();
    }
}
</script>
<style lang="scss" scoped>
@import '~/assets/scss/order.scss';
</style>
