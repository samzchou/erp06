<template>
    <section class="order-main">
        <div class="page-title">
            <div>
                <span>生产销售送货单</span>
            </div>
            <div>
                <span>
                    <el-button v-if="exportList.length" @click="exportOrder" type="text" size="medium" icon="el-icon-document">导出送货单</el-button>
                </span>
            </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
              <el-form :inline="true" :model="searchForm" :rules="searchRules" ref="searchForm" size="mini">
                    <el-form-item label="原始订单号：" prop="sourceserial">
                        <el-input v-model="searchForm.sourceserial" clearable  style="width:150px"/>
                    </el-form-item>
                    <el-form-item label="交付日期：" prop="deliveryDate">
                        <el-select v-model="searchForm.deliveryDate" placeholder="请选择" clearable @change="submitSearch">
                            <el-option v-for="(date,idx) in deliveryDateList" :key="idx" :label="parseDate(date)" :value="date"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch" icon="el-icon-search">查找</el-button>
                    </el-form-item>
              </el-form>
            </div>
            <el-table v-loading="listLoading" ref="listTable"
            :data="gridList"
            border fit highlight-current-row stripe
            size="mini" max-height="500" empty-text="请选择查询条件查找待送货的订单汇总" @selection-change="selectionRow">
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <el-row :gutter="10" v-for="(item,idx) in scope.row.children" :key="idx">
                            <el-col :span="1">{{idx+1}}.</el-col>
                            <el-col :span="3">订单状态：{{parseFlow(item.flowStateId)}}</el-col>
                            <el-col :span="4">物料号：{{item.materialNo}}</el-col>
                            <el-col :span="4">物料名称：{{item.productName}}</el-col>
                            <el-col :span="5">{{item.typeId==1?'采购':'生产'}}：{{item.crmName}}</el-col>
                            <el-col :span="2">数量：{{item.count}} {{item.util}}</el-col>
                            <el-col :span="2">单价：{{item.price}}</el-col>
                            <el-col :span="3">合计：{{parseMoney(item)}}</el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="selection" width="55" align="center" :selectable="checkSelectable"/>
                <el-table-column prop="projectNo" label="可送货" width="60">
                    <template slot-scope="scope">
                        <span>{{!checkSelectable(scope.row)?'否':'是'}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="sourceserial" label="原始订单号" width="100"/>
                <el-table-column prop="projectNo" label="项目号" width="130"/>
                <el-table-column prop="projectName" label="项目名称"/>
                <el-table-column prop="modelNo" label="梯号" width="80"/>
                <el-table-column prop="boxNo" label="箱号" width="100"/>
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
                <el-table-column prop="count" label="订单总金额" width="120px">
                    <template slot-scope="scope">
                        <span>{{calcMoney(scope.row)}}</span>
                    </template>
                </el-table-column>
            </el-table>
            <div class="page-container" style="padding: 10px 0;">
                <span style="margin-right:10px">共有 {{gridList.length}} 个送货订单</span>
                <el-button v-if="exportList.length" size="mini" type="primary" icon="el-icon-document" @click="exportOrder">导出送货单</el-button>
                <span v-else>请勾选需要导出的送货单！</span>
            </div>
        </div>
        
    </section>
</template>
<script>
import $util from '@/util/global_util';
export default {
    name:'role',
    data(){
        return {
            deliveryDateList:[],
            exportList:[],
            updateIds:[],
            currItem:null,
            crmOrderList:[],
            sourceCrmOrderList:[],
            isMergeSerial:false,
            dialogForm:{
                flowStateId:5,
                crmId:'',
                deliveryDate:''
            },
            setting:{},
            isEdit:false,
            listLoading:false,
            typeList:[],//settings.type,
            ptypeList:[],
            flowList:[],//settings.flowState,
            crmList:[],
            productList:[],
            query:{
                page:1,
                pagesize:50,
            },
            gridList:[],
            searchForm:{
                sourceserial:'',
                deliveryDate:''
            },
            searchRules:{
                deliveryDate:[{required:true, message: '请选择交付日期', trigger: 'change'}]
            },
            lastId:0,
            openSourceVisible:false,
            detailItem:null,
            sourceserial:'',
            sourceData:[],
            crmOrderIds:[],
            searchLoading:false,
        }
    },
    methods:{
        checkSelectable(row){
            //console.log('checkSelectable',row);
            let flag = true;
            row.children.forEach(item=>{
                if(![4,9].includes(item.flowStateId)){
                    flag = false;
                    return false;
                }
            })
            return flag;
        },
        selectionRow(rows){
            let allMoney = 0;
            let orderCount = 0;
            this.updateIds = [];
            rows.forEach(item=>{
                let obj = {
                    sourceserial:item.sourceserial,
                    projectNo:item.projectNo,
                    projectName:item.projectName,
                    modelNo:item.modelNo,
                    productName:'线槽总成',
                    boxCount:1,
                    totalMoney: $util.toDecimal(item.totalMoney) //this.$options.filters['currency'](item.totalMoney)
                }
                allMoney += item.totalMoney;
                orderCount++;
                this.exportList.push(obj);
                item.children.forEach(c=>{
                    this.updateIds.push(c.id);
                })
            });
            this.exportList.push({
                productName:'合计',
                boxCount:orderCount,
                totalMoney:$util.toDecimal(allMoney)
            });
            console.log(this.exportList, this.updateIds);
        },
        
        exportOrder(){
            import ('@/components/Export2Excel').then(excel=>{
                const tHeader = ['订单号','项目号','项目名称','梯号','部件名称','箱数','订单金额'];
                const filterVal = ['sourceserial','projectNo','projectName','modelNo','productName','boxCount','totalMoney'];
                const data = this.formatJson(filterVal, this.exportList);
                const now =  moment(this.searchForm.deliveryDate).format('YYYYMMDD');
                excel.export_json_to_excel({
                    header: tHeader,
                    data,
                    filename: '送货单' + now,
                    autoWidth: true,
                    bookType: 'xlsx'
                });
                this.updateOrder();
            })
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => {
                if(j == 'deliveryDate'){
                    v[j] = this.parseDate(v[j]);
                }
                return v[j];
            }))
        },
        // 更新客户订单状态（已发单）
        updateOrder(){
            let cn = {
                type:'updatePatch',
                collectionName: 'order',
                param:{'id':{$in:this.updateIds}},
                set:{$set:{'flowStateId':10,'outTypeId':4}}
            }
            this.$axios.$post('mock/db', {data:cn}).then(result=>{
                this.gridList = [];
                this.exportList = [];
                this.updateIds = [];
            });
        },
        showDetail(row){
            /* if(row){
                let crm = _.find(this.crmList, {'id':row.crmId});
                this.dialogForm.crmId = row.crmId;
                this.currItem = {'address':crm.address,'contactName':crm.contactName,'contactPhone':crm.contactPhone,'crmName':crm.name};
                this.listOrderByCrm({crmId:row.crmId});
            }
            this.openDialogVisible = true; */
        },
        filterCrmOrderList(arr,split){
            let list = [], allcount = 0;
            arr.forEach(item=>{
                item.allPrice = item.count * item.price;//(item.count * item.price).toFixed(2);
                allcount += item.count;
                list.push(item);
            });
            this.currItem.crmOrderMoney = 0;
            list.forEach(item=>{
                this.currItem.crmOrderMoney += item.allPrice;
            });
            //this.currItem.crmOrderMoney = this.$options.filters['currency'](parseFloat(this.currItem.crmOrderMoney));
            list.push({
                serial:'合计',
                count:allcount,
                allPrice:this.currItem.crmOrderMoney
            })
            this.crmOrderList = list;
            
        },
        initProduct(){
            this.ptypeList = _.filter(this.setting.ptype,{typeId:2});
            this.crmList = _.filter(this.setting.crm,{typeId:2});
            this.productList = _.filter(this.setting.product, {typeId:2});
        },
        parseFlow(id){
            if(!id) return '';
            let flow = _.find(this.setting.flowState, {'id':id});
            return flow?flow.name:'';
        },
        parseDate(date, format){
            if(!date) return '';
            return moment(date).format(format||'YYYY-MM-DD');
        },
        parseMoney(row){
            return this.$options.filters['currency'](row.count*row.price);
        },
        parsePtype(id){
            if(!id) return '';
            let type = _.find(this.ptypeList, {'id':id});
            return type?type.name:'';
        },
        parseCrm(id){
            if(!id) return '';
            let crm = _.find(this.crmList, {'id':id});
            return crm?crm.name:'';
        },
        calcMoney(row){
            let money = 0;
            if(row.children && row.children.length){
                row.children.forEach(item=>{
                    money += item.count * item.price;
                })
            }
            row.totalMoney = money;
            return this.$options.filters['currency'](money);
        },
        submitSearch(flag){
            this.$refs['searchForm'].validate((valid) => {
                if(valid){
                    let params = {};
                    for(let k in this.searchForm){
                        if(this.searchForm[k] != '' && this.searchForm[k]){
                            if(_.isNumber(this.searchForm[k])){
                                params[k] = Number(this.searchForm[k]);
                            }else if(_.isArray(this.searchForm[k]) && ( k==='deliveryDate')){
                                params[k] = {
                                    $gte:this.searchForm[k][0],
                                    $lt:this.searchForm[k][1] + 24 * 3600 * 1000 - 1
                                }
                            }else if(_.isArray(this.searchForm[k])){
                                params[k] = {$in:this.searchForm[k]}
                            }else{
                                params[k] = {$regex:this.searchForm[k]};
                            }
                        }
                    };
                    this.getList(params);
                }
            });
        },
        handleSizeChange(val){
            this.query.pagesize = val;
            this.submitSearch(true);
        },
        handleCurrentChange(val){
            this.query.page = val;
            this.submitSearch(true);
        },
        // 获取待交付日期
        async getDeliveryDate(){
            let condition = {
                type:'distinctData',
                collectionName: 'order',
                distinct:'deliveryDate',
                data:{'outTypeId':2}
            };

            let result = await this.$axios.$post('mock/db', {data:condition});
            result.sort();
            this.deliveryDateList = result;
        },
        async getList(match = {}){
            this.exportList = [];
            this.listLoading = true;
            let condition = {
                type:'listData',
                collectionName: 'order',
                data:match, //'typeId':2,'flowStateId':9,
            };
            let result = await this.$axios.$post('mock/db', {data:condition});
            console.log('getList', result);
            //debugger
            this.parseListData(_.orderBy(result.list,['flowStateId'], ['desc']));
            this.listLoading = false;
        },
        parseListData(datas){
            let lists = [];
            datas.forEach(item=>{
                //item.children = [];
                let index = _.findIndex(lists, {'sourceserial':item.sourceserial,'projectNo':item.projectNo,'boxNo':item.boxNo,'modelNo':item.modelNo});
                if(!~index){
                    item.children = [item];
                    lists.push(item);
                }else{
                    lists[index]['children'].push(item);
                }
            });
            this.gridList = lists;
        },
        async getSetting(){
            let condition = {
                type:"getData",
                collectionName:"setting",
                data:{}
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            if(result){
                //console.log('getSetting',result)
                this.setting = result.content;
                this.typeList = this.setting.type;
                this.flowList = _.filter(this.setting.flowState, item=>{
                    return item.id>4;
                });
                this.initProduct();
                this.getDeliveryDate();
                //this.getList(); 
            }
        }
    },
    created(){
        this.getSetting();
    }
}
</script>


