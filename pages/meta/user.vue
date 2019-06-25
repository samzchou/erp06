<template>
    <section>
        <div class="page-title">
            <div>
                <span>用户列表</span>
            </div>
            <div>
                <el-button @click="handleAdd" type="text" size="medium" :icon="!isEdit?'el-icon-plus':'el-icon-close'">{{!isEdit?'新增用户':'取消返回'}}</el-button>
            </div>
        </div>

        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="操作权限：" prop="roles">
                        <el-select v-model="searchForm.roles" placeholder="请选择" multiple clearable  style="width:120px">
                            <el-option v-for="(role,idx) in roleList" :key="idx" :label="role.name" :value="role.id"/>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="姓名：" prop="name">
                        <el-input v-model="searchForm.name" clearable  style="width:100px"/>
                    </el-form-item>
                    <el-form-item label="账号：" prop="username">
                        <el-input v-model="searchForm.username" clearable style="width:100px"/>
                    </el-form-item>
                    <el-form-item label="职务：" prop="posId">
                        <el-select v-model="searchForm.posId" placeholder="请选择" clearable  style="width:120px">
                            <el-option v-for="pos in posList" :key="pos.id" :label="pos.name" :value="pos.id"/>
                        </el-select>
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
            max-height="400" 
            style="width: 100%">
                <el-table-column label="No." width="50px" align="center" type="index"></el-table-column>
                <el-table-column prop="name" label="姓名" width="120px"></el-table-column>
                <el-table-column prop="username" label="用户账号" width="120px"></el-table-column>
                <el-table-column prop="typeId" label="职务" width="200px">
                    <template slot-scope="scope">
                        <span>{{parsePos(scope.row)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="typeId" label="权限" width="200px">
                    <template slot-scope="scope">
                        <span>{{parseRole(scope.row)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="content" label="备注"></el-table-column>
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
                <el-form-item label="姓名" prop="name">
                    <el-input v-model="ruleForm.name" style="width:120px"/>
                </el-form-item>
                <el-form-item label="职务" prop="posId">
                    <el-select v-model="ruleForm.posId" placeholder="请选择职务"  style="width:120px">
                        <el-option v-for="pos in posList" :key="pos.id" :label="pos.name" :value="pos.id"/>
                    </el-select>
                </el-form-item>
                <el-form-item label="操作权限" prop="roles">
                    <el-checkbox-group v-model="ruleForm.roles">
                        <el-checkbox v-for="(role,idx) in roleList" :label="role.id" :key="idx">
                            {{role.name}}
                        </el-checkbox>
                    </el-checkbox-group>
                </el-form-item>
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="ruleForm.username"/>
                </el-form-item>
                <el-form-item label="登录密码" prop="password">
                    <el-input v-model="ruleForm.password" type="password">
                        <template slot="append">
                            <span v-if="dataId">不填写则不修改密码</span>
                            <span v-else>默认密码：{{defaultPwd}}</span>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item label="描述内容" prop="content">
                    <el-input v-model="ruleForm.content" type="textarea" :autosize="{ minRows: 3, maxRows: 10}" placeholder="请输入内容"></el-input>
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
            roleList:[],
            posList:[],
            query:{},
            gridList:[],
            dataId:undefined,
            editRow:null,
            defaultPwd:'juehe123456',
            searchForm:{
                name:'',
                roles:[],
                posId:'',
                username:''
            },
            ruleForm:{
                name:'',
                roles:[],
                posId:'',
                username:'',
                password:'',
                content:''
            },
            rules:{
                name: [
                    { required: true, message: '请输入姓名', trigger: 'blur'},
                ],
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur'},
                ],
                password: [
                    { required: true, message: '请输入登录密码', trigger: 'blur'},
                ],
                roles:[
                    {"type": "array",required: true,min: 1,message: "请至少选1项",trigger: 'change'}
                ]
            }
        }
    },
    methods:{
        handleAdd(){
            this.isEdit = !this.isEdit;
            this.editRow = null;
            this.ruleForm = {
                name:'',
                roles:[],
                posId:'',
                username:'',
                password: this.defaultPwd,
                content:''
            }
        },
        handleUpdate(row){
            this.editRow = row;
            this.dataId = row.id;
            this.ruleForm = {
                name:row.name,
                roles:row.roles,
                posId:row.posId,
                username:row.username,
                password:row.password,
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
                    collectionName: 'user',
                    data:{id:row.id}
                };
                this.$axios.$post('mock/db', {data:condition}).then(result=>{
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                    let index = _.findIndex(this.gridList, {id:row.id});
                    this.gridList.splice(index, 1);
                });
            }).catch();
        },
        parseRole(row){
            let roles = [];
            this.roleList.forEach(item=>{
                if(row.roles.includes(item.id)){
                    roles.push(item.name);
                }
            });
            return roles.join(",");
        },
        parsePos(row){
            if(row.posName){
                return row.posName;
            }else if(row.posId){
                let pos = _.find(this.posList, {'id':row.posId});
                return pos.name;
            }
        },
        submitForm(){
            this.$refs['ruleForm'].validate((valid) => {
                if(valid) {
                    let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                    let condition = {
                        type:'addData',
                        collectionName: 'user',
                        data:{...this.ruleForm}
                    };
                    if(this.dataId){
                        condition.type = 'updateData';
                        condition.data.id = this.dataId;
                        if(this.ruleForm.password === this.editRow.password){
                            delete condition.data.password;
                        }
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
                    });
                }
            });
        },
        submitSearch(){
            let params = {};
            for(let k in this.searchForm){
                if(this.searchForm[k] != '' && this.searchForm[k]){
                    if(_.isNumber(this.searchForm[k])){
                        params[k] = Number(this.searchForm[k]);
                    }else if(_.isArray(this.searchForm[k]) && _.isDate(this.searchForm[k][0])){
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
            //console.log('submitSearch',params);
            this.getList(params)
        },
        async getSetting() {
            let condition = {
                type: "getData",
                collectionName: "setting",
                data: {}
            };
            let result = await this.$axios.$post("mock/db", { data: condition });
            if (result) {
                this.setting = result.content;
                this.roleList = this.setting.role;
                this.posList = this.setting.pos;
                this.getList();
            }
        },
        async getList(match = {}){
            this.listLoading = true;
            let condition = {
                type:'aggregate',
                collectionName: 'user',
                data:match,
                aggregate:[
                    {
                        $lookup:{
                            from: "pos",
                            localField: "posId",
                            foreignField: "id",
                            as: "pos"
                        }
                    },
                    {
                        $unwind: { // 拆分子数组
                            path: "$pos",
                            preserveNullAndEmptyArrays: true // 空的数组也拆分
                        }
                    },
                    {
                        $addFields: {posName:"$pos.name"}
                    },
                    {$sort:{id:1}}
                ]
            };
            if(!_.isEmpty(match)){
                condition.aggregate.unshift({
                    $match:match
                })
            }
            let result = await this.$axios.$post('mock/db', {data:condition});
            //console.log('getList',result)
            this.total = result.total;
            this.gridList = result.list;
            this.listLoading = false;
        },
    },
    created(){
        this.getSetting();
        //this.getList();
    },
   
}
</script>



