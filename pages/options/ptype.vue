<template>
    <section>
        <div class="page-title">
            <div>
                <span>产品分类</span>
            </div>
            <div>
                <el-button @click="handleAdd" type="text" size="medium" :icon="!isEdit?'el-icon-plus':'el-icon-close'">{{!isEdit?'新增产品分类':'取消返回'}}</el-button>
            </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="业务分类：" prop="typeId">
                        <el-select v-model="searchForm.typeId" placeholder="请选择" clearable  style="width:100px">
                            <el-option v-for="(type,idx) in typeList" :key="idx" :label="type.name" :value="type.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="分类名称：">
                        <el-input v-model="searchForm.name" placeholder="输入分类名称" clearable/>
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>
            <el-table v-loading="listLoading"
            :data="gridList"
            border fit highlight-current-row
            size="mini"
            style="width: 100%" max-height="400">
                <el-table-column label="No." width="50px" align="center" type="index">
                    <template slot-scope="scope">
                        <span>{{scope.$index+(query.page - 1) * query.pagesize + 1}} </span>
                    </template>
                </el-table-column>
				<el-table-column label="ID" width="80px">
                    <template slot-scope="scope">
                      {{scope.row.id}}
                    </template>
                </el-table-column>
				<el-table-column prop="typeName" label="业务类别" width="100px"/>
                <el-table-column prop="name" label="产品分类名称" width="200px"/>
                <el-table-column prop="content" label="描述"/>
                <el-table-column label="操作" fixed="right" align="center" width="100">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="handleUpdate(scope.row)">编辑</el-button>
                        <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="page-container" style="padding: 10px 0;">
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200,500]" :page-size="query.pagesize" layout="total,sizes, prev, pager, next" :total="total">
                </el-pagination>
            </div>
        </div>
        <div class="form-container" v-else>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" size="mini">
                <el-form-item label="业务分类" prop="typeId">
                    <el-radio-group v-model="ruleForm.typeId">
                        <el-radio v-for="(type,idx) in typeList" :label="type.id" :key="idx">
                            {{type.name}}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
				<el-form-item label="分类名称" prop="name">
                    <el-input v-model="ruleForm.name" style="width:120px"/>
                </el-form-item>
                <el-form-item label="描述内容" prop="content">
                    <el-input v-model="ruleForm.content" type="textarea" :autosize="{ minRows: 2, maxRows: 6}" placeholder="请输入内容"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" size="medium"  @click="submitForm">提交保存</el-button>
                    <el-button type="infor" size="medium" @click="isEdit=false">取消返回</el-button>
                </el-form-item>
            </el-form>
        </div>
    </section>
</template>
<script>
export default {
    name:'role',
    data(){
        return {
            isEdit:false,
            listLoading:false,
            query:{page:1,pagesize:500},
            total:0,
			typeList:[],
            gridList:[],
            dataId:undefined,
            ruleForm:{
				typeId:1,
                name:'',
                content:''
            },
            rules:{
                name: [
                    { required: true, message: '请输入仓库库位名称', trigger: 'blur'},
                ]
            },
            searchForm:{
				typeId:'',
				name:''
            }
        }
    },
    methods:{
        handleAdd(){
            this.isEdit = !this.isEdit;
            this.ruleForm = {
				typeId:1,
                name:'',
                content:''
            }
        },
        handleUpdate(row){
            this.dataId = row.id;
            this.ruleForm = {
				typeId:row.typeId,
                name:row.name,
                content:row.content
            }
            this.isEdit = true;
        },
        handleDelete(row){
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let condition = {
                    type:'removeData',
                    collectionName: 'ptype',
                    data:{id:row.id}
                };
                this.$axios.$post('mock/db', {data:condition}).then(result=>{
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                    let index = _.findIndex(this.gridList, {id:row.id});
                    this.gridList.splice(index, 1);
                    this.writeFile();
                });
            }).catch();
        },
        submitForm(){
            this.$refs['ruleForm'].validate((valid) => {
                if(valid) {
                    let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                    let condition = {
                        type:'addData',
                        collectionName: 'ptype',
                        data:this.ruleForm
                    };
                    if(this.dataId){
                        condition.type = 'updateData';
                        condition.data.id = this.dataId;
                    }

                    this.$axios.$post('mock/db', {data:condition}).then(result=>{
                        loadingMask.close();
                        this.isEdit = false;
						let typeObj = {typeName:_.find(this.typeList,{id:this.ruleForm.typeId}).name};
                        if(this.dataId){
                            let index = _.findIndex(this.gridList, {id:this.dataId});
                            this.$set(this.gridList, index, _.merge(this.ruleForm, typeObj));
                        }else{
                            this.gridList.push(_.merge(result, typeObj));
                        }
                        this.dataId = undefined;
                        this.writeFile();
                    });

                }
            });
        },
        async writeFile(){
            let params = {
                type:'listData',
                collectionName: 'ptype',
                data:{}
            }
            let data = await this.$axios.$post('mock/db', {data:params});
            let condition = {
                type:'updateSetting',
                collectionName: 'ptype',
                data:data.list
            }
            await this.$axios.$post('mock/db', {data:condition});
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
                    pagesize:20
                }
            }
            this.getList(params);
        },

        async getList(match={}){
            this.listLoading = true;
			let condition = {
                type:'aggregate',
                collectionName: 'ptype',
                data:match,
                aggregate:[
                    {
                        $lookup:{
                            from: "type",
                            localField: "typeId",
                            foreignField: "id",
                            as: "type"
                        }
                    },
                    {
                        $unwind: { // 拆分子数组
                            path: "$type",
                            preserveNullAndEmptyArrays: true // 空的数组也拆分
                        }
                    },
					{
                        $addFields: {typeName:"$type.name"}
                    },
                    {$sort:{id:-1}},
                    {$skip:(this.query.page-1)*this.query.pagesize},
                    {$limit:this.query.pagesize}
                ]
            };
            if(!_.isEmpty(match)){
                condition.aggregate.unshift({
                    $match:match
                })
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.total = result.total;
            this.gridList = result.list;
            this.listLoading = false;
            //console.log('getList',this.gridList);
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
                this.typeList = this.setting.type;
                this.getList();
            }
        }
    },
    created(){
        this.getSetting();
    }
}
</script>



