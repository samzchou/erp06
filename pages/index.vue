<template>
    <section class="container">
        <div class="search-container">
            <el-form :inline="true" :model="formInline" size="mini">
                <el-form-item label="统计日期范围:">
                    <el-date-picker v-model="formInline.date" type="daterange" align="right" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions2"></el-date-picker>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="getList()">查询</el-button>
                    <el-button type="primary" @click="clearAll()">清除所有数据</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="panel">
            <el-row :gutter="15">
                <el-col :span="6">
                    <div class="data-total">
                        <div>
                            <i class="my-icon-shopping-bag c1" />
                        </div>
                        <div>
                            <h5>采购订单量</h5>
                            <h3>
                                <span>￥:</span>
                                <count-to :start-val="0" :end-val="orderTotal.orderBuy" :duration="2000" :decimals="2" />
                            </h3>
                        </div>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="data-total">
                        <div>
                            <i class="my-icon-paper-plane c2" />
                        </div>
                        <div>
                            <h5>生产订单量</h5>
                            <h3>
                                <span>￥:</span>
                                <count-to :start-val="0" :end-val="orderTotal.orderSale" :duration="2200" :decimals="2" />
                            </h3>
                        </div>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="data-total">
                        <div>
                            <i class="my-icon-sheqel c4" />
                        </div>
                        <div>
                            <h5>财务支出</h5>
                            <h3>
                                <span>￥:</span>
                                <count-to :start-val="0" :end-val="orderTotal.orderPayOut" :duration="2400" :decimals="2" />
                            </h3>
                        </div>
                    </div>
                </el-col>
                <el-col :span="6">
                    <div class="data-total">
                        <div>
                            <i class="my-icon-gg c5" />
                        </div>
                        <div>
                            <h5>财务收入</h5>
                            <h3>
                                <span>￥:</span>
                                <count-to :start-val="0" :end-val="orderTotal.orderPayIn" :duration="2400" :decimals="2" />
                            </h3>
                        </div>
                    </div>
                </el-col>
            </el-row>
        </div>
        <div class="chartline">
            <div>
                <no-ssr>
                    <echart :options="chartItem" ref="chartline" :auto-resize="true" />
                </no-ssr>
            </div>
        </div>
        <div class="order-list">
            <el-row :gutter="20">
                <el-col :span="12">
                    <el-tabs type="border-card">
                        <el-tab-pane :label="'最近需采购的订单('+tabOrder.orderBuyList.length+')'">
                            <el-table :data="tabOrder.orderBuyList" size="mini" max-height="400">
                                <el-table-column label="订单号" prop="serial" width="100">
                                    <template slot-scope="scope">
                                        <span v-if="scope.row.sourceserial">{{scope.row.sourceserial}}</span>
                                        <span v-else>{{scope.row.serial}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="采购产品名称" prop="productName">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.productName}}</span>
                                        <span style="color:#CCC;margin-left:10px;">等...</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="客户名称" prop="crmName" />
                                <el-table-column label="订单量" prop="total" width="70">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.total}} 件</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="交付日期" prop="deliveryDate" width="100">
                                    <template slot-scope="scope">
                                        <span>{{parseDate(scope.row.deliveryDate)}}</span>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div style="text-align:right;padding-top:10px">
                                <el-button type="text" icon="el-icon-more" @click="goUrl('/order/buy')">查看更多详情</el-button>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane :label="'最近须生产的订单('+tabOrder.orderSaleList.length+')'">
                            <el-table :data="tabOrder.orderSaleList" size="mini" max-height="400">
                                <el-table-column label="订单号" prop="serial" width="100">
                                    <template slot-scope="scope">
                                        <span v-if="scope.row.sourceserial">{{scope.row.sourceserial}}</span>
                                        <span v-else>{{scope.row.serial}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="生产产品名称" prop="productName">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.productName}}</span>
                                        <span style="color:#CCC;margin-left:10px;">等...</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="客户名称" prop="crmName" />
                                <el-table-column label="订单量" prop="total" width="70">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.total}} 件</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="交付日期" prop="deliveryDate" width="100">
                                    <template slot-scope="scope">
                                        <span>{{parseDate(scope.row.deliveryDate)}}</span>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div style="text-align:right;padding-top:10px">
                                <el-button type="text" icon="el-icon-more" @click="goUrl('/order/sale')">查看更多详情</el-button>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </el-col>
                <el-col :span="12">
                    <el-tabs type="border-card">
                        <el-tab-pane :label="'最近须付款的订单('+tabOrder.payOutList.length+')'">
                            <el-table :data="tabOrder.payOutList" size="mini" max-height="400">
                                <el-table-column label="订单号" prop="serial" width="100">
                                    <template slot-scope="scope">
                                        <span v-if="scope.row.sourceserial">{{scope.row.sourceserial}}</span>
                                        <span v-else>{{scope.row.serial}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="产品名称" prop="productName">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.productName}}</span>
                                        <span style="color:#CCC;margin-left:10px;">等...</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="客户名称" prop="crmName" />
                                <el-table-column label="订单量" prop="total" width="70">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.total}} 件</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="交付日期" prop="deliveryDate" width="100">
                                    <template slot-scope="scope">
                                        <span>{{parseDate(scope.row.deliveryDate)}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="应付款项" prop="totalPrice" width="100">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.totalPrice | currency}} </span>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div style="text-align:right;padding-top:10px">
                                <el-button type="text" icon="el-icon-more" @click="goUrl('/finial/payout')">查看更多详情</el-button>
                            </div>
                        </el-tab-pane>
                        <el-tab-pane :label="'最近须收款的订单('+tabOrder.payInList.length+')'">
                            <el-table :data="tabOrder.payInList" size="mini" max-height="400">
                                <el-table-column label="订单号" prop="serial" width="100">
                                    <template slot-scope="scope">
                                        <span v-if="scope.row.sourceserial">{{scope.row.sourceserial}}</span>
                                        <span v-else>{{scope.row.serial}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="产品名称" prop="productName">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.productName}}</span>
                                        <span style="color:#CCC;margin-left:10px;">等...</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="客户名称" prop="crmName" />
                                <el-table-column label="订单量" prop="total" width="70">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.total}} 件</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="交付日期" prop="deliveryDate" width="100">
                                    <template slot-scope="scope">
                                        <span>{{parseDate(scope.row.deliveryDate)}}</span>
                                    </template>
                                </el-table-column>
                                <el-table-column label="应收款项" prop="totalPrice" width="100">
                                    <template slot-scope="scope">
                                        <span>{{scope.row.totalPrice | currency}} </span>
                                    </template>
                                </el-table-column>
                            </el-table>
                            <div style="text-align:right;padding-top:10px">
                                <el-button type="text" icon="el-icon-more" @click="goUrl('/finial/payin')">查看更多详情</el-button>
                            </div>
                        </el-tab-pane>
                    </el-tabs>
                </el-col>
            </el-row>
        </div>
    </section>
