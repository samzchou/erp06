<template>
	<section>
		<div class="page-title">
			<div>
					<span>生产订单导入</span>
			</div>
		</div>
		<div class="form-container">
			<div class="upload-container">
				<el-form :inline="true" :model="tableForm" :rules="tableRules" ref="tableForm" size="mini" v-if="sourceData.length">
					<el-form-item label="客户名称：" prop="crmId">
						<el-select v-model="tableForm.crmId" placeholder="请选择客户" filterable style="width:250px">
							<el-option v-for="crm in setting.crm" :key="crm.id" :label="crm.name" :value="crm.id"/>
						</el-select>
					</el-form-item>
					<el-form-item label="订单类型：">
            <el-checkbox-group v-model="tableForm.typeId" @change="tableFilter">
              <el-checkbox v-for="item in typeList" :key="item.id" :label="item.id">{{item.name}}</el-checkbox>
            </el-checkbox-group>
					</el-form-item>
          <!-- <el-form-item label="过滤重复梯号订单：" >
            <el-switch v-model="tableForm.modelFilter" @change="tableFilter"/>
					</el-form-item> -->
					<el-form-item>
						<el-button type="primary" @click="saveTable" v-if="tableData.length">保存数据</el-button>
            <el-button type="" @click="sourceData=[]">重新上传</el-button>
					</el-form-item>
				</el-form>
				<upload-excel-component v-else size="mini" @saveData="saveData" :on-success="handleSuccess" :before-upload="beforeUpload"/>
			</div>
      <div v-if="uploading">正在导入订单中...</div>
			<!--批量导入-->
			<div v-if="sourceData.length">
				<el-table size="mini"
				:data="tableData.slice((queryUpload.page-1)*queryUpload.pagesize, queryUpload.page*queryUpload.pagesize)"
				border highlight-current-row
				style="width: 100%;margin-top:20px;" max-height="400">
					<el-table-column label="No." width="70px" align="center">
							<template slot-scope="scope">
									<span>{{scope.$index+(queryUpload.page - 1) * queryUpload.pagesize + 1}} </span>
							</template>
					</el-table-column>
					<el-table-column v-for="item of tableHeader" :prop="item" :label="item" :key="item" :width="(item=='isBuy'||item=='isRepeat')?120:300">
						<template slot-scope="scope">
							<span :class="{'warning':(item=='isBuy'||item=='isRepeat')}">{{scope.row[item]}}</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" fixed="right" align="center" width="100">
						<template slot-scope="scope" v-if="scope.row.isRepeat">
								<el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
						</template>
					</el-table-column>
				</el-table>
				<div class="page-container" style="padding: 10px 0;">
						<el-pagination size="mini" @size-change="uploadSizeChange" @current-change="uploadCurrentChange" :current-page.sync="queryUpload.page" :page-sizes="[20, 50, 100, 200]" :page-size="queryUpload.pagesize" layout="total,sizes, prev, pager, next" :total="uploadTotal">
						</el-pagination>
				</div>
			</div>
		</div>
	</section>
