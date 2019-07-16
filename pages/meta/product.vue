<template>
	<section>
		<div class="page-title">
			<div>
				<span>{{isEdit?'产品编辑':'产品列表'}}</span>
			</div>
			<div>
				<el-button @click="handleAdd" type="text" size="medium" :icon="!isEdit?'el-icon-plus':'el-icon-close'">{{!isEdit?'新增产品':'取消返回'}}</el-button>
			</div>
		</div>
		<div class="grid-container" v-if="!isEdit">
			<div class="search-content">
				<el-form :inline="true" :model="searchForm" ref="searchForm" size="mini" @keyup.native.enter="submitSearch">
					<el-form-item label="业务分类：">
						<el-select v-model="searchForm.typeId" placeholder="请选择" clearable style="width:100px" @change="filterPtypeBySearch">
							<el-option v-for="(type,idx) in typeList" :key="idx" :label="type.name" :value="type.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="产品分类：">
						<el-select v-model="searchForm.ptypeId" placeholder="请选择" multiple clearable>
							<el-option v-for="(ptype,idx) in searchptypeList" :key="idx" :label="ptype.name" :value="ptype.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="产品名称：">
						<el-input v-model="searchForm.name" clearable style="width:200px" />
					</el-form-item>
					<el-form-item label="规格/梯形：">
						<el-input v-model="searchForm.model" clearable style="width:100px" />
					</el-form-item>
					<el-form-item label="型号/梯号：">
						<el-input v-model="searchForm.modelNo" clearable style="width:100px" />
					</el-form-item>
					<el-form-item label="物料/版本号：">
						<el-input v-model="searchForm.materialNo" clearable style="width:120px" />
					</el-form-item>
					<el-form-item label="关联客户：" prop="crmId">
						<el-select v-model="searchForm.crmId" placeholder="请选择" multiple clearable>
							<el-option v-for="(crm,idx) in searchCrmList" :key="idx" :label="crm.name" :value="crm.id" />
						</el-select>
					</el-form-item>
					<el-form-item>
						<el-button type="primary" @click="submitSearch">搜索</el-button>
					</el-form-item>
				</el-form>
			</div>

			<el-table v-loading="listLoading" :data="gridList" border fit highlight-current-row stripe size="mini" max-height="500">
				<el-table-column label="No." align="center" type="index">
					<template slot-scope="scope">{{scope.$index+(query.page - 1) * query.pagesize + 1}} </template>
				</el-table-column>
				<el-table-column prop="typeId" label="业务分类" width="100px">
					<template slot-scope="scope">
						{{parseType(scope.row.typeId)}}
					</template>
				</el-table-column>
				<el-table-column prop="ptypeId" label="产品分类" width="100px">
					<template slot-scope="scope">
						{{parsePtype(scope.row.ptypeId)}}
					</template>
				</el-table-column>
				<el-table-column prop="name" label="产品名称" />
				<el-table-column prop="crmId" label="关联客户">
					<template slot-scope="scope">
						{{parseCrm(scope.row.crmId)}}
					</template>
				</el-table-column>
				<el-table-column prop="model" label="规格/梯型" width="100px" />
				<el-table-column prop="modelNo" label="型号/梯号" width="100px" />
				<el-table-column prop="materialNo" label="物料号/版本号" />
				<el-table-column prop="caselNo" label="图号/版本号" />
				<el-table-column prop="price" label="单价" width="100px">
					<template slot-scope="scope">
						{{scope.row.price | currency}}
					</template>
				</el-table-column>
				<el-table-column label="操作" fixed="right" align="center" width="100">
					<template slot-scope="scope">
						<el-button size="mini" type="text" @click="handleUpdate(scope.row)">编辑</el-button>
						<el-button size="mini" type="text" @click="handleDelete(scope.row)">删除</el-button>
					</template>
				</el-table-column>
			</el-table>
			<div class="page-container" style="padding: 10px 0;">
				<el-pagination size="mini" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="query.page" :page-sizes="[20, 50, 100, 200,500]" :page-size="query.pagesize" layout="total,sizes,prev,pager,next" :total="total">
				</el-pagination>
			</div>
		</div>
		<div class="form-container" v-else>
			<editProduct :editRow="editRow" :setting="setting" @back="finishedEdit" />
		</div>
	</section>