<style lang="scss" scoped>
    /deep/ .el-table{
        .cell{
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            >i{
                font-size:14px;
                color:#EEE;
                margin-right:5px;
                &.payed{
                    color:green;
                }
            }
            .el-button{
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
                max-width: 100%;
            }
        }
        /deep/ .el-table__expanded-cell{
            padding:5px 10px;
            background-color: #e4f5ff;
            .el-row{
                border-bottom:1px solid #cadde8;
                &:last-child{
                    border: 0;
                }
                .el-col{
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    line-height: 30px;
                    >span{
                        &:first-child{
                            width:80px;
                            display: inline-block;
                            font-weight: bold;
                        }
                    }
                }
            }
            .el-form-item{
                width:32%;
                margin:0;
                .el-form-item__label{
                    font-weight: bold;
                }
            }
        }
    }
    /deep/ .el-dialog{
        .el-dialog__body{
            padding:10px 20PX 30px 20px;
            .compare{
                .order-title{
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-top: 1px solid #DDD;
                }
            }
            .btns{
                padding:10px 0;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }
        }
    }

    .detail-container{
        /deep/ .el-row{
            .el-col{
                margin:0 0 15px 0;
                >div{
                    text-overflow: ellipsis;
                    overflow: hidden;
                    white-space: nowrap;
                }
                .tl{
                    font-weight: bold;
                }
            }
        }
        
    }
</style>