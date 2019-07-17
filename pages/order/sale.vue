<template>
    <section class="order-main">
        <div class="head-title">
            <div>
                <div v-if="!isEdit">
                    <span :class="{'inactive':needSource}" @click="setOrderParams(true)">蒂森生产订单</span>
                    <span :class="{'inactive':!needSource}" @click="setOrderParams(false)">珏合生产订单</span>
                </div>
                <div v-else>
                    <span>订单编辑</span>
                </div>
            </div>
            <div>
                <span v-if="!isEdit">
                    <el-button @click="handleAdd" type="text" size="medium" icon="el-icon-plus">新增珏合生产订单</el-button>
                    <el-button v-if="gridList.length" @click="showDetail" type="text" size="medium" icon="el-icon-document">制定生产订单</el-button>
                </span>
                <span v-else>
                    <el-button @click="cancelBack" type="text" size="medium" icon="el-icon-close">取消返回</el-button>
                </span>
            </div>
        </div>
        <!--表格内容-->
        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="蒂森订单号：" prop="sourceserial" v-if="needSource">
                        <el-input v-model="searchForm.sourceserial" clearable style="width:100px" />
                    </el-form-item>
                    <el-form-item label="珏合订单号：" prop="serial" v-else>
                        <el-input v-model="searchForm.serial" clearable style="width:100px" />
                    </el-form-item>
                    <el-form-item label="客户：" prop="crmId">
                        <el-select v-model="searchForm.crmId" placeholder="请选择" clearable>
                            <el-option v-for="(crm,idx) in crmList" :key="idx" :label="crm.name" :value="crm.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="产品名称：" prop="productName">
                        <el-input v-model="searchForm.productName" clearable style="width:150px" />
                    </el-form-item>
                    <el-form-item label="项目号：" prop="projectNo">
                        <el-input v-model="searchForm.projectNo" clearable style="width:150px" />
                    </el-form-item>
                    <el-form-item label="箱号：" prop="boxNo" v-if="needSource">
                        <el-input v-model="searchForm.boxNo" clearable style="width:150px" />
                    </el-form-item>
                    <el-form-item label="型号/梯号：" prop="modelNo" v-if="needSource">
                        <el-input v-model="searchForm.modelNo" clearable style="width:150px" />
                    </el-form-item>
                    <el-form-item label="物料号/版本号：" prop="materialNo">
                        <el-input v-model="searchForm.materialNo" clearable style="width:150px" />
                    </el-form-item>
                    <el-form-item label="制单日期：" prop="orderDate">
                        <el-date-picker v-model="searchForm.orderDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
                    </el-form-item>
                    <el-form-item label="交付日期：" prop="deliveryDate">
                        <el-date-picker v-model="searchForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <el-table v-loading="listLoading" ref="listTable" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500">
                <el-table-column type="index" width="70" label="序号" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                    </template>
                </el-table-column>
                <el-table-column type="expand">
                    <template slot-scope="props">
                        <el-row :gutter="20" v-for="(item,idx) in props.row.result.filter(o=>o.typeId==2)" :key="item.id">
                            <el-col :span="2" :class="{'warning':item.isCanceled}">
                                <span style="width:30px">{{idx+1}}.</span>状态：{{item.isCanceled?'已取消':'正常'}}</el-col>
                            <el-col :span="3">物料号：{{item.materialNo}}</el-col>
                            <el-col :span="5">物料描述：{{item.productName}}</el-col>
                            <el-col :span="2">梯号：{{item.modelNo}}</el-col>
                            <el-col :span="3">订单单价：{{item.price}}</el-col>
                            <el-col :span="3">生产单价：{{item.metaprice}}</el-col>
                            <el-col :span="2">数量：{{item.count}}</el-col>
                            <el-col :span="4">
                                <el-button type="text" @click="showDetail(item)">客户：{{item.crmName}}</el-button>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column prop="sourceserial" :label="needSource?'蒂森订单号':'珏合订单号'" width="120">
                    <template slot-scope="scope">
                        <span v-if="needSource">{{scope.row.sourceserial}}</span>
                        <span v-else>{{scope.row.serial}}</span>
                    </template>
                </el-table-column>
<<<<<<< HEAD
                <el-table-column prop="projectNo" label="项目号" width="150" sortable />
