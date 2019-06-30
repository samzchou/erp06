<template>
    <section class="order-main">
        <div class="head-title">
            <div>
                <div>
                    <span class="inactive">包装清单</span>
                </div>
            </div>
        </div>
        <div class="grid-container">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="下单日期：" prop="orderDate">
                        <el-date-picker v-model="searchForm.orderDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
                    </el-form-item>
                    <el-form-item label="交付日期：" prop="deliveryDate">
                        <el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
                        <el-button type="warning" @click="exportOrder" icon="el-icon-document" :loading="exportLoading">导出包装清单</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <el-table class="table-container" ref="listTable" v-loading="listLoading" :data="gridList" border fit highlight-current-row
                stripe size="mini" max-height="500">
                <el-table-column type="index" width="70" label="序号">
                    <template slot-scope="scope">
                        <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                    </template>
                </el-table-column>
                <el-table-column prop="orderDate" label="下单日期" width="120">
                    <template slot-scope="scope">
                        <span>{{parseDate(scope.row.orderDate)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="projectName" label="项目名称" />
                <el-table-column prop="projectNo" label="项目号" width="150" />
                <el-table-column prop="modelNo" label="梯号" width="80" />
                <el-table-column prop="deliveryDate" label="交货日期" width="120">
                    <template slot-scope="scope">
                        <span>{{parseDate(scope.row.deliveryDate)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="model" label="梯形" width="120" />
                <el-table-column prop="materialNo" label="防护栏" width="120" />
                <el-table-column prop="caselNo" label="参考物号" width="120" />
            </el-table>
            <div class="page-container">
                <div>共有{{total}}个包装单</div>
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page"
                    :page-sizes="[20, 50, 100, 200,500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total"
                />
            </div>
        </div>

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
            setting: null,
            listLoading: false,
            gridList: [],
            query: {
                page: 1,
                pagesize: 500
            },
            total: 0,
            searchForm: {
                orderDate: '',
                deliveryDate: ''
            },
            exportLoading: false,
        }
    },
    methods: {


        async exportOrder() {
            this.exportLoading = true;
            let params = {};
            for (let k in this.searchForm) {
                if (this.searchForm[k] && this.searchForm[k] != '') {
                    if (_.isArray(this.searchForm[k]) && (k === 'deliveryDate' || k === 'orderDate')) {
                        params[k] = {
                            $gte: this.searchForm[k][0],
                            $lt: this.searchForm[k][1] + 24 * 3600 * 1000 - 1
                        }
                    }
                }
            };
            let condition = {
                type: 'groupList',
                collectionName: 'order',
                data: _.merge({ typeId: 2, productName: { $regex: '防护栏' } }, params),
                distinct: "projectNo",
                aggregate: [
                    { "$match": _.merge({ typeId: 2, productName: { $regex: '防护栏' } }, params) },
                    {
                        "$group": {
                            "_id": { "projectNo": "$projectNo" }, // 按字段分组
                            "materialNo": { "$first": "$materialNo" },
                            "caselNo": { "$first": "$caselNo" },
                            "projectNo": { "$first": "$projectNo" },
                            "projectName": { "$first": "$projectName" },
                            "model": { "$first": "$model" },
                            "modelNo": { "$first": "$modelNo" },
                            "orderDate": { "$first": "$orderDate" },
                            "deliveryDate": { "$first": "$deliveryDate" },
                            "total": { $sum: 1 }
                        }
                    },
                    { "$sort": { 'deliveryDate': 1 } },
                    { "$skip": 0 },
                    { "$limit": 2000 }
                ]
            };
            let result = await this.$axios.$post('mock/db', { data: condition });
            let listData = result.list.map((item, index) => {
                item.index = index + 1;
                return item;
            });


            let sd = 88888888888888888;
            let ed = 0;
            this.gridList.forEach(item => {
                if (item.orderDate < sd) {
                    sd = item.orderDate;
                }
                if (item.deliveryDate > ed) {
                    ed = item.deliveryDate;
                }
            });
            sd = this.parseDate(sd, 'MM.DD');
            ed = this.parseDate(ed, 'MM.DD');
            import('@/components/Export2Excel').then(excel => {
                const tHeader = ['下单日期', '项目名称', '项目号', '梯号', '交货日期', '梯形', '防护栏', '序号', '参考物号'];
                const filterVal = ['orderDate', 'projectName', 'projectNo', 'modelNo', 'deliveryDate', 'model', 'materialNo', 'index', 'caselNo'];
                const data = this.formatJson(filterVal, listData);
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: '包装清单-' + sd + '-' + ed
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
                    if (_.isArray(this.searchForm[k]) && (k === 'deliveryDate' || k === 'orderDate')) {
                        params[k] = {
                            $gte: this.searchForm[k][0],
                            $lt: this.searchForm[k][1] + 24 * 3600 * 1000 - 1
                        }
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
                type: 'groupList',
                collectionName: 'order',
                data: _.merge({ typeId: 2, productName: { $regex: '防护栏' } }, match),
                distinct: "projectNo",
                aggregate: [
                    { "$match": _.merge({ typeId: 2, productName: { $regex: '防护栏' } }, match) },
                    {
                        "$group": {
                            "_id": { "projectNo": "$projectNo" }, // 按字段分组
                            "materialNo": { "$first": "$materialNo" },
                            "caselNo": { "$first": "$caselNo" },
                            "projectNo": { "$first": "$projectNo" },
                            "projectName": { "$first": "$projectName" },
                            "model": { "$first": "$model" },
                            "modelNo": { "$first": "$modelNo" },
                            "orderDate": { "$first": "$orderDate" },
                            "deliveryDate": { "$first": "$deliveryDate" },
                            "total": { $sum: 1 }
                        }
                    },
                    { "$sort": { 'deliveryDate': 1 } },
                    { "$skip": (this.query.page - 1) * this.query.pagesize },
                    { "$limit": this.query.pagesize }
                ]
            };
            let result = await this.$axios.$post('mock/db', { data: condition });
            this.gridList = result.list.map((item, index) => {
                item.index = index + 1;
                return item;
            });
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
@import '~/assets/scss/order.scss';
</style>

