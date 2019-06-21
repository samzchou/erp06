<template>
    <section>
        <div class="page-title">
            <div>
                <span>系统权限列表</span>
            </div>
            <div>
                <el-button @click="handleAdd" type="text" size="medium" :icon="!isEdit?'el-icon-plus':'el-icon-close'">{{!isEdit?'新增权限':'取消返回'}}</el-button>
            </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <el-table v-loading="listLoading" 
            :data="gridList" 
            border fit highlight-current-row 
            size="mini" 
            style="width: 100%" max-height="400">
                <el-table-column label="No." width="50px" align="center" type="index"></el-table-column>
                <el-table-column prop="name" label="名称" width="200px"></el-table-column>
                <el-table-column prop="tag" label="别名" width="150px"></el-table-column>
                <el-table-column prop="content" label="描述"></el-table-column>
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
                <el-form-item label="权限名称" prop="name">
                    <el-input v-model="ruleForm.name"  style="width:150px"/>
                </el-form-item>
                <el-form-item label="别名" prop="tag">
                    <el-input v-model="ruleForm.tag"  style="width:150px"/>
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
            query:{},
            gridList:[],
            dataId:undefined,
            ruleForm:{
                name:'',
                tag:'',
                content:''
            },
            rules:{
                name: [
                    { required: true, message: '请输入权限名称', trigger: 'blur'},
                ],
                tag:[
                    {"required": true, "message": '请输入权限别名', "trigger": 'blur'},
                    {"pattern": "^[A-Za-z]+$","message": "正则验证失败: 须匹配英文字母","trigger": "blur"}
                ]
            }
        }
    },
    methods:{
        handleAdd(){
            this.isEdit = !this.isEdit;
            this.ruleForm = {
                name:'',
                tag:'',
                content:''
            }
        },
        handleUpdate(row){
            this.dataId = row.id;
            this.ruleForm = {
                name:row.name,
                tag:row.tag,
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
                    collectionName: 'role',
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
                        collectionName: 'role',
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
                collectionName: 'role',
                data:{}
            }
            let data = await this.$axios.$post('mock/db', {data:params});
            let condition = {
                type:'updateSetting',
                collectionName: 'role',
                data:data.list
            }
            await this.$axios.$post('mock/db', {data:condition});
        },
        async getList(){
            this.listLoading = true;
            let condition = _.merge(this.query,{
                type:'listData',
                collectionName: 'role',
                data:{}
            });
            let result = await this.$axios.$post('mock/db', {data:condition});
            this.total = result.total;
            this.gridList = result.list;
            this.listLoading = false;
            console.log('getList',this.gridList);
        }
    },
    created(){
        this.getList();
    }
}
</script>



