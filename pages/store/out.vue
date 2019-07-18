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
                    <el-form-item label="已推迟：" prop="isDelay">
                        <el-switch v-model="searchForm.isDelay" />
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
                    max-height="500" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="50" align="center" :selectable="checkSelectable" />
                    <el-table-column prop="isDelay" label="推迟送货" align="center" width="80">
                        <template slot-scope="scope">
                            <span v-if="!scope.row.isDelay">正常</span>
                            <span v-else style="color:blue">已推迟</span>
                        </template>
                    </el-table-column>
                    <el-table-column type="index" width="50" align="center">
                        <template slot-scope="scope">
                            <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                        </template>
                    </el-table-column>
                    <el-table-column type="expand">
                        <template slot-scope="scope" v-if="scope.row.result && scope.row.result.length">
                            <el-row :gutter="20" v-for="(item,idx) in scope.row.result" :key="item.id">
                                <el-col :span="4" :title="item.sourceserial">
                                    <span style="width:30px">{{idx+1}}、</span>
                                    <span>流程状态：{{parseFlow(item.flowStateId)}}</span>
                                </el-col>
                                <el-col :span="3" :class="{'warning':item.isCanceled}">订单状态：{{item.isCanceled?'已取消':'正常'}}</el-col>
                                <el-col :span="3">物料号：{{item.materialNo}}</el-col>
                                <el-col :span="5">物料描述：{{item.productName}}</el-col>
                                <el-col :span="4">梯形/梯号：{{item.model}}/{{item.modelNo}}</el-col>
                                <el-col :span="2">送货量：{{item.count}}</el-col>
                                <el-col :span="3">库存可用量：{{item.storeCount}}</el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column prop="serial" label="系统单号" width="150" />
                    <el-table-column label="蒂森订单号" width="120" v-if="needSource" sortable>
                        <template slot-scope="scope">
                            <span>{{scope.row.sourceserial}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="projectNo" label="项目号" width="150" sortable />
                    <el-table-column prop="projectName" label="项目名称" />
                    <el-table-column prop="total" label="订单量" width="80">
                        <template slot-scope="scope">
                            <span>{{scope.row.total}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="finishCount" label="可送货量" width="80" />
                    <el-table-column label="库存量计算" width="120">
                        <template slot-scope="scope">
                            <div v-if="calcStore(scope.row.result) && !scope.row.isCanceled">
                                <span class="warning">库存不足或未制单</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="orderDate" label="制单日期" width="100" sortable>
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.orderDate)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="deliveryDate" label="交货日期" width="125" sortable>
                        <template slot-scope="scope">
                            <div>
                                <span>{{parseDate(scope.row.deliveryDate)}}</span>
                                <el-button v-if="!scope.row.isCanceled" type="text" icon="el-icon-edit" style="margin-left:10px" @click="editDate(scope.row)"
                                />
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="isCanceled" label="操作" align="center" width="80">
                        <template slot-scope="scope">
                            <el-button v-if="scope.row.isCanceled" size="mini" class="icon-link" icon="my-icon-share" @click="handleCancel(scope.row, false)">恢复</el-button>
                            <el-button v-else size="mini" type="text" icon="my-icon-reply" @click="handleCancel(scope.row, true)">取消</el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="page-container" style="padding: 10px 0;">
                <div>
                    <span style="margin-right:15px;">请选择可以出库送货的订单，制定出库送货单</span>
                    <el-button size="mini" type="primary" :disabled="!orderList.length" @click="openDialogVisible=true">制订送货单({{orderList.length-1}})</el-button>
                    <el-button size="mini" type="primary" icon="el-icon-download" @click="batchDelay" :disabled="!selectSourceserial.length">批量推迟交货</el-button>

                </div>
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page"
                    :page-sizes="[5,20, 50, 100, 200, 500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next"
                    :total="total">
                </el-pagination>
            </div>
        </div>

        <el-dialog :title="editRow?'修改交货日期':'批量推迟交货'" append-to-body :visible.sync="editVisible" width="380px" @close="closeEdit">
            <div>
                <el-form size="mini" ref="editForm" :inline="true" :model="delayForm" :rules="delayRules">
                    <el-form-item label="交货日期" prop="deliveryDate">
                        <el-date-picker size="mini" value-format="timestamp" v-model="delayForm.deliveryDate" type="date" :clearable="false" placeholder="选择日期"
                            style="width:150px;" />
                    </el-form-item>
                    <el-form-item label="推迟" prop="isDelay">
                        <el-switch v-model="delayForm.isDelay" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="changeDate">确定</el-button>
                    </el-form-item>
                </el-form>
            </div>
        </el-dialog>

        <el-dialog :title="'送货清单--'+(needSource?'蒂森订单':'珏合订单')" append-to-body :visible.sync="openDialogVisible" width="65%">
            <div class="compare" v-if="currItem">
                <el-row :gutter="20">
                    <el-col :span="6">系统订单号：{{currItem.serial}}</el-col>
                    <el-col :span="6" v-if="needSource">蒂森订单号：{{currItem.sourceserial}}</el-col>
                    <el-col :span="6">项目号：{{currItem.projectNo}}</el-col>
                    <el-col :span="6">项目名称：{{currItem.projectName}}</el-col>
                    <el-col :span="6">制单日期：{{parseDate(currItem.orderDate)}}</el-col>
                    <el-col :span="6">交付日期：{{parseDate(currItem.deliveryDate)}}</el-col>
                    <el-col :span="6">订单总数：{{currItem.total}}</el-col>
                    <el-col :span="6" :class="{'warning':currItem.isCanceled}">订单状态：{{currItem.isCanceled?'已取消':'正常'}}</el-col>
                </el-row>
            </div>
            <el-table ref="exportTable" :data="orderList" border fit highlight-current-row stripe size="mini" max-height="350" style="width:100%">
                <el-table-column type="expand">
                    <template slot-scope="scope" v-if="scope.row.result && scope.row.result.length">
                        <el-row :gutter="20" v-for="(item,idx) in scope.row.result" :key="item.id">
                            <el-col :span="6" :title="item.sourceserial">
                                <span style="width:30px">{{idx+1}}、</span>
                                <span>蒂森订单号：{{item.sourceserial}}</span>
                            </el-col>
                            <el-col :span="4" :title="item.projectNo">项目号：{{item.projectNo}}</el-col>
                            <el-col :span="4">物料号：{{item.materialNo}}</el-col>
                            <el-col :span="7">物料描述：{{item.productName}}</el-col>
                            <el-col :span="3">数量：{{item.count}}</el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" width="50" align="center" />
                <el-table-column prop="projectName" label="项目名称" />
                <el-table-column prop="projectNo" label="项目号" width="120" />
                <el-table-column prop="modelNo" label="梯号" width="70" />
                <el-table-column label="订单号" width="150px">
                    <template slot-scope="scope">
                        <span v-if="needSource">{{scope.row.sourceserial}}</span>
                        <span v-else>{{scope.row.serial}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="partName" label="部件名称" />
                <el-table-column prop="boxCount" label="箱数" width="60" />
                <el-table-column label="配套数" width="80">
                    <template slot-scope="scope" v-if="scope.row.result">
                        <span>{{scope.row.result.length}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="count" label="交货日期" width="120">
                    <template slot-scope="scope">
                        <span v-if="scope.$index<orderList.length">{{parseDate(scope.row.deliveryDate)}}</span>
                    </template>
                </el-table-column>
            </el-table>
            <div class="update-form">
                <div>
                    <span>制定送货单之前，请核实订单号所包含的产品！</span>
                </div>
                <div>
                    <el-button size="mini" type="primary" icon="el-icon-download" @click="exportOrder" :loading="exportLoading">制定送货单</el-button>
                </div>
            </div>
        </el-dialog>
    </section>
</template>

<script>
export default {
    data() {
        return {
            needSource: true,
            listLoading: false,
            total: 0,
            gridList: [],
            query: {
                page: 1,
                pagesize: 500
            },
            searchForm: {
                serial: '',
                isDelay: false,
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
            storeCalcLastId: 0,
            editRow: null,
            editVisible: false,
            storeArr: [],            // 库存列表
            selectSourceserial: [],
            delayForm: {
                deliveryDate: '',
                isDelay: true,
            },
            delayRules: {
                deliveryDate: [{ required: true, message: '请选择交货日期', trigger: 'change' }],
            }

        }
    },
    methods: {
        calcStore(arr) {
            let flag = false;
            for (let i = 0; i < arr.length; i++) {
                if (arr[i]['count'] > arr[i]['storeCount'] || [1, 2, 4, 5, 6, 7, 9].includes(arr[i]['flowStateId'])) {
                    flag = true;
                    break;
                }
            }
            return flag;
        },
        closeEdit() {
            this.editRow = null;
            this.delayForm.deliveryDate = "";
        },
        batchDelay() {
            this.editVisible = true;
            this.editRow = null;
            this.delayForm.deliveryDate = "";
        },
        changeDate() {
            this.$refs['editForm'].validate((valid) => {
                if (valid) {
                    let sourceserial = this.editRow ? [this.editRow.sourceserial] : this.selectSourceserial;
                    let params = {
                        type: 'updateData',
                        collectionName: 'order',
                        multi: true,
                        condition: {
                            "sourceserial": { $in: sourceserial }
                        },
                        data: { ...this.delayForm }
                    };
                    console.log('changeDate', params);
                    //return;
                    this.$axios.$post('mock/db', { data: params }).then(result => {
                        sourceserial.forEach(item => {
                            let index = _.findIndex(this.gridList, { "sourceserial": item });
                            if (!!~index) {
                                let row = this.gridList[index];
                                row = _.merge(row, params.data)
                                this.$set(this.gridList, index, { ...row });
                            }

                        })

                        this.editRow = null;
                        this.editVisible = false;
                    });
                }
            });

        },
        // 修改交货日期
        editDate(row) {
            this.editVisible = true;
            this.delayForm.deliveryDate = row.deliveryDate;
            this.delayForm.isDelay = row.isDelay;
            this.editRow = _.cloneDeep(row);
        },
        // 推迟送花
        handleDelay(row, flag) {
            //console.log('handleCancel', row);
            this.$confirm('确定要' + (flag ? '推迟' : '正常') + '送货?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let condition = {
                    type: 'updatePatch',
                    collectionName: 'order',
                    param: { "sourceserial": row.sourceserial },
                    set: {
                        $set: {
                            'isDelay': flag
                        }
                    }
                }
                this.$axios.$post("mock/db", { data: condition }).then(result => {
                    this.$message.success("已" + (flag ? '推迟' : '恢复正常') + "送货");
                    row.isDelay = flag;
                    let index = _.findIndex(this.gridList, { id: row.id });
                    this.$set(this.gridList, index, row);
                });
            }).catch(() => { });
        },
        // 取消订单
        handleCancel(row, flag) {
            //console.log('handleCancel', row);
            this.$confirm('确定要' + (flag ? '取消' : '恢复') + '该送货单?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let condition = {
                    type: 'updatePatch',
                    collectionName: 'order',
                    param: { "sourceserial": row.sourceserial },
                    set: {
                        $set: {
                            'isCanceled': flag
                        }
                    }
                }
                this.$axios.$post("mock/db", { data: condition }).then(result => {
                    this.$message.error("已" + (flag ? '取消' : '恢复') + "送货单");
                    row.isCanceled = flag;
                    //debugger
                    let orderIndex = _.findIndex(this.orderList, { id: row.id }); //
                    if (!!~orderIndex && flag) {
                        this.$refs.detailStore.toggleRowSelection(row);
                    }
                    let index = _.findIndex(this.gridList, { id: row.id });
                    this.$set(this.gridList, index, row);
                });
            }).catch(() => { });
        },

        parseFlow(id) {
            if (!id) return "";
            let flow = _.find(this.setting.flowState, { id: id });
            return flow ? flow.name : "";
        },
        setOrderParams(flag) {
            this.needSource = flag;
            this.query.page = 1;
            this.getList();
        },

        checkSelectable(row) {
            return row.finished && !row.isCanceled;
        },
        handleSelectionChange(rows) {
            console.log('handleSelectionChange', rows)
            this.selectSourceserial = [];
            this.orderList = rows;
            if (rows.length) {
                this.updateIds = this.setUpdateIds(this.orderList);
                this.orderList.push({
                    projectName: "合计",
                    boxCount: rows.length
                });
                this.currItem = null;
                this.isCanExport = true;
                // 批量要处理的推迟日期
                rows.forEach(item => {
                    if (item.sourceserial) {
                        this.selectSourceserial.push(item.sourceserial);
                    }
                })
            }
        },
        exportOrder() {
            import('@/components/Export2Excel').then(excel => {
                const tHeader = ['项目名称', '项目号', '梯号', '订单号', '部件名称', '箱数', '交货日期', '备注'];
                const filterVal = ['projectName', 'projectNo', 'modelNo', 'sourceserial', 'partName', 'boxCount', 'deliveryDate', 'boxContent'];
                //debugger
                const data = this.formatJson(filterVal, _.cloneDeep(this.orderList));
                const now = moment(new Date()).format('YYYYMMDD');
                let title = this.needSource ? '蒂森送货单' : '珏合送货单';
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: title + '-' + now
                });
                this.updateOrder();
            });
        },
        updateOrder() {
            this.exportLoading = true;
            // 这里需要处理，更新原始订单状态， 更新库存 4505531472 4505532071
            let cn = {
                type: 'outStore',//'updatePatch',
                collectionName: 'order',
                notNotice: true,
                user: this.$store.state.user.name,
                data: { 'id': { $in: this.updateIds } },
                set: { $set: { 'flowStateId': 10, 'updateByUser': this.$store.state.user.name } }
            }
            let updateData = [];
            /* console.log('updateIds',this.updateIds)
            return */
            // 更新原始订单状态为已出库
            this.$axios.$post('mock/db', { data: cn }).then(result => {
                this.orderList = [];
                this.exportLoading = false;
                this.openDialogVisible = false;
                this.addStoreCalc(result);
                this.submitSearch(true);
            });
        },
        addStoreCalc(list) {
            let dataList = [];
            list.forEach(item => {
                //debugger
                dataList.push({
                    id: this.storeCalcLastId++,
                    typeId: item.typeId,
                    productName: item.productName,
                    materialNo: item.materialNo,
                    storeTypeId: 2,
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
        setUpdateIds(arr) {
            let updateIds = [];
            arr.forEach(item => {
                let ids = [];
                item.result.forEach(c => {
                    ids.push(c.id);
                });
                updateIds = updateIds.concat(ids);
            })
            return updateIds;
        },
        mergeOrder(lists) {
            let listData = [];
            lists.forEach(item => {
                item.children = [];
                let dataIndex = _.findIndex(listData, {
                    'productId': item.productId,
                    'materialNo': item.materialNo,
                    'price': item.price,
                });
                if (!!~dataIndex) {
                    listData[dataIndex]['children'].push(item);
                    listData[dataIndex]['count'] += item.count;
                } else {
                    item.children.push(_.cloneDeep(item));
                    listData.push(item);
                }
            });
            return listData;
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
                    } else if (_.isBoolean(this.searchForm[k])) {
                        params[k] = this.searchForm[k];
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
            let resStore = await this.$axios.$post("mock/db", { data: { type: "listData", collectionName: "store" } });
            let storeArr = [];
            if (resStore) {
                storeArr = resStore.list;
            }
            let groupId = { "sourceserial": "$sourceserial", "projectNo": "$projectNo" };
            let bySerial = { 'sourceserial': { $ne: '' } };
            if (!this.needSource) {
                bySerial = { 'sourceserial': '' };
                groupId = { "serial": "$serial", "projectNo": "$projectNo" };
            }
            match = _.merge({ flowStateId: { $lt: 10 } }, bySerial, match);
            //match = _.merge({ flowStateId: { $in: [3,8] } }, bySerial, match);
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
                            "isDelay": { "$first": "$isDelay" },
                            "isCanceled": { "$first": "$isCanceled" },
                            "serial": { "$first": "$serial" },
                            "sourceserial": { "$first": "$sourceserial" },
                            "projectNo": { "$first": "$projectNo" },
                            "projectName": { "$first": "$projectName" },
                            "modelNo": { "$first": "$modelNo" },
                            "orderDate": { "$first": "$orderDate" },
                            "deliveryDate": { "$first": "$deliveryDate" },
                            "total": { $sum: 1 },
                            "result": { "$push": "$$ROOT" }
                        }
                    },
                    { $sort: { "deliveryDate": 1, "projectNo": 1 } },
                    { $skip: (this.query.page - 1) * this.query.pagesize },
                    { $limit: this.query.pagesize }
                ]
            };
            let result = await this.$axios.$post('mock/db', { data: condition });
            this.total = result.total;
            this.gridList = result.list.map(item => {
                let checkStore = this.getIsCanExport(item.result, storeArr);
                item.finishCount = checkStore.finishCount;
                item.finished = item.finishCount == item.total;
                item.partName = "机房线槽总成";
                item.boxCount = 1;
                item.result = checkStore.list;
                return item;
            });
            console.log('this.gridList', this.gridList);
            this.listLoading = false;
        },
        // 比较库存量与实际送货量，确定是否可以送货
        getIsCanExport(arr, storeArr) {
            let finishCount = 0;
            let list = arr.map(item => {
                if (!item.isCanceled) {
                    let storeIndex = _.findIndex(storeArr, { "materialNo": item.materialNo });
                    let store = _.cloneDeep(_.find(storeArr, { "materialNo": item.materialNo }));
                    if (!!~storeIndex) {
                        item.storeCount = store.count;
                        if (store.count >= item.count) {
                            finishCount++;
                        }
                        store.count -= item.count;
                        this.$set(storeArr, storeIndex, store);
                    } else {
                        item.storeCount = 0;
                    }
                } else {
                    item.storeCount = 0;
                }
                return item;
            });
            return { list, finishCount };
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
                //this.getList();
            }
        },
        // 仓库待入库Id
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
            }
        },
        // 获取库存信息
        async getStore() {
            let cn = {
                type: "listData",
                collectionName: "store",
            };
            let res = await this.$axios.$post("mock/db", { data: cn });
            if (res) {
                this.storeArr = res.list;
            }
            this.getList();
        },
    },
    created() {
        this.getSetting();
        this._getLastId();
    },
    mounted() {
        this.getList();
    }
}
</script>
<style lang="scss" scoped>
@import '~/assets/scss/order.scss';
</style>
