<template>
    <section class="order-main">
        <div class="page-title">
            <div>
                <span>订单生产列表</span>
            </div>
        </div>
        <div class="grid-container">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <template v-if="isLike">
                        <el-form-item label="模糊查找：">
                            <el-input v-model="searchLike.keyword" clearable style="width:150px" @blur="submitSearch" />
                        </el-form-item>
                        <el-form-item>
                            <el-button type="text" @click="isLike=false">高级查找</el-button>
                        </el-form-item>
                    </template>
                    <template v-else>
                        <el-form-item label="订单状态：">
                            <el-select v-model="searchForm.flowStateId" placeholder="请选择">
                                <el-option v-for="flow in flowList.filter(o=>{return o.id>5})" :key="flow.id" :value="flow.id" :label="flow.name" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="订单编号：" prop="serial">
                            <el-input v-model="searchForm.serial" clearable style="width:120px" />
                        </el-form-item>
                        <el-form-item label="产品名称：" prop="productName">
                            <el-input v-model="searchForm.productName" clearable style="width:150px" />
                        </el-form-item>
                        <el-form-item label="客户：" prop="crmId">
                            <el-select v-model="searchForm.crmId" placeholder="请选择" clearable style="width:200px">
                                <el-option v-for="item in crmList" :key="item.id" :label="item.name" :value="item.id" />
                            </el-select>
                        </el-form-item>
                        <el-form-item label="项目号：" prop="projectNo">
                            <el-input v-model="searchForm.projectNo" clearable style="width:150px" />
                        </el-form-item>
                        <el-form-item label="箱号：" prop="boxNo">
                            <el-input v-model="searchForm.boxNo" clearable style="width:150px" />
                        </el-form-item>
                        <el-form-item label="型号/梯号：" prop="modelNo">
                            <el-input v-model="searchForm.modelNo" clearable style="width:150px" />
                        </el-form-item>
                        <el-form-item label="物料号/版本号：" prop="materialNo">
                            <el-input v-model="searchForm.materialNo" clearable style="width:150px" />
                        </el-form-item>
                        <el-form-item label="制单日期：" prop="orderDate">
                            <el-date-picker v-model="searchForm.orderDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期"
                                end-placeholder="结束日期" clearable editable unlink-panels style="width:220px" />
                        </el-form-item>
                        <el-form-item label="交付日期：" prop="deliveryDate">
                            <el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期"
                                end-placeholder="结束日期" clearable editable unlink-panels style="width:220px" />
                        </el-form-item>
                    </template>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
                    </el-form-item>
                    <el-form-item v-if="!isLike">
                        <el-button type="text" @click="isLike=true">模糊查找</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div>
                <el-table v-loading="listLoading" ref="detailTable" :data="gridList" border fit highlight-current-row stripe size="mini"
                    max-height="500" @row-click="detailRowClick" @selection-change="selectionChange">
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-row :gutter="20">
                                <el-col :span="8">
                                    <span>原始订单号:</span>
                                    <span>{{props.row.sourceserial}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>物料号/版本号:</span>
                                    <span>{{props.row.materialNo}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>图号/版本号:</span>
                                    <span>{{props.row.caselNo}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>物料名称:</span>
                                    <span>{{props.row.productName}}</span>
                                </el-col>
                                <el-col :span="8" :title="props.row.projectNo">
                                    <span>项目号:</span>
                                    <span>{{props.row.projectNo}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>项目名称:</span>
                                    <span>{{props.row.projectName}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>梯型:</span>
                                    <span>{{props.row.model}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>梯号:</span>
                                    <span>{{props.row.modelNo}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>数量:</span>
                                    <span>{{props.row.count}} {{props.row.util}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>制单人:</span>
                                    <span>{{props.row.createByUser}}</span>
                                </el-col>
                                <el-col :span="8">
                                    <span>备注:</span>
                                    <span>{{props.row.content}}</span>
                                </el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column v-if="searchForm.flowStateId==6" type="selection" width="55" align="center" :selectable="checkSelectable"
                    />
                    <el-table-column prop="flowStateId" label="流程状态" width="100">
                        <template slot-scope="scope">
                            <span>{{parseFlow(scope.row.flowStateId)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="serial" label="订单编号" width="150px" />
                    <el-table-column prop="crmName" label="客户名称" width="180px" />
                    <el-table-column prop="orderDate" label="制单日期" width="100px">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.orderDate)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="deliveryDate" label="交付日期" width="100px">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.deliveryDate)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="productName" label="订单产品" />
                    <el-table-column prop="materialNo" label="物料号/版本号" width="150px" />
                    <el-table-column prop="count" label="数量" width="60px">
                        <template slot-scope="scope">
                            <span>{{scope.row.count}}{{scope.row.util}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="flowStateId" label="操作" fixed="right" align="center" width="100">
                        <template slot-scope="scope">
                            <el-button size="mini" type="text" @click.stop="handleUpdate(scope.row)" v-if="scope.row.flowStateId<7">{{parseControl(scope.row.flowStateId)}}</el-button>
                            <span v-else>--</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="page-container" style="padding: 10px 0;">
                <span>
                    <el-button v-if="searchForm.flowStateId==6 && gridList.length" type="primary" icon="el-icon-document" @click="setPatch" :disabled="!patchIds.length">批量完成生产</el-button>
                </span>
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page"
                    :page-sizes="[20, 50, 100, 200,500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    data() {
        return {
            openDialogVisible: false,
            currItem: null,
            sourceCrmOrderList: [],
            crmOrderList: [],
            isMergeSerial: false,
            dialogForm: {
                crmId: '',
                flowStateId: 4,
            },
            setting: {},
            listLoading: false,
            total: 0,
            query: {
                page: 1,
                pagesize: 500
            },
            typeList: [],//settings.type,
            storeNoList: [],//settings.storeNo,
            flowList: [],//settings.flowState,
            gridList: [],
            crmList: [],
            isLike: true,
            searchLike: {
                keyword: ''
            },
            searchForm: {
                serial: '',
                flowStateId: 6,
                productName: '',
                projectNo: '',
                boxNo: '',
                modelNo: '',
                crmId: '',
                materialNo: '',
                orderDate: '',
                deliveryDate: ''
            },
            patchIds: [],
            crmOrderIds: [],
        }
    },
    methods: {
        selectionChange(selection) {
            this.patchIds = [];
            selection.forEach(item => {
                this.patchIds.push(item.id);
            })
        },
        setPatch() {
            if (!this.patchIds.length) {
                this.$message.error('请勾选订单');
                return;
            };
            //console.log('this.patchIds', this.patchIds);
            this.$confirm('操作将批量选中的订单更新为完成生产, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let condition = {
                    type: 'updatePatch',
                    collectionName: 'order',
                    param: { 'id': { $in: this.patchIds } },
                    set: { $set: { 'flowStateId': 7 } }
                };
                this.$axios.$post('mock/db', { data: condition }).then(result => {
                    //debugger
                    this.patchIds.forEach(id => {
                        let index = _.findIndex(this.gridList, { 'id': id });
                        let row = this.gridList[index];
                        row.flowStateId = 7;
                        this.$set(this.gridList, index, row);
                    });
                    this.$refs['detailTable'].clearSelection();
                    this.patchIds = [];
                    this.getList();
                });

            }).catch();
        },
        checkSelectable(row) {
            return row.flowStateId < 7;
        },
        detailRowClick(row) {
            row.extend = !row.extend ? true : false;
            this.$refs['detailTable'].toggleRowExpansion(row, row.extend);
        },
        parseMoney(row) {
            return this.$options.filters['currency'](row.count * row.price);
        },
        parseControl(id) {
            switch (id) {
                case 5:
                    return '下单生产';
                case 6:
                    return '完成生产';
            }
        },
        parseDate(date, format) {
            return moment(date).format(format || 'YYYY-MM-DD');
        },
        parseFlow(id) {
            if (!id || id == '') return '';
            let type = _.find(this.flowList, { id: id });
            return type.name;
        },
        handleSizeChange(val) {
            this.query.pagesize = val;
            this.submitSearch(true);
        },
        handleCurrentChange(val) {
            this.query.page = val;
            this.submitSearch(true);
        },
        handleUpdate(row) {
            let flowStateId = row.flowStateId + 1;
            let msg = flowStateId == 6 ? '此操作将确认开始进入订单生产' : '此操作将确认完成生产';
            this.$confirm(msg + ', 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let condition = {
                    type: 'updateData',
                    collectionName: 'order',
                    updateDate: true,
                    data: {
                        id: row.id,
                        flowStateId: flowStateId
                    }
                };
                this.$axios.$post('mock/db', { data: condition }).then(result => {
                    row.flowStateId = flowStateId;
                });

            }).catch(() => { });
        },
        submitSearch(flag) {
            let params = {};
            if (this.isLike) {
                let keyWord = this.searchLike.keyword;
                if (keyWord) {
                    params = {
                        $or: [
                            { 'serial': { '$regex': keyWord } },
                            { 'sourceserial': { '$regex': keyWord } },
                            { 'productName': { '$regex': keyWord } },
                            { 'crmName': { '$regex': keyWord } },
                            { 'materialNo': { '$regex': keyWord } },
                            { 'projectNo': { '$regex': keyWord } },
                            { 'boxNo': { '$regex': keyWord } },
                            { 'model': { '$regex': keyWord } },
                            { 'modelNo': { '$regex': keyWord } },
                            { 'projectName': { '$regex': keyWord } },
                            { 'caselNo': { '$regex': keyWord } },
                            { 'content': { '$regex': keyWord } }
                        ]
                    };
                }
            } else {
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
                            if (k === 'incount') {
                                params[k] = { $lt: Number(this.searchForm[k]) }
                            } else {
                                params[k] = { $regex: this.searchForm[k] };
                            }
                        }
                    }
                };
            }
            if (!flag) { // 不需要再做分页复位
                this.query = {
                    page: 1,
                    pagesize: 20
                }
            }
            this.getList(params);
        },
        // 合并订单数量,根据类型，产品名称，物料号，价格，梯形、梯号、项目号
        mergeOrder(lists) {
            let listData = [];
            this.crmOrderIds = [];
            lists.forEach(item => {
                this.crmOrderIds.push(item.id);
                let dataIndex = _.findIndex(listData, { 'typeId': item.typeId, 'productName': item.productName, 'materialNo': item.materialNo, 'model': item.model, 'modelNo': item.modelNo, 'price': item.price, 'caselNo': item.caselNo });
                if (dataIndex > -1) {
                    //debugger
                    let sIndex = listData[dataIndex]['sourceserial'].split(',');
                    if (!~sIndex) {
                        listData[dataIndex]['sourceserial'] += ',' + item.sourceserial;
                    }
                    if (listData[dataIndex]['projectNo'].indexOf(item.projectNo) < 0) {
                        listData[dataIndex]['projectNo'] += ',' + item.projectNo;
                    }
                    listData[dataIndex]['count'] += item.count;
                } else {
                    listData.push(item);
                }
            });
            return listData;
        },
        // 获取已经下单的订单
        async getList(match = {}) {
            this.listLoading = true;
            let condition = {
                type: 'listData',
                collectionName: 'order',
                page: this.query.page,
                pagesize: this.query.pagesize,
                sortby: 'flowStateId',
                ascby: 1,
                data: _.merge({ typeId: 2, flowStateId: 6 }, match) //{'$gte':6}
            };
            let result = await this.$axios.$post('mock/db', { data: condition });
            this.total = result.total;
            this.gridList = result.list;//this.mergeOrder(result.list);//
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
                console.log('getSetting', result)
                this.setting = result.content;
                this.typeList = this.setting.type;
                this.storeNoList = this.setting.storeNo;
                this.flowList = _.filter(this.setting.flowState, item => {
                    return item.id > 4;
                });
                this.crmList = _.filter(this.setting.crm, { typeId: 2 });
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
.finished-flow {
	color: #08750e;
	font-weight: 700;
}
.wait-flow {
	color: #e2420b;
	font-weight: 700;
}
.grid-container {
	/deep/ .el-table {
		.cell {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.el-table__expanded-cell {
			padding: 20px;
			.el-row {
				.el-col {
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
					line-height: 25px;
					> span {
						&:first-child {
							width: 80px;
							display: inline-block;
							font-weight: bold;
						}
					}
				}
			}
		}
		.el-form-item {
			width: 32%;
			margin: 0;
			.el-form-item__label {
				font-weight: bold;
			}
			.el-form-item__content {
			}
		}
	}
	.page-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
}
</style>
