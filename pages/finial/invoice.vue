<template>
    <section>
        <div>
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="可开票" name="first">
                    <div class="table-container">
                        <el-table ref="multipleTable" size="mini" :data="gridList" border stripe style="width: 100%" @selection-change="handleSelectionChange">
                            <el-table-column type="expand">
                                <template slot-scope="scope">
                                    <el-row :gutter="20" v-for="(item,idx) in scope.row.result" :key="item.id">
                                        <!-- <el-col :span="3">
                                            <span style="width:30px">{{idx+1}}、</span>
                                            <span>ID：{{item.id}}</span>
                                        </el-col> -->
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
                            <el-table-column label="系统订单号" prop="serial" width="150" />
                            <el-table-column label="蒂森订单号" prop="sourceserial" width="100" />
                            <el-table-column label="项目号" prop="projectNo" width="150" />
                            <el-table-column label="项目名称" prop="projectName" />
                            <el-table-column label="产品名称" prop="productName" />
                            <el-table-column label="制单日期" prop="orderDate" width="120">
                                <template slot-scope="scope">
                                    <span>{{parseDate(scope.row.orderDate)}} </span>
                                </template>
                            </el-table-column>
                            <el-table-column label="交货日期" prop="deliveryDate" width="120">
                                <template slot-scope="scope">
                                    <span>{{parseDate(scope.row.deliveryDate)}} </span>
                                </template>
                            </el-table-column>
                            <el-table-column label="合计金额" prop="orderTotalPrice" width="120">
                                <template slot-scope="scope">
                                    <span>{{scope.row.orderTotalPrice | currency}} </span>
                                </template>
                            </el-table-column>
                        </el-table>
                    </div>
                    <div class="pages">
                        <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[30, 50, 100, 300]" :page-size="query.pagesize" layout="total, sizes, prev, pager, next" :total="total" />
                    </div>
                </el-tab-pane>
                <el-tab-pane label="已开发票" name="second">已开发票</el-tab-pane>
                <el-tab-pane label="发票汇总" name="third">发票汇总</el-tab-pane>
            </el-tabs>
        </div>
    </section>
</template>
<script>
export default {
    data: () => ({
        activeName: 'first',
        setting: {},
        listLoading: false,
        gridList: [],
        query: {
            page: 1,
            pagesize: 50
        },
        total:0,
    }),
    methods: {
        parseDate(date, format) {
            return moment(date).format(format || 'YYYY-MM-DD');
        },
        parseMoney(row){
            return this.$options.filters['currency'](row.count*row.price);
        },
        handleClick() {

        },
        handleSelectionChange(rows) {

        },
        handleSizeChange(){

        },
        handleCurrentChange(){

        },
        async getList(match = {}) {
            this.listLoading = true;
            let groupId = { "sourceserial": "$sourceserial", "projectNo": "$projectNo" };
            match = _.merge({ flowStateId: 10 }, match);
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
                            "serial":{"$first":"$serial"},
							"sourceserial":{"$first" :"$sourceserial"},
                            "projectNo": { "$first": "$projectNo" },
                            "projectName": { "$first": "$projectName" },
                            /* "crmId": { "$first": "$crmId" },
                            "crmName": { "$first": "$crmName" },
                            "productName":{"$first" :"$productName"},
                            "boxNo": { "$first": "$boxNo" }, */
                            "orderDate": { "$first": "$orderDate" },
                            "deliveryDate": { "$first": "$deliveryDate" },
                            "payTotalPrice": { "$sum": { "$multiply": ["$metaprice", "$count"] } },
                            "orderTotalPrice": { "$sum": { "$multiply": ["$price", "$count"] } },
                            "total": { $sum: 1 },
                            "result": { "$push": "$$ROOT" }
                        }
                    },
                    { "$sort": { "deliveryDate": 1 } },
                    { "$skip": (this.query.page - 1) * this.query.pagesize },
                    { "$limit": this.query.pagesize }
                ]
            };
            let result = await this.$axios.$post('mock/db', { data: condition });
            this.total = result.total;
            this.gridList = result.list;
            this.allPrice = this.totalPrice(result.list);
            console.log(this.gridList, this.allPrice);
            this.listLoading = false;
        },
        totalPrice(arr) {
            let price = 0;
            arr.forEach(item => {
                price += item.payTotalPrice;
            })
            return price;
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
                // 获取列表
                this.getList();
            }
        }
    },
    mounted() {
        this.getSetting();
    }
}
</script>
<style lang="scss" scoped>
    @import '~/assets/scss/order.scss';
    /deep/ .el-tabs{
        .pages{
            padding:10px 0;
        }
    }
    
</style>