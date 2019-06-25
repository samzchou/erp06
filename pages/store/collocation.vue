<template>
    <section>
        <div class="head-title">
            <div>
                <div>
                    <span :class="{'inactive':!isColled}" @click="setOrderParams(false)">制定配料单</span>
                    <span :class="{'inactive':isColled}" @click="setOrderParams(true)">已导出的配料单</span>
                </div>
            </div>
        </div>
        <div class="grid-container">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="系统订单号：" prop="serial">
                        <el-input v-model="searchForm.serial" clearable style="width:150px" />
                    </el-form-item>
                    <el-form-item label="业务类型：" prop="business">
                        <el-select v-model="searchForm.business" placeholder="请选择" clearable style="width:100px">
                            <el-option v-for="item in orderBusiness" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="物料号：" prop="materialNo">
                        <el-input v-model="searchForm.materialNo" clearable style="width:150px" />
                    </el-form-item>
                    <el-form-item label="供应商" prop="crmId">
                        <el-select v-model="searchForm.crmId" placeholder="请选择" filterable style="width:200px">
                            <el-option v-for="crm in crmList.filter(o=>o.typeId==1)" :key="crm.id" :label="crm.name" :value="crm.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="项目号：" prop="projectNo">
                        <el-input v-model="searchForm.projectNo" clearable style="width:150px" />
                    </el-form-item>
                    <el-form-item label="项目名称：" prop="projectName">
                        <el-input v-model="searchForm.projectName" clearable style="width:150px" />
                    </el-form-item>
                    <el-form-item label="交货日期：" prop="deliveryDate">
                        <el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" clearable editable unlink-panels style="width:150px" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div>
                <el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="50" align="center" />
                    <el-table-column type="index" width="70" align="center">
                        <template slot-scope="scope">
                            <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template slot-scope="scope" v-if="scope.row.result && scope.row.result.length">
                            <el-row :gutter="20" v-for="(item,idx) in scope.row.result" :key="item.id">
                                <el-col :span="1">
                                    <el-checkbox v-model="item.checked" @change="setChecked(item, scope.row)"/>
                                </el-col>
                                <el-col :span="3">
                                    <span style="width:30px">{{idx+1}}、</span>
                                    <span>业务类型：{{parseBusiness(item.business)}}</span>
                                </el-col>
                                <el-col :span="4">蒂森订单：{{item.sourceserial}}</el-col>
                                <el-col :span="4">项目号：{{item.projectNo}}</el-col>
                                <el-col :span="5">项目名称：{{item.projectName}}</el-col>
                                <el-col :span="2">数量：{{item.count}}</el-col>
                                <el-col :span="4">交货日期：{{parseDate(item.deliveryDate)}}</el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column prop="materialNo" label="物料号" width="150" />
                    <el-table-column prop="productName" label="物料描述" />
                    <el-table-column prop="allcount" label="数量" width="70" />
                    <el-table-column prop="crmName" label="供应商" width="250" />
                    <el-table-column prop="deliveryDate" label="交货日期" width="125">
                        <template slot-scope="scope">
                            <div>
                                <span>{{parseDate(scope.row.deliveryDate)}}</span>
                            </div>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="page-container" style="padding: 10px 0;">
                <div v-if="!exportLoading">
                    <span style="margin-right:15px;">请按照交货日期查询数据，并选择需要导出的配料单</span>
                    <el-button size="mini" type="primary" :disabled="!orderList.length" @click="exportTable">导出配料单({{orderList.length}})</el-button>
                </div>
                <div v-else>
                    <i class="el-icon-loading" /> 正在导出配料单...
                </div>

                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[5,20, 50, 100, 200, 500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    data() {
        return {
            isColled: false, // 是否已导出
            listLoading: false,
            crmList:[],
            total: 0,
            gridList: [],
            query: {
                page: 1,
                pagesize: 500
            },
            searchForm: {
                serial: '',
                crmId:'',
                materialNo: '',
                productName: '',
                orderDate: '',
                deliveryDate: '',
                business: '',
            },
            orderBusiness: [{ label: '售后', value: 1 }, { label: '项目', value: 2 }],
            orderList: [],
            exportLoading: false,
            editRow: null,
            storeArr: [],            // 库存列表
        }
    },
    methods: {
        parseBusiness(val) {
            if (!val) return "";
            return val==1 ? "售后" : "项目";
        },
        // 切换导出和未导出
        setOrderParams(flag) {
            this.$refs.searchForm.resetFields();
            this.isColled = flag;
            this.query.page = 1;
            this.getList();
        },
        setChecked(item, row){
            let checkedCount = 0;
            row.result.forEach(item=>{
                if(item.checked){
                    checkedCount++;
                }
            });
            this.$refs.detailStore.toggleRowSelection(row, checkedCount>0);
        },

        handleSelectionChange(rows) {
            this.orderList = rows;
            this.gridList.forEach(item=>{
                let index = _.findIndex(rows,{"id":item.id});
                item.result.forEach(c=>{
                    c.checked = !!~index;
                })
            });
        },
        totalCount(lists){
            let allCount = 0, ids = [];
			lists.forEach(item => {
                if(item.checked){
                    allCount += item.count;
                    ids.push(item.id);
                }
            });
            return {'allCount':allCount, 'ids':ids};
        },
        exportTable() {
            this.exportLoading = true;
            //console.log(this.orderList);
            let exportData = [], index=1, ids= [];
            this.orderList.forEach(item=>{
                exportData.push({
                    "businessName":"",
                    "productName":item.productName,
                    "count":"",
                    "deliveryDate":"",
                    "a1":"",
                    "a2":"",
                    "a3":""
                });
                let res = this.totalCount(item.result);
                exportData.push({
                    'index':index,
                    "businessName":this.parseBusiness(item.business),
                    "productName":item.materialNo,
                    "count":res.allCount,
                    "deliveryDate":item.deliveryDate,
                    "a1":"",
                    "a2":"",
                    "a3":""
                });
                index++;
                ids = _.concat(ids, res.ids);
               
            });
            console.log('deliveryDate',this.searchForm.deliveryDate)
            /* console.log('exportData', exportData);
            console.log('ids', ids); */
            //return;
            import('@/components/Export2Excel').then(excel => {
                const tHeader = ['序号','业务类型', '物料信息', '汇总数量', '交货日期', '配料人', '仓管', '领料人'];
                const filterVal = ['index','businessName', 'productName', 'count', 'deliveryDate', 'a1', 'a1', 'a3'];
                //debugger
                const data = this.formatJson(filterVal, exportData);
                const now = moment(this.searchForm.deliveryDate?this.searchForm.deliveryDate:new Date()).format('YYYYMMDD');
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: '配料单-' + now
                });
                this.updateOrder(ids);
            });
        },
        updateOrder(ids) {
            // 更新原始订单状态
            let orderCondition = {
                type: "updatePatch",
                collectionName: "order",
                param: { id: { $in: ids } },
                set: {
                    $set: {
                        'isColled': true
                    }
                }
            };
            console.log('orderCondition', orderCondition)
            //return
            // 更新原始订单状态为已出库
            this.$axios.$post('mock/db', { data: orderCondition }).then(result => {
                this.exportLoading = false;
                this.submitSearch(true);
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
                    /* } else if (_.isArray(this.searchForm[k]) && (k === 'orderDate' || k === 'deliveryDate')) {
                        params[k] = {
                            $gte: this.searchForm[k][0],
                            $lt: this.searchForm[k][1]
                        } */
                    } else if (_.isArray(this.searchForm[k])) {
                        params[k] = { $in: this.searchForm[k] };
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
            let groupId = { "materialNo": "$materialNo" };
            match = _.merge({ "isColled":this.isColled,"flowStateId": { $gte: 2, $lt: 4 }, "typeId":1 }, match);
            //debugger
            let condition = {
                type: 'groupList',
                collectionName: 'order',
                data: match,
                distinct: "materialNo",
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
                            "business": { "$first": "$business" },
                            "materialNo": { "$first": "$materialNo" },
                            "crmName": { "$first": "$crmName" },
                            "productName": { "$first": "$productName" },
                            "deliveryDate": { "$first": "$deliveryDate" },
                            "allcount":{$sum:"$count"},
                            "result": { "$push": "$$ROOT" }
                        }
                    },
                    { $sort: {"productName": 1,"deliveryDate":1} }, // "productName": 1, "projectNo": 1, 
                    { $skip: (this.query.page - 1) * this.query.pagesize },
                    { $limit: this.query.pagesize }
                ]
            };
            let result = await this.$axios.$post('mock/db', { data: condition });
            this.total = result.total;
            this.gridList = result.list.map(item => {
                item.result = _.sortBy(item.result, ['projectNo', 'deliveryDate']);
                item.result = item.result.map(c=>{
                    c.checked = true;
                    return c;
                });
                return item;
            });
            console.log('this.gridList', this.gridList);
            this.$nextTick(()=>{
                this.$refs.detailStore.toggleAllSelection();
                this.listLoading = false;
            })
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
                this.crmList = this.setting.crm;
            }
        },
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