</template>
<script>
import editProduct from '@/components/editProduct';
export default {
	name: 'role',
	components: { editProduct },
	data() {
		return {
			isEdit: false,
			listLoading: false,
			typeList: [],
			ptypeList: [],
			searchptypeList: [],
			setting: {},
			pList: [],
			crmList: [],
			searchCrmList: [],
			formCrmList: [],
			query: { page: 1, pagesize: 500 },
			gridList: [],
			total: 0,
			dataId: undefined,
			editRow: {},
			searchForm: {
				name: '',
				typeId: '',
				ptypeId: [],
				crmId: [],
				model: '',
				modelNo: '',
				materialNo: ''
			},
		}
	},
	methods: {
		finishedEdit(obj) {
			this.isEdit = false;
			if (obj) {
				let index = _.findIndex(this.gridList, { id: obj.id });
				if (index > -1) {
					this.$set(this.gridList, index, obj)
				} else {
					this.gridList.unshift(obj);
				}
			}
		},
		handleAdd() {
			this.isEdit = !this.isEdit;
			this.editRow = {};
		},
		handleUpdate(row) {
			this.editRow = row;
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
					collectionName: 'product',
					data: { id: row.id }
				};
				this.$axios.$post('mock/db', { data: condition }).then(result => {
					this.$message({
						type: 'success',
						message: '删除成功!'
					});
					let index = _.findIndex(this.gridList, { id: row.id });
					this.gridList.splice(index, 1);
					this.writeFile();
				});
			}).catch();
		},
		parseType(id) {
			if (!id) return '';
			let type = _.find(this.typeList, { 'id': id });
			return type ? type.name : '';
		},
		parsePtype(id) {
			if (!id) return '';
			let type = _.find(this.ptypeList, { 'id': id });
			return type ? type.name : '';
		},
		parseCrm(id) {
			if (!id) return '';
			let crm = _.find(this.crmList, { 'id': id });
			return crm ? crm.name : '';
		},
		filterPtypeBySearch(val) {
			if (val != '') {
				this.searchptypeList = _.filter(this.ptypeList, { typeId: val });
				this.searchCrmList = _.filter(this.crmList, { typeId: val });
			} else {
				this.searchptypeList = _.cloneDeep(this.ptypeList);
				this.searchCrmList = _.cloneDeep(this.crmList);
			}
		},
		async changeIsUse(row) {
			let condition = {
				type: 'updateData',
				collectionName: 'product',
				updateDate: true,
				data: {
					id: row.id,
					isuse: row.isuse
				}
			};
			let result = await this.$axios.$post('mock/db', { data: condition });
			this.writeFile();
		},
		async writeFile() {
			let params = {
				type: 'listData',
				collectionName: 'product',
				data: {}
			}
			let data = await this.$axios.$post('mock/db', { data: params });
			let condition = {
				type: 'updateSetting',
				collectionName: 'product',
				data: data.list
			}
			await this.$axios.$post('mock/db', { data: condition });
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
				type: 'aggregate',//'aggregate' listData,
				collectionName: 'product',
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
					{ $sort: { _id: -1 } },
					{ $skip: (this.query.page - 1) * this.query.pagesize },
					{ $limit: this.query.pagesize }
				]
			};
			if (!_.isEmpty(match)) {
				condition.aggregate.unshift({
					$match: match
				})
			}
			let result = await this.$axios.$post('mock/db', { data: condition });
			//console.log('getLists',result, match);
			this.total = result.total;
			this.gridList = _.orderBy(result.list, ['name', 'crmId'], ['asc']); //result.list;
			this.listLoading = false;
		},
		// 获取已设定的基础数据和元数据
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
				this.typeList = this.setting.type;
				this.ptypeList = this.setting.ptype;
				this.crmList = this.setting.crm;
				this.getList();
				this.filterPtypeBySearch('');
			}
		}
	},
	created() {
		this.getSetting();
	}
}
</script>
<style lang="scss" scoped>
/deep/ .el-table {
	.el-table__row {
		.cell {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}
}
</style>

