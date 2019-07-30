<template>
    <section>
        <div class="head-title">
            <div>
                <div>
                    <span class="inactive">制定配料单</span>
                </div>
            </div>
        </div>
        <div class="grid-container">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="系统订单号：" prop="serial">
                        <el-input v-model="searchForm.serial" clearable style="width:150px" />
                    </el-form-item>
                    <el-form-item label="项目号：" prop="projectNo">
                        <el-input v-model="searchForm.projectNo" clearable style="width:150px" />
                    </el-form-item>
                    <el-form-item label="项目名称：" prop="projectName">
                        <el-input v-model="searchForm.projectName" clearable style="width:150px" />
                    </el-form-item>
                    <el-form-item label="类型：" prop="types" clearable>
                        <el-select v-model="searchForm.types" placeholder="请选择">
                            <el-option v-for="item in typesArr" :key="item.value" :label="item.label" :value="item.value" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="交货日期：" prop="deliveryDate">
                        <el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp"  type="daterange" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" clearable editable unlink-panels style="width:200px" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div>
                <el-table v-loading="listLoading" ref="detailStore" :data="gridList" border fit highlight-current-row stripe size="mini"
                    max-height="500" @selection-change="handleSelectionChange" style="width:100%">
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
                                    <el-checkbox v-model="item.checked" @change="setChecked(item, scope.row)" />
                                </el-col>
                                <el-col :span="3">
                                    <span style="width:30px">{{idx+1}}、</span>
                                    <span>业务类型：{{parseBusiness(item.business)}}</span>
                                </el-col>
                                <el-col :span="3">物料号：{{item.materialNo}}</el-col>
                                <el-col :span="5">物料名称：{{item.productName}}</el-col>
                                <el-col :span="3">数量：{{item.count}}</el-col>
                                <el-col :span="3">单价：{{item.price}}</el-col>
                                <el-col :span="6">供应商：{{item.crmName}}</el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column prop="sourceserial" label="订单号" width="150" />
                    <el-table-column prop="projectNo" label="项目号" width="150" sortable />
                    <el-table-column prop="projectName" label="项目名称" />
                    <el-table-column prop="boxNo" label="箱号" width="100" />
                    <el-table-column prop="allcount" label="配料总数" width="100" />
                    <el-table-column prop="deliveryDate" label="交货日期" width="125" sortable>
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

                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page"
                    :page-sizes="[5,20, 50, 100, 200, 500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next"
                    :total="total">
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
            crmList: [],
            total: 0,
            gridList: [],
            query: {
                page: 1,
                pagesize: 100
            },
            typesArr:[{'label':'售后91000','value':'91000'},{'label':'9#-3','value':'9#-3'},{'label':'2#-6','value':'2#-6'}],
            searchForm: {
                serial: '',
                projectNo:'',
                projectName:'',
                orderDate: '',
                types:'',
                deliveryDate: '',
                business: '',
            },
            orderBusiness: [{ label: '售后', value: 1 }, { label: '项目', value: 2 }],
            orderList: [],
            exportLoading: false,
            editRow: null,
            storeArr: [],            // 库存列表
            storeCalcLastId: 0,
            lastIndetId: 0,
        }
    },
    methods: {
        parseBusiness(val) {
            if (!val) return "";
            return val == 1 ? "售后" : "项目";
        },
        // 切换导出和未导出
        setOrderParams(flag) {
            this.$refs.searchForm.resetFields();
            this.isColled = flag;
            this.query.page = 1;
            this.getList();
        },
        setChecked(item, row) {
            let checkedCount = 0;
            row.result.forEach(item => {
                if (item.checked) {
                    checkedCount++;
                }
            });
            this.$refs.detailStore.toggleRowSelection(row, checkedCount > 0);
        },

        handleSelectionChange(rows) {
            this.orderList = rows;
            this.gridList.forEach(item => {
                let index = _.findIndex(rows, { "id": item.id });
                item.result.forEach(c => {
                    c.checked = !!~index;
                })
            });
        },
        totalCount(lists) {
            let allCount = 0, ids = [];
            lists.forEach(item => {
                if (item.checked) {
                    allCount += item.count;
                    ids.push(item.id);
                }
            });
            return { 'allCount': allCount, 'ids': ids };
        },
        exportTable() {
            this.exportLoading = true;
            //console.log('orderList', this.orderList);
            let exportData = [], index = 0, ids = [], allCounts = 0;
            this.orderList.forEach(order => {
                order.result.forEach(item=>{
                    if(item.checked){
                        ids.push(item.id);
                        allCounts += item.count;
                        let orderIndex = _.findIndex(exportData, {'materialNo':item.materialNo});
                        if(!~orderIndex){
                            exportData.push({
                                "materialNo":item.materialNo,
                                "productName": item.productName,
                                "count": item.count,
                                "deliveryDate": item.deliveryDate,
                                "a1": "",
                                "a2": "",
                                "a3": ""
                            })
                        }else{
                            exportData[orderIndex]['count'] += item.count;
                        }
                    }
                })
            });
            exportData = _.sortBy(exportData,['productName']);
            exportData = _.map(exportData, item=>{
                index++;
                item.inex = index;
                return item;
            })
            /* console.log('exportData', exportData, allCounts);
            this.exportLoading = false;
            return; */

            /* this.orderList.forEach(item => {
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
                allCounts += res.allCount;
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
            }); */
            
            /* this.exportLoading = false;
            return; */
            import('@/components/Export2Excel').then(excel => {
                const tHeader = ['序号', '物料名称', '物料号', '汇总数量', '包装日期', '配料人', '仓管', '领料人'];
                const filterVal = ['index', 'productName', 'materialNo', 'count', 'deliveryDate', 'a1', 'a1', 'a3'];
                const data = this.formatJson(filterVal, exportData);
                const now = moment(this.searchForm.deliveryDate ? this.searchForm.deliveryDate : new Date()).format('YYYYMMDDhhmmss');
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: '配料单-' + now
                });
                this.exportLoading = false;
                // 加入配料单表
                this.addIndet(ids, '配料单-' + now, allCounts);
                this.updateOrder(ids);
            });
        },
        addIndet(ids, serial, allCounts) {
            this.lastIndetId++;
            let condition = {
                type: 'addData',
                collectionName: 'ingred',
                //notNotice: true,
                data: {
                    "id": this.lastIndetId,
                    "serial": serial,
                    "orderIds": ids,
                    "count":allCounts,
                    "createByUser": this.$store.state.user.name
                }
            };
            this.$axios.$post('mock/db', { data: condition }).then(result => {
                console.log('addIndet', result);
            });
        },
        updateOrder(ids) {
            let cn = {
                type: 'outStore',//'updatePatch',
                collectionName: 'order',
                notNotice: true,
                data: { 'id': { $in: ids } },
                set: { $set: { 'isColled': true, 'flowStateId': 4, 'updateByUser': this.$store.state.user.name } }
            }
            let updateData = [];
            console.log('updateIds', ids);
            /* console.log('updateIds', ids);
            this.exportLoading = false;
            return */
            // 更新原始订单状态为已出库
            this.$axios.$post('mock/db', { data: cn }).then(result => {
                this.exportLoading = false;
                this.addStoreCalc(result);
                this.submitSearch(true);
            });
        },
        addStoreCalc(list) {
            /* console.log('addStoreCalc', list);
            debugger */
            let dataList = [];
            list.forEach(item => {
                //debugger
                dataList.push({
                    id: this.storeCalcLastId++,
                    typeId: item.typeId,
                    productName: item.productName,
                    materialNo: item.materialNo,
                    storeTypeId: 1, // 配料
                    price: item.price,
                    metaprice: item.metaprice,
                    util: item.util,
                    outcount: item.count,
                    storeCount: item.storeCount - item.count,
                    createByUser: this.$store.state.user.name
                })
            });
            //return;
            let condition = {
                type: 'addPatch',
                collectionName: 'storeCalc',
                data: dataList,
                notNotice: true
            };
            this.$axios.$post('mock/db', { data: condition });
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
                    } else if (_.isArray(this.searchForm[k]) && k === "deliveryDate") {
                        params[k] = {
                            $gte: this.searchForm[k][0],
                            $lt: this.searchForm[k][1] + 24 * 3600 * 1000 - 1
                        };
                    } else if (_.isArray(this.searchForm[k])) {
                        params[k] = { $in: this.searchForm[k] };
                    } else {
                        if(k == 'types'){
                            if(this.searchForm[k] == '91000'){
                                params['sourceserial'] = { $regex: this.searchForm[k] };
                            }else{
                                params['boxNo'] = this.searchForm[k];
                            }
                        }else{
                            params[k] = { $regex: this.searchForm[k] };
                        }
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
            let groupId = { "projectNo": "$projectNo" };
            match = _.merge({ "isColled": this.isColled, "flowStateId": 3, "typeId": 1 }, match);
            //match = _.merge({ "isColled": this.isColled, "flowStateId": { $gte: 2, $lt: 4 }, "typeId": 1 }, match);
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
                            "projectNo": { "$first": "$projectNo" },
                            "projectName": { "$first": "$projectName" },
                            "boxNo": { "$first": "$boxNo" },
                            "sourceserial": { "$first": "$sourceserial" },
                            "deliveryDate": { "$first": "$deliveryDate" },
                            "allcount": { $sum: "$count" },
                            "result": { "$push": "$$ROOT" }
                        }
                    },
                    { $sort: { "productName": 1, "deliveryDate": 1 } }, // "productName": 1, "projectNo": 1, 
                    { $skip: (this.query.page - 1) * this.query.pagesize },
                    { $limit: this.query.pagesize }
                ]
            };
            let result = await this.$axios.$post('mock/db', { data: condition });
            this.total = result.total;
            this.gridList = result.list.map(item => {
                item.result = _.sortBy(item.result, ['projectNo', 'deliveryDate']);
                item.result = item.result.map(c => {
                    c.checked = true;
                    return c;
                });
                return item;
            });
            //console.log('this.gridList', this.gridList);
            this.$nextTick(() => {
                this.$refs.detailStore.toggleAllSelection();
                this.listLoading = false;
            })
        },
        // 仓库待出库Id
        async _getLastId() {
            let cn = {
                type: "getId",
                data: {
                    model: "storeCalc"
                }
            };
            let res = await this.$axios.$post("mock/db", { data: cn });
            if (res) {
                this.storeCalcLastId = res;
                console.log('storeCalcLastId', this.storeCalcLastId)
            }
        },
        // 配料单Id
        async _getingredId() {
            let cn = {
                type: "getId",
                data: {
                    model: "ingred"
                }
            };
            let res = await this.$axios.$post("mock/db", { data: cn });
            if (res) {
                this.lastIndetId = res;
                console.log('lastIndetId', this.lastIndetId);
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
                this.crmList = this.setting.crm;
            }
        },
    },
    created() {
        this.getSetting();
        this._getLastId();
        this._getingredId();
    },
    mounted() {
        this.getList();
    }
}
</script>
<style lang="scss" scoped>
@import '~/assets/scss/order.scss';
</style>
