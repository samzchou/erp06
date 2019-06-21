<template>
    <section>
        <div class="page-title">
            <div>
                <span>流程状态列表</span>
            </div>
            <div>
                <el-button @click="handleAdd" type="text" size="medium" :icon="!isEdit?'el-icon-plus':'el-icon-close'">{{!isEdit?'新增流程状态':'取消返回'}}</el-button>
            </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <el-table v-loading="listLoading"
            :data="gridList"
            border fit highlight-current-row
            size="mini" style="width: 100%">
				<el-table-column prop="id" label="状态ID" width="60px"/>
                <el-table-column prop="name" label="流程状态名称" width="200px"/>
                <el-table-column prop="typeId" label="所属业务分类" width="200px">
                    <template slot-scope="scope">
                        <span>{{parseType(scope.row)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="content" label="描述"/>
                <el-table-column label="操作" fixed="right" align="center" width="100">
                    <template slot-scope="scope">
                        <el-button size="mini" type="text" @click="handleUpdate(scope.row)">编辑</el-button>
                        <el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <div class="form-container" v-else>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="100px" size="mini">
                <el-form-item label="状态名称" prop="name">
                    <el-input v-model="ruleForm.name"></el-input>
                </el-form-item>
                <el-form-item label="业务分类" prop="orgId">
                    <el-radio-group v-model="ruleForm.typeId">
                        <el-radio v-for="(type,idx) in typeList" :label="type.id" :key="idx">
                            {{type.name}}
                        </el-radio>
                    </el-radio-group>
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
            setting:{},
            typeList:[],
            query:{},
            gridList:[],
            dataId:undefined,
            ruleForm:{
                name:'',
                typeId:'',
                content:''
            },
            rules:{
                name: [
                    { required: true, message: '请输入流程状态名称', trigger: 'blur'},
                ]
            }
        }
    },
    methods:{
        handleAdd(){
            this.isEdit = !this.isEdit;
            this.ruleForm = {
                name:'',
                typeId:1,
                content:''
            }
        },
        handleUpdate(row){
            this.dataId = row.id;
            this.ruleForm = {
                name:row.name,
                typeId:row.typeId,
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
                    collectionName: 'flowState',
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
        parseType(row){
            //console.log('parseType',row);
            if(row.type &&  row.type.name){
                return row.type.name;
            }else if(row.typeId){
                let type = _.find(this.typeList, {'id':row.typeId});
                return type.name;
            }
        },
        submitForm(){
            this.$refs['ruleForm'].validate((valid) => {
                if(valid) {
                    let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                    let condition = {
                        type:'addData',
                        collectionName: 'flowState',
                        data:this.ruleForm
                    };
                    if(this.dataId){
                        condition.type = 'updateData';
                        condition.data.id = this.dataId;
                    }

                    this.$axios.$post('mock/db', {data:condition}).then(result=>{
                        loadingMask.close();
                        this.isEdit = false;
                        if(this.dataId){
                            let index = _.findIndex(this.gridList, {id:this.dataId});
                            this.$set(this.gridList, index, this.ruleForm)
                        }else{
                            this.gridList.push(result);
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
                collectionName: 'flowState',
                data:{}
            }
            let data = await this.$axios.$post('mock/db', {data:params});
            let condition = {
                type:'updateSetting',
                collectionName: 'flowState',
                data:data.list
            }
            await this.$axios.$post('mock/db', {data:condition});
        },
        //typeList
        async getSetting() {
            let condition = {
                type: "getData",
                collectionName: "setting",
                data: {}
            };
            let result = await this.$axios.$post("mock/db", { data: condition });
            if (result) {
                this.setting = result.content;
                this.typeList = this.setting.type;
                this.getList();
            }
        },
        async getList(){
            this.listLoading = true;
            let condition = _.merge(this.query,{
                type:'aggregate',
                collectionName: 'flowState',
                aggregate:[
                    {
                        $lookup:{
                            from: "types",
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
                    {$sort:{id:1}}
                ]
            });
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.total = result.total;
            this.gridList = result.list;
            this.listLoading = false;
            console.log('getList',this.gridList);
        },
    },
    created(){
        this.getSetting();
    }
}
</script>