=======
>>>>>>> 96229637a28dbc57d9f0dff1bdf2ca241d6b8a51
                <el-table-column prop="projectName" label="项目名称" />

                <el-table-column prop="count" label="订单合计数" width="100">
                    <template slot-scope="scope">
                        <span v-if="needSource">{{scope.row.total}} 套</span>
                        <span v-else>{{scope.row.count}}</span>
                    </template>
                </el-table-column>
                <el-table-column label="生产总价" width="100">
                    <template slot-scope="scope">
                        <span>{{parseListMoney(scope.row.result)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="orderDate" label="下单日期" width="100">
                    <template slot-scope="scope">
                        <span>{{parseDate(scope.row.orderDate)}}</span>
                    </template>
                </el-table-column>
<<<<<<< HEAD
                <el-table-column prop="deliveryDate" label="交付日期" width="100" sortable>
=======
                <el-table-column prop="deliveryDate" label="交付日期" width="100">
>>>>>>> 96229637a28dbc57d9f0dff1bdf2ca241d6b8a51
                    <template slot-scope="scope">
                        <span>{{parseDate(scope.row.deliveryDate)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="isCanceled" label="订单取消" width="80">
                    <template slot-scope="scope">
                        <el-button v-if="!scope.row.isCanceled" size="mini" class="icon-link" icon="my-icon-close" @click="handleCancel(scope.row, true)">取消</el-button>
                        <el-button v-else size="mini" class="icon-link" icon="my-icon-clone" @click="handleCancel(scope.row, false)">恢复</el-button>
                    </template>
                </el-table-column>
                <el-table-column label="操作" fixed="right" align="center" :width="needSource?'90':'120'">
                    <template slot-scope="scope">
                        <el-button v-if="!needSource" size="mini" type="text" icon="el-icon-edit" @click="handleUpdate(scope.row)">编辑</el-button>
                        <el-button size="mini" type="text" icon="el-icon-delete" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="page-container" style="padding: 10px 0;">
                <div>共有{{total}}个采购订单，请点击订单号操作下单流程</div>
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page"
                    :page-sizes="[20, 50, 100, 200,500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total"></el-pagination>
            </div>
        </div>
        <!--订单录入-->
        <div class="form-container" v-else>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" size="mini">
                <el-form-item label="产品分类" prop="ptypeId">
                    <el-select v-model="ruleForm.ptypeId" placeholder="请选择" filterable clearable @change="setPtype">
                        <el-option v-for="ptype in ptypeList" :key="ptype.id" :label="ptype.name" :value="ptype.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="产品名称" prop="productId">
                    <el-select v-model="ruleForm.productId" placeholder="请选择" filterable @change="setProduct" style="width:300px">
                        <el-option v-for="product in proList" :key="product.id" :label="product.name+'('+product.materialNo+')'" :value="product.id"
                        />
                    </el-select>
                </el-form-item>
                <el-form-item label="订单编号" prop="serial">
                    <el-input v-model="ruleForm.serial" style="width:300px">
                        <template slot="append">
                            <el-button type="text" style="padding: 0 10px" @click="handleSerial">自动生成</el-button>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="客户名称" prop="crmName">
                    <el-select v-model="ruleForm.crmId" placeholder="请选择" filterable @change="getCrmName" style="width:300px">
                        <el-option v-for="crm in crmList" :key="crm.id" :label="crm.name" :value="crm.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="客户ID" prop="crmNo">
                    <el-input v-model="ruleForm.crmNo" placeholder="请输入" style="width:200px" />
                </el-form-item>
                <el-form-item label="制单日期" prop="orderDate">
                    <el-date-picker v-model="ruleForm.orderDate" value-format="timestamp" type="date" placeholder="选择日期" style="width:200px"
                    />
                </el-form-item>
                <el-form-item label="交付日期" prop="deliveryDate">
                    <el-date-picker v-model="ruleForm.deliveryDate" value-format="timestamp" type="date" placeholder="选择日期" style="width:200px"
                    />
                </el-form-item>
                <el-form-item label="规格/梯型" prop="model">
                    <el-input v-model="ruleForm.model" placeholder="请输入" style="width:200px" />
                </el-form-item>
                <el-form-item label="型号/梯号" prop="modelNo">
                    <el-input v-model="ruleForm.modelNo" placeholder="请输入" style="width:200px" />
                </el-form-item>
                <el-form-item label="箱号" prop="boxNo">
                    <el-input v-model="ruleForm.boxNo" placeholder="请输入" style="width:200px" />
                </el-form-item>
                <el-form-item label="项目名称" prop="projectName">
                    <el-input v-model="ruleForm.projectName" placeholder="请输入" style="width:200px" />
                </el-form-item>
                <el-form-item label="项目号" prop="projectNo">
                    <el-input v-model="ruleForm.projectNo" placeholder="请输入" style="width:200px" />
                </el-form-item>
                <el-form-item label="物料号/版本号" prop="materialNo">
                    <el-input v-model="ruleForm.materialNo" placeholder="请输入" style="width:200px" />
                </el-form-item>
                <el-form-item label="图号/版本号" prop="caselNo">
                    <el-input v-model="ruleForm.caselNo" placeholder="请输入" style="width:200px" />
                </el-form-item>
                <el-form-item label="订单数量" prop="count">
                    <el-input v-model="ruleForm.count" placeholder="请输入" style="width:100px" />
                </el-form-item>
                <el-form-item label="单位" prop="util">
                    <el-input v-model="ruleForm.util" placeholder="请输入" style="width:100px" />
                </el-form-item>
                <el-form-item label="订单单价" prop="price">
                    <el-input-number v-model="ruleForm.price" controls-position="right" :min="0" :step="0.1" placeholder="请输入" style="width:120px"
                    />
                </el-form-item>
                <el-form-item label="生产单价" prop="metaprice">
                    <el-input-number v-model="ruleForm.metaprice" controls-position="right" :min="0" :step="0.1" placeholder="请输入" style="width:120px"
                    />
                </el-form-item>
                <el-form-item label="备注说明" prop="content">
                    <el-input v-model="ruleForm.content" type="textarea" :autosize="{ minRows: 3, maxRows: 10}" placeholder="请输入内容"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="medium" @click="submitForm">提交保存</el-button>
                    <el-button type="infor" size="medium" @click="isEdit=false">取消返回</el-button>
                </el-form-item>
            </el-form>
        </div>
        <!--制定全部订单-->
        <el-dialog :title="needSource?'蒂森生产订单':'珏合生产订单'" append-to-body :close-on-click-modal="false" :visible.sync="openDialogVisible"
            width="90%">
            <div class="form-dialog">
                <el-form :inline="true" :model="dialogForm" ref="dialogForm" size="mini">
                    <el-form-item label="按客户：" prop="crmId">
                        <el-select v-model="dialogForm.crmId" placeholder="请选择" style="width:300px" @change="dialogSearch">
                            <el-option v-for="(crm,idx) in crmList" :key="idx" :label="crm.name" :value="crm.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="按下单日期：" prop="orderDate">
                        <el-date-picker v-model="dialogForm.orderDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
                    </el-form-item>
                    <el-form-item label="按交付日期：" prop="deliveryDate">
                        <el-date-picker v-model="dialogForm.deliveryDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期"
                            end-placeholder="结束日期" clearable editable unlink-panels style="width:250px" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="dialogSearch" icon="el-icon-search" :loading="searchLoading" :disabled="!dialogForm.crmId">查询</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <div class="compare" ref="printTable" v-if="currItem">
                <div class="order-title">
                    <span>客户：{{currItem.crmName}}，地址：{{currItem.address}}，联系人：{{currItem.contactName}}，电话：{{currItem.contactPhone}}</span>
                </div>
                <div class="order-title" style="padding:10px 0" v-if="crmOrderList.length">
                    <span style="font-weight:bold">订单总价：{{parseAllOrderMoney(crmOrderList)}}</span>
                </div>
                <el-table class="detail-table" :data="crmOrderList" @selection-change="handleSelectionOrders" border fit highlight-current-row
                    stripe size="mini" max-height="350" v-loading="searchLoading" ref="crmorder">
                    <el-table-column type="selection" width="55" align="center" :selectable="checkSelectable" />
                    <el-table-column type="expand">
                        <template slot-scope="props">
                            <el-row :gutter="20" v-for="(item,idx) in props.row.children" :key="item.id">
                                <el-col :span="3">{{idx+1}}.订单号：{{needSource?item.sourceserial:item.serial}}</el-col>
                                <el-col :span="2" :class="{'warning':item.isCanceled}">状态：{{item.isCanceled?'已取消':'正常'}}</el-col>
                                <el-col :span="5">项目：{{item.projectName}}</el-col>
                                <el-col :span="4">物料：{{item.materialNo}}</el-col>
                                <el-col :span="2">梯号：{{item.modelNo}}</el-col>
                                <el-col :span="2">订单量：{{item.count}}</el-col>
                                <el-col :span="3">下单日期：{{parseDate(item.orderDate)}}</el-col>
                                <el-col :span="3">交付日期：{{parseDate(item.deliveryDate)}}</el-col>
                            </el-row>
                        </template>
                    </el-table-column>
                    <el-table-column :prop="needSource?'sourceserial':'serial'" :label="needSource?'蒂森生产订单':'珏合生产订单'" />
                    <el-table-column prop="materialNo" label="型号/物料号" width="100" />
                    <el-table-column prop="productName" label="产品名称" />
                    <el-table-column prop="count" label="订单总量" width="80">
                        <template slot-scope="scope">
                            <span>{{scope.row.count}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="storeCount" label="库存量" width="60" />
                    <el-table-column label="已制单未入库参考" width="180">
                        <template slot-scope="scope">
                            <div v-if="scope.$index<crmOrderList.length-1">
                                <span>订单量：{{scope.row.storeIn && scope.row.storeIn.count}}；</span>
                                <span>实际量：{{scope.row.storeIn && scope.row.storeIn.incount}}</span>
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="cancelTotal" label="订单取消量" width="90">
                        <template slot-scope="scope" v-if="scope.$index<crmOrderList.length-1">
                            <span v-if="scope.row.cancelTotal">{{scope.row.cancelTotal}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="releaseCount" label="实际生产量" width="90">
                        <template slot-scope="scope">
                            <span>{{scope.row.releaseCount}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="price" label="订单单价" width="80" />
                    <el-table-column label="生产单价" prop="metaprice" width="100">
                        <template slot-scope="scope">
                            <div v-if="scope.$index<crmOrderList.length-1">
                                <el-input-number size="mini" controls-position="right" :min="0" :step="0.1" v-model="scope.row.metaprice" @change="setRowMetaPrice(scope.row)"
                                    style="width:80px" />
                            </div>
                        </template>
                    </el-table-column>
                    <el-table-column prop="allPrice" label="订单金额" width="100">
                        <template slot-scope="scope">
                            <span v-if="scope.$index<crmOrderList.length-1">{{parseReleaseMoney(scope.row)}}</span>
                            <span v-else>{{scope.row.allPrice | currency}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="deliveryDate" label="交付日期" width="100">
                        <template slot-scope="scope">
                            <span>{{parseDate(scope.row.deliveryDate)}}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="btns" v-if="crmOrderList.length">
                <div>共有{{crmOrderList.length-1}}个生产订单</div>
                <div>
                    <span>制单交货日期：</span>
                    <el-date-picker size="small" v-model="finishedDate" value-format="timestamp" :clearable="false" type="date" placeholder="选择日期"
                        style="width:150px;margin-right:10px" />
                    <el-button type="success" @click="exportOrder(crmOrderList)" icon="el-icon-document" :loading="exportLoading">制单生产</el-button>
                </div>
            </div>
        </el-dialog>

    </section>
</template>
<script>
export default {
    name: "role",
    data() {
        return {
            needSource: true,
            openDialogVisible: false,
            currItem: null,
            crmOrderList: [],
            sourceCrmOrderList: [],
            isMergeSerial: false,
            dialogForm: {
                crmId: 4,
                orderDate: "",
                deliveryDate: ""
            },
            setting: {},
            isEdit: false,
            listLoading: false,
            typeList: [], //settings.type,
            ptypeList: [],
            flowList: [], //settings.flowState,
            crmList: [],
            productList: [],
            proList: [],
            query: {
                page: 1,
                pagesize: 500
            },
            gridList: [],
            total: 0,
            dataId: undefined,
            editRow: null,
            searchForm: {
                serial: "",
                sourceserial: "",
                crmId: "",
                productName: "",
                projectNo: "",
                boxNo: "",
                modelNo: "",
                materialNo: "",
                orderDate: "",
                deliveryDate: ""
            },
            ruleForm: {
                typeId: 1,
                flowStateId: 5,
                ptypeId: "",
                serial: "",
                productId: "",
                productName: "",
                orderDate: new Date().getTime(),
                deliveryDate: "",
                model: "",
                modelNo: "",
                boxNo: "",
                projectName: "",
                projectNo: "",
                materialNo: "",
                caselNo: "",
                crmId: "",
                crmName: "",
                crmNo: "",
                count: "",
                util: "",
                price: "",
                metaprice: "",
                content: ""
            },
            rules: {
                serial: [
                    { required: true, message: "请输入订单编号", trigger: "change" }
                ],
                productName: [
                    { required: true, message: "请选择产品", trigger: "change" }
                ],
                orderDate: [
                    { required: true, message: "请输入制单日期", trigger: "change" }
                ],
                deliveryDate: [
                    { required: true, message: "请输入交付日期", trigger: "change" }
                ],
                count: [{ required: true, message: "请输入订单数量", trigger: "blur" }],
                price: [{ required: true, message: "请输入订单单价", trigger: "blur" }],
                metaprice: [{ required: true, message: "请输入生产单价", trigger: "blur" }]
            },
            updateForm: {
                deliveryDate: ""
            },
            updateRules: {
                deliveryDate: [
                    { required: true, message: "请选择日期", trigger: "change" }
                ]
            },
            lastId: 0,
            storeLastId: 0,
            openSourceVisible: false,
            detailItem: null,
            currSerial: "",
            sourceData: [],
            searchLoading: false,
            exportLoading: false,
            exportOrders: [],
            orderSerial: '',
            finishedDate: new Date().getTime(),
        };
    },
    methods: {
        checkSelectable(row) {
            return true;
            let flag = false;
            if (row && row.id) {
                if (!row.releaseCount) {
                    flag = false;
                } else {
                    let rc = row.storeIn.incount - row.storeIn.count + row.releaseCount + row.storeCount + row.cancelTotal;
                    flag = rc >= row.count;
                }
                if (!flag) {
                    let index = _.findIndex(this.exportOrders, { "id": row.id });
                    if (!!~index) {
                        this.$refs.exportTable.toggleRowSelection(row, false);
                    }
                }
            }
            return flag;
        },
        handleSelectionOrders(orders) {
            this.exportOrders = orders;
        },

        parseListMoney(lists) {
            let money = 0;
            lists.forEach((item, index) => {
                if (item.typeId == 1) {
                    money += parseInt(item.count) * item.metaprice;
                }
            });
            return this.$options.filters["currency"](money);
        },
        parseReleaseMoney(row) {
            if (row.flowStateId == 5) {
                row.allPrice = parseInt(row.releaseCount) * row.metaprice;
            } else {
                row.allPrice = parseInt(row.store.incount) * row.store.metaprice;
            }
            return this.$options.filters["currency"](row.allPrice);
        },
        parseAllOrderMoney(dataList) {
            let money = 0;
            dataList.forEach((item, index) => {
                if (index < dataList.length - 1) {
                    money += parseInt(item.releaseCount) * item.metaprice;
                }
            });
            dataList[dataList.length - 1]["allPrice"] = money;
            return this.$options.filters["currency"](money);
        },
        setRowMetaPrice(row) {
            //console.log(row);
            if (row.children && row.children.length) {
                row.children.forEach(item => {
                    item.metaprice = row.metaprice;
                })
            }
        },
        setMetaPrice(row, dataList) {
            let money = 0;
            dataList.forEach((item, index) => {
                if (index < dataList.length - 1) {
                    money += parseInt(item.releaseCount) * item.metaprice;
                }
            });
            dataList[dataList.length - 1]["allPrice"] = money;
        },
        checkReleaseCount(row, dataList) {
            if (row) {
                row.releaseCount = !row.releaseCount ? 0 : row.releaseCount;
            }
            let releaseCount = 0, count = 0, money = 0;
            dataList.forEach((item, index) => {
                if (index < dataList.length - 1) {
                    money += parseInt(item.releaseCount) * item.metaprice;
                    releaseCount += parseInt(item.releaseCount);
                    count += parseInt(item.count);
                }
            });
            dataList[dataList.length - 1]["count"] = count;
            dataList[dataList.length - 1]["releaseCount"] = releaseCount;
            dataList[dataList.length - 1]["allPrice"] = money;
        },
        totalReleaseCount(dataList) {
            let count = 0;
            dataList.forEach((item, index) => {
                if (index < dataList.length - 1) {
                    count += parseInt(item.releaseCount);
                }
            });
            return count;
        },
        // 修改蒂森订单的交货日期
        updateDeliveryDate(dataList) {
            this.$confirm("此操作将修改订单号为:" + this.detailItem.sourceserial + "所有数据的交货日期(包括采购订单), 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                let condition = {
                    type: "updateData",
                    collectionName: "order",
                    multi: true,
                    updateDate: true,
                    condition: { sourceserial: this.detailItem.sourceserial },
                    data: { deliveryDate: this.updateForm.deliveryDate }
                };
                this.$axios.$post("mock/db", { data: condition }).then(result => {
                    this.gridList.forEach(item => {
                        if (item.sourceserial == this.detailItem.sourceserial) {
                            item.deliveryDate = this.updateForm.deliveryDate;
                        }
                    });
                    dataList.forEach(item => {
                        if (item.deliveryDate) {
                            item.deliveryDate = this.updateForm.deliveryDate;
                        }
                    });
                });
            }).catch();
        },
        // 删除蒂森订单
        handleDeleteBySerial(item) {
            this.$confirm("此操作将删除订单号为:" + (this.needSource ? item.sourceserial : item.serial) + "所有数据(包括采购订单), 是否继续?", "特别提示：请谨慎操作删除", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                let condition = {
                    type: "removeData",
                    collectionName: "order",
                    data: { serial: item.serial }
                };
                if (this.needSource) {
                    condition.data = { sourceserial: item.sourceserial };
                }
                this.$axios.$post("mock/db", { data: condition }).then(result => {
                    this.$message({
                        type: "success",
                        message: "删除成功!"
                    });
                    this.submitSearch(true);
                    this.openSourceVisible = false;
                    this.detailItem = null;
                });
            }).catch(() => { });
        },

        setOrderSerial() {
            let now = moment(new Date()).format("YYYY-MM-DD HH:mm:ss");
            now = now.split(" ");
            let dd = now[0].split("-");
            let tt = now[1].split(":");
            let serial = "JH" + dd[0] + "" + dd[1] + "" + dd[2] + "" + tt[0] + "" + tt[1] + "" + tt[2];
            return serial;
        },

        exportOrder(dataList) {
            if (!this.exportOrders.length) {
                this.$message.error("请勾选需要制定的生产订单");
                return;
            }
            this.exportOrderIds = [];
            let exportData = [];
            this.orderSerial = this.setOrderSerial();
            let arrList = [], startDate = 999999999999999999, endDate = 0, num = 1;
            //debugger
            this.exportOrders.forEach(item => {
                if (item && item.id && item.releaseCount >= 0) {
                    item.orderSerial = this.orderSerial;
                    item.finishedDate = this.finishedDate;
                    exportData.push(item);
                    item.children.forEach((order, idx) => {
                        if (!order.isCanceled) {
                            order.num = num;
                            if (order.orderDate < startDate) {
                                startDate = order.orderDate;
                            }
                            if (order.orderDate > endDate) {
                                endDate = order.orderDate;
                            }
                            this.exportOrderIds.push(order.id);
                            arrList.push(order);
                            num++;
                        }
                    })
                }
            });

            import("@/components/Export2Excel").then(excel => {
                const tHeader = ["序号", "下单日期", "项目名称", "项目号", "梯号", "交货日期", "物料号", "梯形", "图号", "物料描述", "焊接长度", "A", "B", "连接长度", "斜撑"];
                const filterVal = ["num", "orderDate", "projectName", "projectNo", "modelNo", "deliveryDate", "materialNo", "model", "caselNo", "productName"];
                const data = this.formatJson(filterVal, arrList);
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: "计划单" + moment(startDate).format("MM.DD") + '-' + moment(endDate).format("MM.DD"),
                    autoWidth: true,
                    bookType: "xlsx"
                });
                this.updateOrderByCrm(exportData);
            });

        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v =>
                filterVal.map(j => {
                    if (j == "finishedDate" || j == "orderDate" || j == "deliveryDate") {
                        v[j] = this.parseDate(v[j]);
                    }
                    return v[j];
                })
            );
        },
        getChildrenByid(arr, id) {
            let ids = [];
            if (arr && arr.length) {
                arr.forEach(item => {
                    if (!item.isCanceled) {
                        ids.push(item.id);
                    }
                });
            } else {
                ids.push(id);
            }
            return ids;
        },
        // 更新客户订单状态（已发单）
        updateOrderByCrm(dataList) {
            let cn = {
                type: "updatePatch",
                collectionName: "order",
                notNotice: true,
                param: {
                    crmId: this.dialogForm.crmId,
                    id: { $in: this.exportOrderIds },
                    isCanceled: false
                },
                set: { $set: { flowStateId: 6 } }
            };
            let storeData = [];
            dataList.forEach(item => {
                if (item.id && !item.isCanceled) {
                    this.storeLastId++;
                    storeData.push({
                        id: this.storeLastId,
                        isAdded: false,
                        typeId: item.typeId,
                        orderId: item.id,
                        orderIds: this.getChildrenByid(item.children, item.id),
                        orderSerial: this.orderSerial,
                        serial: item.serial,
                        sourceserial: item.sourceserial,
                        crmId: item.crmId,
                        crmName: item.crmName,
                        productId: item.productId,
                        productName: item.productName,
                        materialNo: item.materialNo,
                        model: item.model,
<<<<<<< HEAD
                        projectNo: item.projectNo,
=======
>>>>>>> 96229637a28dbc57d9f0dff1bdf2ca241d6b8a51
                        projectName: item.projectName,
                        price: item.price,
                        metaprice: item.metaprice,
                        util: item.util,
                        count: item.count - item.cancelTotal,
                        incount: item.releaseCount,
                        deliveryDate: item.deliveryDate,
                        finishedDate: this.finishedDate,
                        createByUser: this.$store.state.user.name
                    });
                }
            });
			/* debugger
            console.log("storeData", storeData);
            return; */
            this.$axios.$post("mock/db", { data: cn }).then(result => {
                // 注意此处需保存数据到仓库中
                let condition = {
                    type: "addPatch",
                    collectionName: "storeIn",
                    data: storeData
                };
                //debugger
                this.$axios.$post("mock/db", { data: condition }).then(result => {
                    //this.openSourceVisible = false;
                    this.exportLoading = false;
                    this.exportOrders = [];
                    this.crmOrderIds = [];
                    this.crmOrderList = [];
                    this.submitSearch(true);
                });
            });
        },
        showDetail(row) {
            this.crmOrderList = [];
            this.openDialogVisible = true;
            this.$nextTick(() => {
                this.$refs.dialogForm.resetFields();
                if (row && row.crmId) {
                    this.dialogForm.crmId = row.crmId;
                }
                this.dialogSearch();
            })
        },
        dialogSearch() {
            let params = {
                //flowStateId: this.dialogForm.flowStateId,
                crmId: this.dialogForm.crmId
            };

            if (this.dialogForm.orderDate) {
                params.orderDate = {
                    $gte: this.dialogForm.orderDate[0],
                    $lt: this.dialogForm.orderDate[1] + 24 * 3600 * 1000 - 1
                };
            }
            if (this.dialogForm.deliveryDate) {
                params.deliveryDate = {
                    $gte: this.dialogForm.deliveryDate[0],
                    $lt: this.dialogForm.deliveryDate[1] + 24 * 3600 * 1000 - 1
                };
            }
            let crm = _.find(this.crmList, { id: this.dialogForm.crmId });
            this.currItem = {
                address: crm.address,
                contactName: crm.contactName,
                contactPhone: crm.contactPhone,
                crmName: crm.name
            };
            this.listOrderByCrm(params);
        },
        async listOrderByCrm(match = {}) {
            this.searchLoading = true;
            this.crmOrderList = [];
            let bySerial = { sourceserial: { $ne: "" } };
            if (!this.needSource) {
                bySerial = { sourceserial: "" };
                if (this.currItem && this.currItem.serial) {
                    bySerial = _.merge(bySerial, { serial: this.currItem.serial });
                }
            }
            //debugger
            match = _.merge({ flowStateId: 5 }, bySerial, match); //{$gte:5,$lt:9}
            let params = {
                type: "aggregate",
                collectionName: "order",
                data: match,
                aggregate: [
                    {
                        $lookup: {
                            "from": "store",
                            "localField": "materialNo",
                            "foreignField": "materialNo",
                            "as": "store"
                        }
                    },
                    {
                        "$lookup": {
                            "from": "storeIn",
                            "localField": "materialNo",
                            "foreignField": "materialNo",
                            "as": "storeIn"
                        }
                    },
                    {
                        $unwind: {
                            path: "$store",
                            preserveNullAndEmptyArrays: true // 空的数组也拆分
                        }
                    },
                    { $match: match },
                    { $sort: { deliveryDate: 1 } }
                ]
            };
            let data = await this.$axios.$post("mock/db", { data: params });
            //let list = _.filter(data.list, { flowStateId: 5 });
            this.sourceCrmOrderList = this.mergeOrder(data.list); //(list, data.list)
            if (this.sourceCrmOrderList.length) {
                this.filterCrmOrderList(_.cloneDeep(this.sourceCrmOrderList));
            }
            this.searchLoading = false;
        },
        // 合并订单数量,根据类型，产品名称，物料号，价格，梯形、梯号、项目号
        mergeOrder(lists, sdata) {
            let listData = [];
            lists.forEach(item => {
                item.children = [];
                item.storeCount = item.store ? item.store.count : 0; // 默认库存 0
                let dataIndex = _.findIndex(listData, {
                    productId: item.productId,
                    materialNo: item.materialNo,
                    price: item.price
                });
                if (!!~dataIndex) {
                    listData[dataIndex]["children"].push(item);
                    listData[dataIndex]["cancelTotal"] += item.isCanceled ? item.count : 0;
                    listData[dataIndex]["sourceserial"] += "," + item.sourceserial;
                    listData[dataIndex]["projectNo"] += "," + item.projectNo;
                    listData[dataIndex]["count"] += item.count;
                    listData[dataIndex]["releaseCount"] += item.isCanceled ? 0 : item.count;
                } else {
                    let storeIn = this.uionStore(item.storeIn);
                    item.storeIn = storeIn;
                    item.cancelTotal = item.isCanceled ? item.count : 0;
                    item.children.push(_.cloneDeep(item));
                    item.serial = item.serial.includes("-") ? item.serial.split("-")[1] : item.serial;
                    item.releaseCount = item.isCanceled ? 0 : item.count;
                    /* if(sdata && sdata.length){
                        let rcount = 0;
                        sdata.forEach(o=>{
                            if(o.flowStateId>5 && item.materialNo == o.materialNo){
                                rcount += o.count;
                            }
                        })
                        item.rcount = rcount;
                    } */
                    listData.push(item);
                }
            });
            //console.log('listData',listData)
            return listData;
        },
        // 合并临时库存量
        uionStore(storeInArr) {
            let obj = { count: 0, incount: 0 };
            if (storeInArr.length) {
                storeInArr.forEach(item => {
                    if (!item.isAdded) {
                        obj.count += item.count;
                        obj.incount += item.incount;
                    }
                });
            }
            return obj;
        },
        // 设置可选中的数据行
        filterCrmOrderList(arr) {
            let list = [], allcount = 0;
            arr.forEach(item => {
                item.allPrice = item.count * item.metaprice;
                allcount += item.count;
                list.push(item);
            });

            this.currItem.crmOrderMoney = 0;
            list.forEach(item => {
                this.currItem.crmOrderMoney += item.allPrice;
            });
            list.push({
                serial: "合计",
                count: allcount,
                releaseCount: allcount,
                allPrice: this.currItem.crmOrderMoney
            });
            this.crmOrderList = list;
            this.$nextTick(() => {
                this.checkedOrder("crmorder", this.crmOrderList); //每次更新了数据，触发这个函数即可。
            });
        },
        checkedOrder(table, arr) {
            if (!table) return;
            arr.forEach((item, i) => {
                if (item.id && item.count > item.cancelTotal) {
                    this.$refs[table].toggleRowSelection(arr[i], true);
                }
            });
        },

        initProduct() {
            this.ptypeList = _.filter(this.setting.ptype, { typeId: 2 });
            this.crmList = _.filter(this.setting.crm, { typeId: 2 });
            this.productList = _.filter(this.setting.product, { typeId: 2 });
            this.proList = { ...this.productList };
        },
        setPtype(ptypeId) {
            this.ruleForm.productId = "";
            this.ruleForm.crmId = "";
            if (ptypeId == "") {
                this.proList = { ...this.productList };
            } else {
                this.proList = _.filter(this.productList, { ptypeId: ptypeId });
            }
        },
        setProduct(id) {
            let product = _.find(this.productList, { id: id });
            let obj = {
                productName: product.name,
                model: product.model,
                modelNo: product.modelNo,
                materialNo: product.materialNo,
                util: product.util,
                price: product.price,
                metaprice: product.price
            };
            this.getCrmName(product.crmId);
            this.ruleForm = _.merge({}, this.ruleForm, obj);
            console.log("this.ruleForm", this.ruleForm);
        },
        getCrmName(id) {
            let crm = _.find(this.crmList, { id: id });
            if (!crm) return;
            this.ruleForm.crmId = id;
            this.ruleForm.crmName = crm.name;
            this.ruleForm.crmNo = crm.crmNo;
        },
        handleSerial(flag) {
            let now = moment(new Date()).format("YYYY-MM-DD HH:mm");
            now = now.split(" ");
            let dd = now[0].split("-");
            let tt = now[1].split(":");
            //let no = this.editRow?this.editRow.id:this.lastId;
            let serial =
                "JH" + dd[0] + "" + dd[1] + "" + dd[2] + "" + tt[0] + "" + tt[1];
            if (flag == true) {
                return serial;
            } else {
                this.ruleForm.serial = serial;
            }
        },
        cancelBack() {
            this.editRow = null;
            this.isEdit = false;
        },
        handleAdd() {
            this.isEdit = true;
            this.editRow = null;
            this.dataId = undefined;
            this.ruleForm = {
                typeId: 2,
                flowStateId: 5,
                ptypeId: "",
                serial: this.handleSerial(true),
                productId: "",
                productName: "",
                orderDate: new Date().getTime(),
                deliveryDate: new Date().getTime() + 10 * 24 * 3600 * 1000 - 1,
                model: "",
                modelNo: "",
                boxNo: "",
                projectName: "",
                projectNo: "",
                materialNo: "",
                caselNo: "",
                crmId: "",
                crmName: "",
                crmNo: "",
                count: "",
                util: "",
                price: "",
                content: ""
            };
            this._getLastId();
        },
        // 取消订单
        handleCancel(row, flag) {
            console.log('handleCancel', row);
            this.$confirm('确定要' + (flag ? '取消' : '恢复') + '该订单?', '提示', {
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
                    //console.log('handleCancel', result);
                    this.$message.error("已" + (flag ? '取消' : '恢复') + "订单");
                    row.isCanceled = flag;
                    let index = _.findIndex(this.gridList, { id: row.id });
                    this.$set(this.gridList, index, row);
                });
            }).catch(() => { });
        },
        handleUpdate(row) {
            //this.openSourceVisible = false;
            this.editRow = row;
            this.dataId = row.id;
            this.isEdit = true;
            this.ruleForm = {
                typeId: row.typeId,
                flowStateId: row.flowStateId,
                ptypeId: row.ptypeId || "",
                serial: row.serial,
                productId: row.productId || "",
                productName: row.productName,
                orderDate: row.orderDate,
                deliveryDate: row.deliveryDate,
                model: row.model,
                modelNo: row.modelNo,
                boxNo: row.boxNo,
                projectName: row.projectName,
                projectNo: row.projectNo,
                materialNo: row.materialNo,
                caselNo: row.caselNo,
                crmId: row.crmId || "",
                crmName: row.crmName,
                crmNo: row.crmNo || "",
                count: row.count,
                util: row.util,
                price: row.price,
                metaprice: row.metaprice,
                content: row.content
            };
            this.isEdit = true;
        },
        handleDelete(row, dataList) {
            if (this.needSource) {
                this.handleDeleteBySerial(row);
                return;
            }
            this.$confirm("此操作将永久删除该数据, 是否继续?", "提示", {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning"
            }).then(() => {
                let condition = {
                    type: "removeData",
                    collectionName: "order",
                    data: { id: row.id }
                };
                this.$axios.$post("mock/db", { data: condition }).then(result => {
                    this.$message({
                        type: "success",
                        message: "删除成功!"
                    });
                    if (this.needSource) {
                        let index = _.findIndex(dataList, { id: row.id });
                        dataList.splice(index, 1);
                        if (dataList.length == 1) {
                            dataList = [];
                        } else {
                            this.checkReleaseCount(null, dataList);
                        }
                    }
                    this.submitSearch(true);
                });
            }).catch();
        },
        parseFlow(id) {
            if (!id) return "";
            let flow = _.find(this.setting.flowState, { id: id });
            return flow ? flow.name : "";
        },
        parseDate(date, format) {
            if (!date) return "";
            return moment(date).format(format || "YYYY-MM-DD");
        },
        parseMoney(row) {
            return this.$options.filters["currency"](row.count * row.price);
        },
        parsePtype(id) {
            if (!id) return "";
            let type = _.find(this.ptypeList, { id: id });
            return type ? type.name : "";
        },
        parseCrm(id) {
            if (!id) return "";
            let crm = _.find(this.setting.crm, { id: id });
            return crm ? crm.name : "";
        },
        _setValue(key, value) {
            switch (key) {
                case "orderDate":
                    return new Date(value).getTime();
                case "deliveryDate":
                    return new Date(value).getTime();
                case "count":
                    return Number(value);
                case "price":
                    return Number(value);
                default:
                    return String(value);
            }
        },
        submitForm() {
            this.$refs["ruleForm"].validate(valid => {
                if (valid) {
                    let loadingMask = this.$loading({ background: "rgba(0, 0, 0, 0.5)" });
                    let condition = {
                        type: "addData",
                        collectionName: "order",
                        data: { ...this.ruleForm }
                    };
                    if (this.dataId) {
                        condition.type = "updateData";
                        condition.data.id = this.dataId;
                        condition.updateDate = true;
                    }
                    condition.data.createByUser = this.$store.state.user.name;
                    this.$axios.$post("mock/db", { data: condition }).then(result => {
                        loadingMask.close();
                        this.isEdit = false;
                        this.needSource = false;
                        this.getList();
                        this.dataId = undefined;
                        this._getLastId();
                    });
                }
            });
        },
        submitSearch(flag) {
            let params = {};
            for (let k in this.searchForm) {
                if (this.searchForm[k] != "" && this.searchForm[k]) {
                    if (_.isNumber(this.searchForm[k])) {
                        params[k] = Number(this.searchForm[k]);
                    } else if (
                        _.isArray(this.searchForm[k]) &&
                        (k === "deliveryDate" || k === "orderDate")
                    ) {
                        params[k] = {
                            $gte: this.searchForm[k][0],
                            $lt: this.searchForm[k][1] + 24 * 3600 * 1000 - 1
                        };
                    } else if (_.isArray(this.searchForm[k])) {
                        params[k] = { $in: this.searchForm[k] };
                    } else {
                        params[k] = { $regex: this.searchForm[k] };
                    }
                }
            }
            if (!flag) {
                this.query = {
                    page: 1,
                    pagesize: 20
                };
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
        setOrderParams(flag) {
            this.searchForm.flowStateId = "";
            this.query.page = 1;
            this.needSource = flag;
            this.getList();
        },
        async getList(match = {}) {
            this.listLoading = true;
            let groupId = { sourceserial: "$sourceserial" };
            let bySerial = { sourceserial: { $ne: "" } };
            if (!this.needSource) {
                bySerial = { sourceserial: "" };
                groupId = { serial: "$serial" };
            }
            match = _.merge({ typeId: 2, flowStateId: 5 }, bySerial, match);
            let condition = {
                type: "groupList",
                collectionName: "order",
                data: match,
                distinct: "sourceserial",
                groupCount: [
                    { $match: match },
                    { $group: { _id: groupId } },
                    { $group: { _id: null, total: { $sum: 1 } } }
                ],
                aggregate: [
                    { $match: match },
                    {
                        $group: {
                            _id: groupId, // 按订单号字段分组
                            id: { $first: "$id" },
                            isCanceled: { $first: "$isCanceled" },
                            sourceserial: { $first: "$sourceserial" },
                            projectNo: { $first: "$projectNo" },
                            projectName: { $first: "$projectName" },
                            serial: { $first: "$serial" },
                            orderDate: { $first: "$orderDate" },
                            deliveryDate: { $first: "$deliveryDate" },
                            total: { $sum: 1 },
                            result: { $push: "$$ROOT" }
                        }
                    },
                    { $sort: { deliveryDate: 1, crmId: 1 } },
                    { $skip: (this.query.page - 1) * this.query.pagesize },
                    { $limit: this.query.pagesize }
                ]
            };
            let result = await this.$axios.$post("mock/db", { data: condition });
            this.total = result.total;
            this.gridList = _.orderBy(result.list, ["crmId"], ["asc"]);
            this.listLoading = false;
        },
        async _getLastId() {
            let condition = {
                type: "getId",
                data: {
                    model: "order"
                }
            };
            let result = await this.$axios.$post("mock/db", { data: condition });
            if (result) {
                this.lastId = result;
            }
            // 仓库Id
            let cn = {
                type: "getId",
                data: {
                    model: "storeIn"
                }
            };
            let res = await this.$axios.$post("mock/db", { data: cn });
            if (res) {
                console.log("lastId-storeId", res);
                this.storeLastId = res;
            }
        },
        async getSetting() {
            let condition = {
                type: "getData",
                collectionName: "setting",
                data: {}
            };
            let result = await this.$axios.$post("mock/db", { data: condition });
            if (result) {
                //console.log('getSetting',result)
                this.setting = result.content;
                this.typeList = this.setting.type;
                this.flowList = _.filter(this.setting.flowState, item => {
                    return item.id > 4;
                });
                this.initProduct();
                this.getList();
            }
        }
    },
    created() {
        this.getSetting();
    },
    mounted() {
        this._getLastId();
    }
};
</script>


<style lang="scss" scoped>
@import '~/assets/scss/order.scss';
</style>