</template>
<script>
const tableKeys = [
	{label:'订单编号',value:'serial'},
	{label:'梯型',value:'model'},
	{label:'项目号',value:'projectNo'},
	{label:'梯号',value:'modelNo'},
	{label:'箱号',value:'boxNo'},
	{label:'制单日期',value:'orderDate'},
	{label:'交货日期',value:'deliveryDate'},
	{label:'物料号/版本号',value:'materialNo'},
	{label:'图号/版本号',value:'caselNo'},
	{label:'产品名称',value:'productName'},
	{label:'数量',value:'count'},
	{label:'单位',value:'util'},
	{label:'单价',value:'price'},
	{label:'项目名称',value:'projectName'},
	{label:'备注',value:'content'}
];
import UploadExcelComponent from '@/components/UploadExcel'
export default {
	name:'role',
	components: { UploadExcelComponent },
	data(){
		return {
			uploading:false,
			setting:{},
			typeList:[],
			productList:[],
			modelNoList:[],
      serialList:[],
			uploadTotal:0,
			queryUpload:{
				page:1,
				pagesize:20
			},
			lastId:0,
			tableForm:{
				crmId:'',
				typeId:[],
        modelFilter:false
			},
			tableRules:{
				crmId:[{ required: true, message: '请选择客户', trigger: 'change'}]
			},
      repeatCount:0,
			sourceData:[],
			tableData: [],
			tableHeader: []
		}
	},
	methods:{
		tableFilter(){
      let list = _.cloneDeep(this.sourceData);
      // 过滤订单类型
      if(this.tableForm.typeId.length){
        list = _.filter(list, (item)=>{
          return this.tableForm.typeId.includes(item.typeId);
        });
      }
      // 过滤重复梯号
      /* this.repeatCount = 0;
      if(this.tableForm.modelFilter){
        list = _.filter(list, (item)=>{
          return item.isRepeat === undefined;
        });
      }else{
        list.forEach(item=>{
          if(item.isRepeat !== undefined){
            this.repeatCount++;
          }
        })
      } */
      this.tableData = list;
      this.uploadTotal = this.tableData.length;
		},
    modelFilter(flag){
      console.log('modelFilter', flag);
      let list = _.cloneDeep(this.sourceData);
      this.repeatCount = 0;
      if(list.length){
        if(flag){
          this.tableData = _.filter(list, (item)=>{
            return item.isRepeat === undefined;
          });
        }else{
          this.tableData = list;
          list.forEach(item=>{
            if(item.isRepeat !== undefined){
              this.repeatCount++;
            }
          })
        }
        this.uploadTotal = this.tableData.length;
      }
    },
		beforeUpload(file) {
			this.tableData = [];
			const isLt1M = file.size / 1024 / 1024 < 1
			if (isLt1M) {
        this.uploading = true;
				return true;
			}
			this.$message({
				message: '文件大小不能超过1M',
				type: 'warning'
			})
			return false;
		},
		handleDelete(row){
			console.log('handleDelete',row);
      let index = _.findIndex(this.tableData, {'index':row.index})
      this.tableData.splice(index, 1);
      this.uploadTotal = this.tableData.length;
		},
    checkSerial(){
      let serial = this.handleSerial(true);
      if(this.serialList.includes(serial)){
        serial = this.checkSerial();
      }
      return serial;
    },
		handleSuccess({results, header}) {
			// 处理列名
			this.tableHeader = ['isBuy','isRepeat'];
      // 重复订单量
      this.repeatCount = 0;
			header.forEach(str=>{
				if(_.find(tableKeys,{'label':str}) && !this.tableHeader.includes(str)){
					this.tableHeader.push(str)
				}
			});
			//处理导入的数据
      var index = 1;
      //var series = [];
			results = results.map(item=>{
        index += 1;
				for(let k in item){
          item.index = index;
					if(k === '订单编号'){
            let serial = this.checkSerial();
            this.serialList.push(serial);
						item[k] = serial;
					}else if(k ==='产品名称'){
            if(item[k].indexOf('桥顶防护栏')>0 || item[k].indexOf('线槽')>0 || item[k].indexOf('挂钩')>0 || item[k].indexOf('救援装置柜')>0){
              item['isBuy'] = '属于采购';
              item.typeId = 2;
            }else{
              item.typeId = 1;
            }
					}else if(k ==='梯号' && this.checkModelNo(item[k])){
            item['isRepeat'] = '订单梯号重复';
            this.repeatCount += 1;
          }
				}
				return item;
			});
			debugger
			this.sourceData = _.orderBy(results,['isBuy','isRepeat'],['asc']);
			this.tableData = _.cloneDeep(this.sourceData);
			this.uploadTotal = this.sourceData.length;
      this.uploading = false;
		},
    checkModelNo(no){
      if(_.find(this.modelNoList, {'modelNo':no})){
        return true;
      }
      return false;
    },
		uploadSizeChange(val){
			this.queryUpload.pagesize = val;
		},
		uploadCurrentChange(val){
			this.queryUpload.page = val;
		},
		handleSerial(flag){
			return Math.random().toString(36).substr(2).toLocaleUpperCase();
		},
		saveTable(){
      this.$refs['tableForm'].validate((valid) => {
				if(valid){
          if(this.repeatCount){
            this.$confirm('订单有'+this.repeatCount+'个重复的梯号, 是否继续?', '', {
              confirmButtonText: '确定',
              cancelButtonText: '取消',
              type: 'warning'
            }).then(() => {
              this.saveData();
            }).catch(()=>{});
          }else{
            this.saveData();
          }
				}
			});
		},
		_setValue(key, value){
			switch(key){
				case 'orderDate':
					return new Date(value).getTime();
				case 'deliveryDate':
					return new Date(value).getTime();
				case 'count':
					return Number(value);
				case 'price':
					return Number(value);
				default:
					return  _.trim(String(value));
			}
		},
		async saveData(){
			let crm = _.find(this.setting.crm,{'id':this.tableForm.crmId});
			let dataList = this.tableData.map((item, index)=>{
				let id = this.lastId + index + 1;
				let obj = {id:id,typeId:2,flowStateId:4,crmId:crm.id,crmName:crm.name,crmNo:crm.crmNo,createByUser:this.$store.state.user.name};
				for(let key in item){
					if(key === 'isBuy'){
						obj = _.merge(obj, {typeId:1,flowStateId:1});
					}
					let o = _.find(tableKeys, {label:key});
					if(o){
						let k = o.value;
						let val = this._setValue(k, item[key]);
            if(k === 'productName'){
							let p = _.find(this.productList, {'name':val,'typeId':obj.typeId});
							if(p){
								obj.ptypeId = p.ptypeId;
								obj.productId = p.id;
							}
						}
						/* if(k === 'crmName'){
							let crm = _.find(this.setting.crm, {'name':val});
							if(crm){
								obj.crmId = crm.id;
							}
						} */
						obj[k] = val;
					}
				};
				return obj;
			});
			let condition = {
				type:'addPatch',
				collectionName: 'order',
				data:dataList
			};
			console.log(condition);
      //return;
			this.$axios.$post('mock/db', {data:condition}).then(result=>{
        this.sourceData = [];
				this.tableData = [];
				this.getModelNoList();
				this._getLastId();
			});
		},
		// 获取所有订单列表,列出梯号,校验是否重复
		async getModelNoList(match = {}){
			let condition = {
				type:"getColumns",
				collectionName: 'order',
				cols:{modelNo:1,crmId:1,serial:1}
			}
			let result = await this.$axios.$post('mock/db', {data:condition});
			console.log('getModelNoList',result);
			this.modelNoList = result;
      result.forEach(item=>{
        this.serialList.push(item.serial);
      });
      console.log('serialList',this.serialList);
		},
		async _getLastId(){
			let condition = {
				type:"getId",
				data:{
						model:'order'
				}
			}
			let result = await this.$axios.$post('mock/db', {data:condition});
			if(result){
				console.log('lastId',result)
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
				console.log('getSetting',result);
				this.setting = result.content;
				this.typeList = this.setting.type;
        this.productList = this.setting.product;
				this.getModelNoList();
			}
		}
	},
	created(){
		this.getSetting();
		this._getLastId();
	},
	mounted(){

	}
}
</script>

<style lang="scss" scoped>
	.upload-container{
		display:flex;
		align-item:center;
	}
	.warning{
		color:red;
	}
</style>

