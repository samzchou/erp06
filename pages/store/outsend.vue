<template>
    <section>
        <div class="head-title">
            <div>
                <div>
                    <span :class="{'inactive':needSource}" @click="setOrderParams(true)">蒂森订单</span>
                    <span :class="{'inactive':!needSource}" @click="setOrderParams(false)">珏合订单</span>
                </div>
            </div>
        </div>
        <div class="grid-container">
            <div class="search-content">
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
                    <el-form-item label="下单日期：" prop="orderDate">
                        <el-date-picker v-model="searchForm.orderDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
                    </el-form-item>
                    <el-form-item label="交货日期：" prop="deliveryDate">
                        <el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div>
                <el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini"
                    max-height="500">
                    <el-table-column type="index" width="60" label="序号" align="center">
                        <template slot-scope="scope">
                            <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-row :gutter="20" v-for="(item,idx) in props.row.result" :key="item.id">
                                <el-col :span="4">
                                    <span style="width:30px">{{idx+1}}.</span>物料号：{{item.materialNo}}</el-col>
                                <el-col :span="7">物料描述：{{item.productName}}</el-col>
                                <el-col :span="3">订单数量：{{item.count}}</el-col>
                                <el-col :span="8">供应商/客户：{{item.crmName}}</el-col>
                            </el-row>
                        </template>
                    </el-table-column>

                    <el-table-column prop="flowStateId" label="状态" width="70">
                        <template slot-scope="scope">
                            <span>{{parseState(scope.row.flowStateId)}}</span>
                        </template>
                    </el-table-column>
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
                    <el-table-column prop="modelNo" label="梯号" width="100" />
                    <el-table-column prop="total" label="订单总数" width="100">
                        <template slot-scope="scope">
                            <span>共 {{scope.row.total}} 套</span>
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
                    <el-table-column prop="updateByUser" label="操作人" width="80">
                        <template slot-scope="scope">
                            <span>{{scope.row.updateByUser}}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="page-container" style="padding: 10px 0;">
                <div>
                    <span style="margin-right:15px;">共计{{total}}个出库送货的订单</span>
                </div>
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page"
                    :page-sizes="[20, 50, 100, 200, 500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>

    </section>
</template>

<script>
export default {
    data() {
        return {
            setting: {},
            needSource: true,
            listLoading: false,
            total: 0,
            gridList: [],
            query: {
                page: 1,
                pagesize: 100
            },
            searchForm: {
                serial: '',
                sourceserial: '',
                projectNo: '',
                projectName: '',
                orderDate: '',
                deliveryDate: ''
            },
            openDialogVisible: false,
            currItem: null,
            orderList: [],
            exportLoading: false,
            exportOrderIds: [],
            updateIds: [],
            isCanExport: false,
        }
    },
    methods: {
        setOrderParams(flag) {
            this.needSource = flag;
            this.query.page = 1;
            this.getList();
        },
        splitSerial(serial) {
            let s = serial.split('-');
            return s.length ? s[1] : serial;
        },
        parseState(id) {
            let state = _.find(this.setting.flowState, { id: id })
            return state.name || '';
        },
        parseDate(date, format) {
            if (!date) return '';
            return moment(date).format(format || 'YYYY-MM-DD');
        },
        parseMoney(row) {
            return this.$options.filters['currency'](row.count * row.price);
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
            let groupId = { "sourceserial": "$sourceserial", "projectNo": "$projectNo" };
            let bySerial = { 'sourceserial': { $ne: '' } };
            if (!this.needSource) {
                bySerial = { 'sourceserial': '' };
                groupId = { "serial": "$serial", "projectNo": "$projectNo" };
            }
            match = _.merge({ flowStateId: { $gte: 10 }, isCanceled: false }, bySerial, match);
            let condition = {
                type: 'groupList',
                collectionName: 'order',
                data: match,
                distinct: this.needSource ? "sourceserial" : "serial",
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
                            "model": { "$first": "$model" },
                            "modelNo": { "$first": "$modelNo" },
                            /* "materialNo":{"$first" :"$materialNo"},
							"productId":{"$first" :"$productId"},
							"productName":{"$first" :"$productName"},
							"crmId":{"$first" :"$crmId"},
							"crmName":{"$first" :"$crmName"},
							"boxNo":{"$first" :"$boxNo"},
							"caselNo":{"$first" :"$caselNo"},
							"util":{"$first" :"$util"},
							"price":{"$first" :"$price"},
							"count":{"$first" :"$count"}, */
                            "orderDate": { "$first": "$orderDate" },
                            "deliveryDate": { "$first": "$deliveryDate" },
                            "updateDate": { "$first": "$updateDate" },
                            "updateByUser": { "$first": "$updateByUser" },
                            //"content":{"$first" :"$content"},
                            "flowStateId": { "$first": "$flowStateId" },
                            "total": { $sum: 1 },
                            "result": { "$push": "$$ROOT" }
                        }
                    },
                    {
                        $lookup: {
                            from: "store",
                            localField: "materialNo",
                            foreignField: "materialNo",
                            as: "store"
                        }
                    },
                    {
                        $unwind: { // 拆分子数组
                            path: "$store",
                            preserveNullAndEmptyArrays: true // 空的数组也拆分
                        }
                    },
                    { $sort: { deliveryDate: 1 } },
                    { $skip: (this.query.page - 1) * this.query.pagesize },
                    { $limit: this.query.pagesize }
                ]
            };
            let result = await this.$axios.$post('mock/db', { data: condition });
            this.total = result.total;
            this.gridList = result.list.map(item => {
                item.finishCount = this.checkFinished(item);
                item.finished = item.finishCount == item.total;
                item.partName = "机房线槽总成";
                item.boxCount = 1;
                return item;
            });
            this.listLoading = false;
        },
        checkFinished(row) {
            let countFinish = 0;
            row.result.forEach(item => {
                if ([3, 8].includes(item.flowStateId)) {
                    countFinish++;
                }
            });
            return countFinish;
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
                this.getList();
            }
        }
    },
    created() {
        this.getSetting();
    }
}
</script>
<style lang="scss" scoped>
@import '~/assets/scss/order.scss';
</style>