</template>

<script>
import CountTo from "vue-count-to";
export default {
    components: {
        CountTo
    },
    data() {
        return {
            formInline: {
                date: []
            },
            pickerOptions2: {
                shortcuts: [
                    {
                        text: "最近一周",
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                            picker.$emit("pick", [start, end]);
                        }
                    },
                    {
                        text: "最近一个月",
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                            picker.$emit("pick", [start, end]);
                        }
                    },
                    {
                        text: "最近三个月",
                        onClick(picker) {
                            const end = new Date();
                            const start = new Date();
                            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                            picker.$emit("pick", [start, end]);
                        }
                    }
                ]
            },
            orderTotal: {
                orderBuy: 0,
                orderSale: 0,
                orderPayOut: 0,
                orderPayIn: 0
            },
            tabOrder: {
                orderBuyList: [],
                orderSaleList: [],
                payOutList: [],
                payInList: []
            },
            chartItem: {
                title: {
                    text: "模拟数据分析视图，待数据累计达量后做分析"
                },
                xAxis: {
                    data: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
                },
                boundaryGap: false,
                grid: {
                    left: 10,
                    right: 10,
                    bottom: 20,
                    top: 60,
                    containLabel: true
                },
                tooltip: {
                    trigger: "axis",
                    padding: [5, 10]
                },
                yAxis: {
                    name: "万元（￥）",
                    type: "value"
                },
                legend: {
                    data: ["采购", "产值", "支出", "收入"]
                },
                series: [
                    {
                        name: "采购",
                        type: "line",
                        stack: "总量",
                        data: [120.35, 132.58, 101.5, 134.54, 190.58, 230.54, 210.56, 300.23, 410.52, 531.45, 456.65, 786.76]
                    },
                    {
                        name: "产值",
                        type: "line",
                        stack: "总量",
                        data: [220.52, 182.28, 191.68, 234.48, 290.65, 430.85, 310.56, 352.56, 452.84, 432.52, 456.52, 654.76]
                    },
                    {
                        name: "支出",
                        type: "line",
                        stack: "总量",
                        data: [150.25, 232.87, 201.74, 154.63, 190.36, 330.56, 410.56, 524.23, 542.25, 452.21, 563.33, 458.69]
                    },
                    {
                        name: "收入",
                        type: "line",
                        stack: "总量",
                        data: [320.58, 332.23, 301.45, 334.86, 390.45, 330.68, 320.87, 368.52, 395.25, 321.21, 378.52, 398.92]
                    }
                ]
            }
        };
    },
    methods: {
        clearAll() {
            this.$confirm('此操作将永久删除所有数据, 非管理员请勿操作！', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let condition = {
                    type: "clearAll",
                };
                this.$axios.$post("mock/db", { data: condition }).then(res=>{
                    //console.log('clearAll',res)
                });
            }).catch(() => { });
        },
        goUrl(path) {
            this.$router.push(path);
        },
        searchSubmit() {
            //console.log(this.formInline);
        },
        parseDate(date, format) {
            return moment(date).format(format || "YYYY-MM-DD");
        },
        parseOrder(list) {
            // 采购订单
            let orderBuy = 0, orderSale = 0;
            this.orderTotal = {
                orderBuy: 0,
                orderSale: 0,
                orderPayIn: 0,
                orderPayOut: 0
            };
            //debugger
            list.forEach(item => {
                if (item.flowStateId > 1 && item.flowStateId < 4 && item.typeId == 1) {
                    //采购订单且已入库
                    this.orderTotal.orderBuy += this.parsePeice(item);
                } else if (item.flowStateId > 4 && item.flowStateId <= 8 && item.typeId == 2) {
                    this.orderTotal.orderSale += this.parsePeice(item);
                }
                if (item.isPayed) {
                    if (item.typeId == 1) {
                        // 财务支出
                        this.orderTotal.orderPayOut += this.parsePeice(item);
                    } else {
                        this.orderTotal.orderPayIn += this.parsePeice(item);
                    }
                }
            });
        },
        parsePeice(item) {
            return item.count * item.price;
        },
        parseOrderList(list) {
            //tabOrder
            //console.log("parseOrderList", list);
            this.tabOrder.orderBuyList = _.cloneDeep(list).filter(item => {
                return !item.isAdded && item.typeId == 1;
            });
            this.tabOrder.orderSaleList = _.cloneDeep(list).filter(item => {
                return !item.isAdded && item.typeId == 2;
            })
        },
        parsePayList(list) {
            this.tabOrder.payOutList = _.cloneDeep(list).filter(item => {
                return item.typeId == 1;
            })
            this.tabOrder.payInList = _.cloneDeep(list).filter(item => {
                return item.typeId == 2;
            })
        },
        async getList(match = {}) {
            if (!_.isEmpty(this.formInline)) {
                match = _.merge(match, {
                    orderDate: {
                        $gte: this.formInline.date[0].getTime(),
                        $lte: this.formInline.date[1].getTime()
                    }
                });
            }
            let condition = {
                type: "listData",
                collectionName: "order",
                data: match
            };
            //debugger
            let result = await this.$axios.$post("mock/db", { data: condition });
            this.parseOrder(result.list);
        },
        // 获取最近的订单
        async getOrderList(match = {}) {
            let condition = {
                type: 'groupList',
                collectionName: 'storeIn',
                data: _.merge({ isPayed: false }, match),
                distinct: "crmId",
                aggregate: [
                    { "$match": _.merge({ isPayed: false }, match) },
                    {
                        "$group": {
                            "_id": { "crmId": "$crmId", "serial": "$serial" }, // 按字段分组
                            "isAdded": { "$first": "$isAdded" },
                            "id": { "$first": "$id" },
                            "typeId": { "$first": "$typeId" },
                            "sourceserial": { "$first": "$sourceserial" },
                            "crmName": { "$first": "$crmName" },
                            "productName": { "$first": "$productName" },
                            "projectName": { "$first": "$projectName" },
                            "deliveryDate": { "$first": "$deliveryDate" },
                            "total": { $sum: 1 }
                        }
                    },
                    { "$sort": { 'deliveryDate': 1, 'crmId': 1 } },
                    { $skip: 0 },
                    { $limit: 20 }
                ]
            };
            let result = await this.$axios.$post('mock/db', { data: condition });
            this.parseOrderList(result.list);
        },
        async getPayList(match = {}) {
            let param = _.merge({ isAdded: true, isPayed: false }, match);
            let condition = {
                type: "groupList",
                collectionName: "storeIn",
                data: param,
                distinct: "serial",
                aggregate: [
                    { $match: param },
                    {
                        $group: {
                            _id: { crmId: "$crmId", serial: "$serial", invoiceNumber: "$invoiceNumber" },
                            id: { $first: "$id" },
                            typeId: { $first: "$typeId" },
                            serial: { $first: "$serial" },
                            sourceserial: { $first: "$sourceserial" },
                            crmName: { $first: "$crmName" },
                            projectName: { $first: "$projectName" },
                            productName: { $first: "$productName" },
                            totalPrice: { $sum: { $multiply: ["$price", "$incount"] } },
                            deliveryDate: { $first: "$deliveryDate" },
                            total: { $sum: 1 }
                        }
                    },
                    { $sort: { deliveryDate: 1, crmId: 1 } },
                    { $skip: 0 },
                    { $limit: 20 }
                ]
            };
            let result = await this.$axios.$post('mock/db', { data: condition });
            this.parsePayList(result.list);
        }
    },
    created() {
        let now = new Date();
        let firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
        let lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        this.formInline.date = [firstDay, lastDay];
        this.getList();
        this.getOrderList();
        this.getPayList();
    }
};
</script>

<style lang="scss" scoped>
@import "~/assets/scss/order.scss";
.data-total {
  padding: 20px;
  height: 100px;
  border: 1px solid #ddd;
  background-color: #fff;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  > div {
    > i {
      font-size: 2.5rem;
      &.c1 {
        color: #3ab9f1;
      }
      &.c2 {
        color: #1cd696;
      }
      &.c3 {
        color: #e6c222;
      }
      &.c4 {
        color: #9f47e7;
      }
      &.c5 {
        color: #0ee719;
      }
    }
    > h5 {
      font-size: 1rem;
      color: #888;
      padding: 5px 0;
      text-align: right;
    }
    > h3 {
      font-size: 1.5rem;
      color: #666;
    }
  }
}
.chartline {
  margin: 10px 0;
  box-sizing: border-box;
  border: 1px solid #ddd;
  padding: 20px;
  .echarts {
    width: 100%;
  }
}
</style>


