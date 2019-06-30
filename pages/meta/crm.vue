<template>
    <section>
        <div class="page-title">
            <div>
                <span>客户列表</span>
            </div>
            <div>
                <el-button @click="handleAdd" type="text" size="medium" :icon="!isEdit?'el-icon-plus':'el-icon-close'">{{!isEdit?'新增客户':'取消返回'}}</el-button>
            </div>
        </div>
        <div class="grid-container" v-if="!isEdit">
            <div class="search-content">
                <el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
                    <el-form-item label="分类：" prop="typeId">
                        <el-select v-model="searchForm.typeId" placeholder="请选择" clearable style="width:100px">
                            <el-option v-for="(type,idx) in typeList" :key="idx" :label="type.name" :value="type.id" />
                        </el-select>
                    </el-form-item>
                    <el-form-item label="客户名称：" prop="name">
                        <el-input v-model="searchForm.name" clearable style="width:200px" />
                    </el-form-item>
                    <el-form-item label="客户ID：" prop="crmNo">
                        <el-input v-model="searchForm.crmNo" clearable style="width:200px" />
                    </el-form-item>
                    <el-form-item label="联系人：" prop="contactName">
                        <el-input v-model="searchForm.contactName" clearable style="width:100px" />
                    </el-form-item>
                    <el-form-item>
                        <el-button type="primary" @click="submitSearch">搜索</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <el-table v-loading="listLoading" :data="gridList" border fit highlight-current-row size="mini" style="width: 100%">
                <el-table-column label="No." width="50px" align="center" type="index">
                    <template slot-scope="scope">{{scope.$index+(query.page - 1) * query.pagesize + 1}} </template>
                </el-table-column>
                <el-table-column prop="typeName" label="所属类别" width="80" />
                <el-table-column prop="isuse" label="启用" width="80">
                    <template slot-scope="scope">
                        <el-switch size="mini" v-model="scope.row.isuse" @change="changeIsUse(scope.row)" />
                    </template>
                </el-table-column>
                <el-table-column prop="name" label="客户名称" width="180" />
                <el-table-column prop="crmNo" label="客户ID" width="150" />
                <el-table-column prop="revenueNo" label="税号" width="150" />
                <el-table-column prop="slv" label="税率" width="70" />
                <el-table-column prop="bank" label="开户银行" width="200" />
                <el-table-column prop="bankNo" label="银行账号" width="150" />
                <el-table-column prop="address" label="联系地址" width="150" />
                <el-table-column prop="contactName" label="联系人" width="100" />
                <el-table-column prop="contactPhone" label="联系电话" width="120" />
                <el-table-column prop="payTypeId" label="付款方式" width="80">
                    <template slot-scope="scope">
                        <span>{{parsePayType(scope.row.payTypeId)}}</span>
                    </template>
                </el-table-column>
                <el-table-column prop="payTimes" label="付款期" width="80">
                    <template slot-scope="scope">
                        <span>{{scope.row.payTimes}} 天</span>
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
            <div class="page-container" style="padding: 10px 0;">
                <el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page"
                    :page-sizes="[20, 50, 100, 200,500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
                </el-pagination>
            </div>
        </div>
        <div class="form-container" v-else>
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" size="mini">
                <el-form-item label="业务分类" prop="typeId">
                    <el-radio-group v-model="ruleForm.typeId">
                        <el-radio v-for="(type,idx) in typeList" :label="type.id" :key="idx">
                            {{type.name}}
                        </el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="客户名称" prop="name">
                    <el-input v-model="ruleForm.name" style="width:200px" />
                </el-form-item>
                <el-form-item label="客户ID" prop="crmNo">
                    <el-input v-model="ruleForm.crmNo" style="width:200px" />
                </el-form-item>
                <el-form-item label="税号" prop="revenueNo">
                    <el-input v-model="ruleForm.revenueNo" style="width:200px" />
                </el-form-item>
                <el-form-item label="税率" prop="slv">
                    <el-input-number v-model="ruleForm.slv" controls-position="right" :min="0" />
                </el-form-item>
                <el-form-item label="开户银行" prop="bank">
                    <el-input v-model="ruleForm.bank" style="width:200px" />
                </el-form-item>
                <el-form-item label="银行账号" prop="bankNo">
                    <el-input v-model="ruleForm.bankNo" />
                </el-form-item>
                <el-form-item label="联系地址" prop="address">
                    <el-input v-model="ruleForm.address" />
                </el-form-item>
                <el-form-item label="联系人" prop="contactName">
                    <el-input v-model="ruleForm.contactName" style="width:120px" />
                </el-form-item>
                <el-form-item label="联系电话" prop="contactPhone">
                    <el-input v-model="ruleForm.contactPhone" style="width:120px" />
                </el-form-item>
                <el-form-item label="付款方式" prop="payTypeId">
                    <el-select v-model="ruleForm.payTypeId" placeholder="请选择" style="width:120px">
                        <el-option v-for="pay in payTypeList" :key="pay.id" :label="pay.name" :value="pay.id" />
                    </el-select>
                </el-form-item>
                <el-form-item label="付款期" prop="payTimes">
                    <el-input v-model="ruleForm.payTimes" style="width:120px">
                        <template slot="append">
                            <span>天</span>
                        </template>
                    </el-input>
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
    </section>
