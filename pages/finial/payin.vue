<template>
    <section>
        <div class="head-title">
            <div>
                <div>
                    <span :class="{'inactive':!isPayed}" @click="setOrderParams(false)">待收款订单</span>
                    <span :class="{'inactive':isPayed}" @click="setOrderParams(true)">已收款订单</span>
                </div>
            </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="制单号：" prop="orderSerial">
                        <el-input v-model="searchForm.orderSerial" clearable  style="width:180px"/>
                    </el-form-item>
                    <el-form-item label="客户订单号：" prop="sourceserial">
                        <el-input v-model="searchForm.sourceserial" clearable  style="width:180px"/>
                    </el-form-item>
                    <el-form-item label="项目名称：" prop="projectName">
                        <el-input v-model="searchForm.projectName" clearable/>
                    </el-form-item>
                    <el-form-item label="货品名称：" prop="productName">
                        <el-input v-model="searchForm.productName" clearable  style="width:120px"/>
                    </el-form-item>
                    <el-form-item label="物料号：" prop="materialNo">
                        <el-input v-model="searchForm.materialNo" clearable/>
                    </el-form-item>
                    <el-form-item label="客户：" prop="crmId" v-if="setting">
                        <el-select v-model="searchForm.crmId" placeholder="请选择" clearable filterable style="width:200px">
                            <el-option v-for="item in setting.crm.filter(o=>{return o.typeId==2})" :key="item.id" :label="item.name" :value="item.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="制单交付日期：" prop="finishedDate">
                        <el-date-picker v-model="searchForm.finishedDate" value-format="timestamp" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" clearable editable unlink-panels style="width:220px"/>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch" icon="el-icon-search">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <el-table v-loading="listLoading" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500">
                <el-table-column label="No." width="70" align="center">
                    <template slot-scope="scope">
                        <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                    </template>
                </el-table-column>
                <el-table-column prop="orderSerial" label="制单号" width="150"/>
                <el-table-column prop="crmName" label="客户名称">
                    <template slot-scope="scope">
                        <a href="javascript:void(0)" @click="showDetail(scope.row)">{{scope.row.crmName}}</a>
                    </template>
                </el-table-column>
                <el-table-column prop="projectName" label="项目名称"/>
                <el-table-column prop="productName" label="物料名称">
                     <template slot-scope="scope">
                        <span>{{scope.row.productName}}</span><span>等...</span>
                    </template>
                </el-table-column>
                <el-table-column prop="total" label="订单总数" width="70">
                    <template slot-scope="scope">
                        <span>{{scope.row.total}} 件</span>
                    </template>
                </el-table-column>
                <el-table-column prop="orderTotalPrice" label="订单总额" width="120">
                    <template slot-scope="scope">
                        <span>{{scope.row.orderTotalPrice | currency}} </span>
                    </template>
                </el-table-column>
                <el-table-column prop="payTotalPrice" label="销售总额" width="120">
                    <template slot-scope="scope">
                        <span>{{scope.row.payTotalPrice | currency}} </span>
                    </template>
                </el-table-column>
                <el-table-column label="订单毛利" width="120">
                    <template slot-scope="scope">
                        <span>{{scope.row.orderTotalPrice-scope.row.payTotalPrice | currency}} </span>
                    </template>
                </el-table-column>
                <el-table-column prop="finishedDate" label="制单交付日期" width="100">
                    <template slot-scope="scope">
                        <span>{{parseDate(scope.row.finishedDate)}} </span>
                    </template>
                </el-table-column>
                <el-table-column prop="updateDate" label="最后更新" width="100">
                    <template slot-scope="scope">
                        <span>{{parseDate(scope.row.updateDate)}} </span>
                    </template>
                </el-table-column>
                <el-table-column prop="invoiceNumber" label="开票号/单据号" width="120" v-if="isPayed"/>
                <el-table-column prop="updateByUser" label="操作人" width="80"/>
                <el-table-column label="付款" fixed="right" align="center" width="70">
                    <template slot-scope="scope">
                        <div>
                            <el-button size="mini" type="text" @click="showDetail(scope.row)" icon="my-icon-retweet">{{scope.row.isPayed?'查阅':'收款'}}</el-button>
                        </div>
                    </template>
                </el-table-column>
            </el-table>
            <div class="page-container">
                <div>本页合计金额：{{totalMoney | currency}}</div>
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200,500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>
        <el-dialog title="订单明细查阅" :visible.sync="openDialogVisible" width="80%">
            <div class="order-title">
                <span v-if="currItem">系统订单号：{{currItem.serial}}，客户：{{currItem.crmName}}，地址：{{currItem.address}}，联系人：{{currItem.contactName}}，电话：{{currItem.contactPhone}}</span>
            </div>
            <div class="order-title" style="padding:10px 0" v-if="orderCrmList.length">
                <span style="font-weight:bold">订单总价：{{currItem.totalPrice | currency}}</span>
                <span style="font-weight:bold; margin-left:20px" v-if="isPayed">发票/单据号：{{currItem.invoiceNumber}}</span>
            </div>
            <div>
                <el-table ref="exportTable" :data="orderCrmList" border fit highlight-current-row stripe size="mini" max-height="350" @selection-change="handleSelectionChange">
                    <el-table-column type="selection" width="40" align="center" v-if="currItem && !currItem.isPayed" :selectable="checkSelectable"/>
                    <el-table-column type="index" width="50" align="center"/>
                    <el-table-column prop="orderSerial" label="制单号" width="150"/>
                    <el-table-column prop="sourceserial" label="订单编号" width="120"/>
                    <el-table-column prop="materialNo" label="物料号" width="120"/>
                    <el-table-column prop="productName" label="物料名称"/>
                    <el-table-column prop="model" label="规格型号" width="100"/>
                    <el-table-column prop="count" label="数量" width="90">
                        <template slot-scope="scope">
                            <span>{{scope.row.incount}} {{scope.row.util}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="price" label="订单单价" width="70"/>
                    <el-table-column prop="metaprice" label="采购单价" width="70"/>
                    <el-table-column prop="orderPrice" label="订单金额" width="100">
                        <template slot-scope="scope">
                            <span v-if="scope.$index<orderCrmList.length-1">{{parseOrderMoney(scope.row)}}</span>
                            <span v-else>{{scope.row.orderPrice | currency}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="totalPrice" label="销售金额" width="100">
                        <template slot-scope="scope">
                            <span v-if="scope.$index<orderCrmList.length-1">{{parseMoney(scope.row)}}</span>
                            <span v-else>{{scope.row.totalPrice | currency}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="fitPrice" label="订单毛利" width="100">
                        <template slot-scope="scope">
                            <span>{{scope.row.fitPrice | currency}}</span>
                        </template>
                    </el-table-column>

                    <el-table-column prop="finishedDate" label="制单交货日期" width="100">
                        <template slot-scope="scope">
                            <span v-if="scope.$index<orderCrmList.length-1">{{parseDate(scope.row.finishedDate)}}</span>
                        </template>
                    </el-table-column>
                    <el-table-column prop="deliveryDate" label="客户交货日期" width="100">
                        <template slot-scope="scope">
                            <span v-if="scope.$index<orderCrmList.length-1">{{parseDate(scope.row.deliveryDate)}}</span>
                        </template>
                    </el-table-column>
                </el-table>
            </div>
            <div class="btns" v-if="orderCrmList.length">
                <div>
                    <span>合计：共{{currItem.total}}个采购订单；</span>
                    <span v-if="currItem.isPayed">订单已收款</span>
                    <span v-else>已选择{{selectOrders.length}}个订单</span>
                </div>
                <div>
                    <el-form size="mini" :inline="true" :model="payForm" :rules="payRules" ref="payForm" class="pay-form">
                        <el-form-item label="收款发票号：" prop="invoiceNumber" v-if="!currItem.isPayed">
                            <el-input v-model="payForm.invoiceNumber" placeholder="请填写发票号或单据号" clearable />
                        </el-form-item>
                        <el-form-item label="备注：" prop="content" v-if="!currItem.isPayed">
                            <el-input v-model="payForm.content" placeholder="请填写备注" clearable />
                        </el-form-item>
                        <el-form-item v-if="!currItem.isPayed">
                            <el-button  v-if="!currItem.isPayed" size="mini" type="success" @click="payOrder" :loading="payLoading" icon="my-icon-retweet">提交收款</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="warning" size="mini" icon="el-icon-document" @click="exportOrder">导出收款单</el-button>
                        </el-form-item>
                        <el-form-item>
                            <el-button @click="openDialogVisible=false">取消退出</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </div>
        </el-dialog>
    </section>
</template>
<script>
export default {
    data(){
        return {
            isPayed:false,
            openDialogVisible:false,
            currItem:null,
            listLoading:false,
            isEdit:false,
            total:0,
            setting:null,
            query:{
                page:1,
                pagesize:500
            },
            gridList:[],
            lastId:0,
            totalMoney:0,
            searchForm:{
                orderSerial:'',
                sourceserial:'',
                crmName:'',
                projectName:'',
                productName:'',
                crmId:'',
                materialNo:'',
                finishedDate:'',
            },
            orderCrmList:[],
            payLoading:false,
            selectOrders:[],
            payForm:{
                invoiceNumber:'',
                content:''
            },
            payRules:{
                invoiceNumber:[{required:true, message:'请填写发票号或单据号', trigger: 'blur'}]
            }
        }
    },
    methods:{
        handleSelectionChange(val) {
            this.selectOrders = val.filter(item => {
                return item.id;
            });
        },
        checkSelectable(row) {
            return row.id;
        },
        setOrderParams(flag) {
            this.isPayed = flag;
            this.query.page = 1;
            this.getList();
        },
        exportOrder(){
            console.log(this.orderCrmList);
            import("@/components/Export2Excel").then(excel => {
                const tHeader = ["制单号","订单编号","物料号","物料名称","规格型号","数量","订单单价","生产单价","订单金额","生产金额","订单毛利","制单交货日期","客户交货日期"];
                const filterVal = ["orderSerial","sourceserial","materialNo","productName","model","incount","price","metaprice","orderPrice","totalPrice","fitPrice","finishedDate","deliveryDate"];
                const data = this.formatJson(filterVal, _.cloneDeep(this.orderCrmList));
                const now = moment(new Date()).format("YYYYMMDD");
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: this.currItem.crmName + "-收款单-" + now
                });
            });
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v =>
                filterVal.map(j => {
                    if ((j == "finishedDate" || j=="deliveryDate") && v[j]) {
                        v[j] = this.parseDate(v[j]);
                    }
                    return v[j];
                })
            );
        },
        payOrder(){
            if(!this.selectOrders.length){
                this.$message.error('请选择需要收款的订单');
                return;
            }
            this.$refs['payForm'].validate((valid) => {
                if (valid) {
                    let orderIds = [];
                    this.selectOrders.forEach(item=>{
                        orderIds.push(item.id);
                    });
                    // 添加财务数据
                    let data = {
                        'payType':2,
                        'orderIds':orderIds,
                        'orderSerial':this.currItem.orderSerial,
                        'serial':this.currItem.serial,
                        'sourceserial':this.currItem.sourceserial,
                        'crmId':this.currItem.crmId,
                        'crmName':this.currItem.crmName,
                        'price':this.currItem.totalPrice,
                        'invoiceNumber':this.payForm.invoiceNumber,
                        'createByUser':this.$store.state.user.name,
                        'content':this.payForm.content
                    };
                    this.$confirm("此操作将订单更新为已经收款, 是否继续?", "提示", {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning"
                    }).then(() => {
                        this.payLoading = true;
                        let cn = {
                            type: "addData",
                            collectionName: "finance",
                            notNotice: true,
                            data: data
                        };
                        this.$axios.$post("mock/db", { data: cn }).then(result => {
                            // 更新已入库订单状态
                            let condition = {
                                type: "updatePatch",
                                collectionName: "storeIn",
                                notNotice: true,
                                param: { id: { $in: orderIds } },
                                set: {
                                    $set: {
                                        'isPayed': true,
                                        'invoiceNumber':this.payForm.invoiceNumber,
                                        'updateByUser': this.$store.state.user.name,
                                        'updateDate': new Date().getTime()
                                    }
                                }
                            };
                            console.log('condition', condition)
                            this.$axios.$post("mock/db", { data: condition }).then(result => {
                                this.payLoading = false;
                                this.selectOrders = [];
                                this.orderCrmList= [];
                                this.currItem = null;
                                this.openDialogVisible = false;
                                this.submitSearch(true);
                            });
                        });
                    }).catch(() => {});
                }
            });
            
        },
        async showDetail(row){
            let crm = _.find(this.setting.crm, { id: row.crmId });
            this.currItem = _.merge(row, {
                contactName: crm.contactName,
                contactPhone: crm.contactPhone,
                address: crm.address
            });
            let params = _.merge({},{crmId: row.crmId, isAdded: row.isAdded, isPayed: row.isPayed, orderSerial: row.orderSerial});
            // 查询供应商的具体订单
            let condition = {
                type: "listData",
                collectionName: "storeIn",
                data: params
            };
            let result = await this.$axios.$post("mock/db", { data: condition });
            let allCount = 0, totalPrice=0, orderPrice=0, fitPrice=0;
            result.list.forEach(item=>{
                allCount += item.incount;
                item.orderPrice = item.incount * item.price;
                item.totalPrice = item.incount * item.metaprice;
                item.fitPrice = item.orderPrice-item.totalPrice;
                orderPrice += item.incount * item.price;
                totalPrice += item.incount * item.metaprice;
            })
            this.orderCrmList = result.list;
            this.orderCrmList.push({
                orderSerial:'合计',
                incount:allCount,
                orderPrice:orderPrice,
                totalPrice:totalPrice, //row.totalPrice
                fitPrice:orderPrice-totalPrice
            })
            this.openDialogVisible = true;
            this.$nextTick(() => {
                this.checkedOrder(); //每次更新了数据，触发这个函数即可。
            });
        },
        checkedOrder() {
            this.orderCrmList.forEach((item, i) => {
                if (item.id) {
                    this.$refs.exportTable.toggleRowSelection(this.orderCrmList[i], true);
                }
            });
        },
        parseCrm(id, key){
            let crm = _.find(this.setting.crm,{'id':id});
            return crm[key] || '--';
        },
        parseDate(date, format){
            return moment(date).format(format||'YYYY-MM-DD');
        },
        parseOrderMoney(row){
            return this.$options.filters['currency'](row.incount*row.price);
        },
        parseMoney(row){
            return this.$options.filters['currency'](row.incount*row.metaprice);
        },
       
        handleSizeChange(val){
            this.query.pagesize = val;
            this.submitSearch(true);
        },
        handleCurrentChange(val){
            this.query.page = val;
            this.submitSearch(true);
        },
        submitSearch(flag){
            let params = {};
            for(let k in this.searchForm){
                if(this.searchForm[k] != '' && this.searchForm[k]){
                    if(_.isNumber(this.searchForm[k])){
                        params[k] = Number(this.searchForm[k]);
                    }else if(_.isArray(this.searchForm[k]) && k==='finishedDate'){
                        params[k] = {
                            $gte:this.searchForm[k][0],
                            $lte:this.searchForm[k][1]
                        }
                    }else if(_.isArray(this.searchForm[k])){
                        params[k] = {$in:this.searchForm[k]}
                    }else{
                        params[k] = {$regex:this.searchForm[k]};
                    }
                }
            };
            if(!flag){ // 不需要再做分页复位
                this.query = {
                    page:1,
                    pagesize:50
                }
            }
            this.getList(params);
        },
        async getList(match={}){
            this.listLoading = true;
            let param = _.merge( {typeId:2, isAdded:true, isPayed:this.isPayed}, match);
            let condition = {
                type: "groupList",
                collectionName: "storeIn",
                data: param,
                distinct: "orderSerial",
                aggregate: [
                    { $match: param },
                    {
                        $group: {
                            _id:{crmId:"$crmId",orderSerial:"$orderSerial",invoiceNumber:"$invoiceNumber"},
                            id: { $first: "$id" },
                            isAdded: { $first: "$isAdded" },
                            invoiceNumber: { $first: "$invoiceNumber" },
                            isPayed: { $first: "$isPayed" },
                            typeId: { $first: "$typeId" },
                            orderSerial: { $first: "$orderSerial" },
                            serial: { $first: "$serial" },
                            sourceserial: { $first: "$sourceserial" },
                            crmId: { $first: "$crmId" },
                            crmName: { $first: "$crmName" },
                            projectName: { $first: "$projectName" },
                            productName: { $first: "$productName" },
                            price: { $first: "$price" },
                            metaprice: { $first: "$metaprice" },
                            updateByUser: { $first: "$updateByUser" },
                            updateDate: { $first: "$updateDate" },
                            orderTotalPrice: { $sum: { $multiply: [ "$price", "$incount" ] } },
                            payTotalPrice: { $sum: { $multiply: [ "$metaprice", "$incount" ] } },
                            deliveryDate: { $first: "$deliveryDate" },
                            total: { $sum: 1 }
                        }
                    },
                    { $sort: { deliveryDate: 1, crmId: 1 } },
                    { $skip: (this.query.page - 1) * this.query.pagesize },
                    { $limit: this.query.pagesize }
                ]
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            //console.log('getList',result);
            this.total = result.total;
            this.gridList = result.list;
            this.listLoading = false;
            this.totalMoney = 0;
            result.list.forEach(item=>{
                this.totalMoney += item.payTotalPrice;
            })
            
        },
        async _getLastId(){
            let condition = {
                type:"getId",
                data:{
                    model:'finance'
                }
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            if(result){
                this.lastId = result;
            }
        },
        async getSetting(){
            let condition = {
                type:"getData",
                collectionName:"setting",
                data:{}
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            if(result){
                this.setting = result.content;
                // 获取列表
                this.getList();
            }
        }
    },
    created(){
        this.getSetting();
    }
}
</script>
<style lang="scss" scoped>
@import "~/assets/scss/order.scss";
</style>