</template>
<script>
export default {
    name: 'role',
    data() {
        return {
            setting: {},
            isEdit: false,
            listLoading: false,
            payTypeList: [],
            typeList: [],
            total: 0,
            query: { page: 1, pagesize: 500 },
            gridList: [],
            dataId: undefined,
            editRow: null,
            searchForm: {
                name: '',
                crmNo: '',
                typeId: '',
                contactName: ''
            },
            ruleForm: {
                typeId: '',
                crmNo: '',
                name: '',
                revenueNo: '',
                bank: '',
                bankNo: '',
                slv: 0,
                address: '',
                contactName: '',
                contactPhone: '',
                payTypeId: '',
                payTimes: '',
                content: ''
            },
            rules: {
                typeId: [
                    { required: true, message: '请选择业务分类', trigger: 'change' },
                ],
                name: [
                    { required: true, message: '请输入姓名', trigger: 'blur' },
                ],
                contactName: [
                    { required: true, message: '请输入联系人', trigger: 'blur' },
                ],
                contactPhone: [
                    { required: true, message: '请输入联系人电话', trigger: 'blur' },
                ],
                payTypeId: [
                    { required: true, message: '请选择付款方式', trigger: 'change' },
                ]
            }
        }
    },
    methods: {
        handleAdd() {
            this.isEdit = !this.isEdit;
            this.editRow = null;
            this.ruleForm = {
                typeId: this.typeList[0]['id'],
                name: '',
                crmNo: '',
                revenueNo: '',
                bank: '',
                bankNo: '',
                address: '',
                contactName: '',
                contactPhone: '',
                payTypeId: '',
                payTimes: '',
                content: ''
            }
        },
        handleUpdate(row) {
            this.editRow = row;
            this.dataId = row.id;
            this.ruleForm = {
                typeId: row.typeId,
                crmNo: row.crmNo,
                name: row.name,
                revenueNo: row.revenueNo,
                bank: row.bank,
                bankNo: row.bankNo,
                address: row.address,
                contactName: row.contactName,
                contactPhone: row.contactPhone,
                payTypeId: row.payTypeId,
                payTimes: row.payTimes,
                content: row.content
            }
            this.isEdit = true;
        },
        handleDelete(row) {
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                let condition = {
                    type: 'removeData',
                    collectionName: 'crm',
                    data: { id: row.id }
                };
                this.$axios.$post('mock/db', { data: condition }).then(result => {
                    this.$message({
                        type: 'success',
                        message: '删除成功!'
                    });
                    let index = _.findIndex(this.gridList, { id: row.id });
                    this.gridList.splice(index, 1);
                    this.writeFile()
                });
            }).catch();
        },
        parsePayType(id) {
            if (!id) return '';
            let type = _.find(this.payTypeList, { 'id': id });
            return type.name;
        },
        parsePos(row) {
            if (row.posName) {
                return row.posName;
            } else if (row.posId) {
                let pos = _.find(this.posList, { 'id': row.posId });
                return pos.name;
            }
        },
        submitForm() {
            this.$refs['ruleForm'].validate((valid) => {
                if (valid) {
                    let loadingMask = this.$loading({ background: 'rgba(0, 0, 0, 0.5)' });
                    let condition = {
                        type: 'addData',
                        collectionName: 'crm',
                        data: { ...this.ruleForm }
                    };
                    if (this.dataId) {
                        condition.type = 'updateData';
                        condition.data.id = this.dataId;
                        condition.updateDate = true;
                    }
                    this.$axios.$post('mock/db', { data: condition }).then(result => {
                        loadingMask.close();
                        this.isEdit = false;
                        let typeObj = { typeName: _.find(this.typeList, { id: this.ruleForm.typeId }).name };
                        if (this.dataId) {
                            let index = _.findIndex(this.gridList, { id: this.dataId });
                            this.$set(this.gridList, index, _.merge(this.editRow, this.ruleForm, typeObj));
                        } else {
                            this.gridList.push(_.merge(result, typeObj));
                        }
                        this.dataId = undefined;
                        this.writeFile();
                    });
                }
            });
        },
        async writeFile() {
            let params = {
                type: 'listData',
                collectionName: 'crm',
                data: {}
            }
            let data = await this.$axios.$post('mock/db', { data: params });
            let condition = {
                type: 'updateSetting',
                collectionName: 'crm',
                data: data.list
            }
            await this.$axios.$post('mock/db', { data: condition });
        },
        async changeIsUse(row) {
            let condition = {
                type: 'updateData',
                collectionName: 'crm',
                updateDate: true,
                data: {
                    id: row.id,
                    isuse: row.isuse
                }
            };
            let result = await this.$axios.$post('mock/db', { data: condition });
        },
        submitSearch(flag) {
            let params = {};
            for (let k in this.searchForm) {
                if (this.searchForm[k] != '' && this.searchForm[k]) {
                    if (_.isNumber(this.searchForm[k])) {
                        params[k] = Number(this.searchForm[k]);
                    } else if (_.isArray(this.searchForm[k]) && _.isDate(this.searchForm[k][0])) {
                        params[k] = {
                            $gte: this.searchForm[k][0],
                            $lt: this.searchForm[k][1] + 24 * 3600 * 1000 - 1
                        }
                    } else if (_.isArray(this.searchForm[k])) {
                        params[k] = { $in: this.searchForm[k] }
                    } else {
                        params[k] = { $regex: this.searchForm[k] };
                    }
                }
            };
            if (!flag) { // 不需要再做分页复位
                this.query = {
                    page: 1,
                    pagesize: 20
                }
            }
            //console.log('submitSearch',params);
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
        async getList(match = {}) {
            this.listLoading = true;
            let condition = {
                type: 'aggregate',
                collectionName: 'crm',
                data: match,
                aggregate: [
                    {
                        $lookup: {
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
                        $addFields: { typeName: "$type.name" }
                    },
                    { $sort: { id: 1 } },
                    { $skip: (this.query.page - 1) * this.query.pagesize },
                    { $limit: this.query.pagesize }
                ]
            };

            if (!_.isEmpty(match)) {
                condition.aggregate.unshift({
                    $match: match
                })
            }
            //console.log('aggregate', condition.aggregate)
            let result = await this.$axios.$post('mock/db', { data: condition });
            console.log('getList', result)
            this.total = result.total;
            this.gridList = result.list;
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
                //console.log('getSetting',result)
                this.setting = result.content;
                this.payTypeList = this.setting.payType;
                this.typeList = this.setting.type;

                this.getList();
            }
        }
    },
    created() {
        this.getSetting();
    }
}
</script>



