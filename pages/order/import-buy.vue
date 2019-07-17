<<<<<<< HEAD
<template>
	<section>
		<div class="page-title">
			<div>
				<span>原始采购订单导入</span>
			</div>
		</div>
		<div class="form-container">
			<div class="upload-container">
				<el-form :inline="true" :model="tableForm" ref="tableForm" size="mini" v-if="sourceData.length">
					<el-form-item label="订单类型：">
						<el-select v-model="tableForm.typeId" placeholder="请选择" clearable @change="filterByForm">
							<el-option v-for="types in setting.type" :key="types.id" :label="types.name"
								:value="types.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="模糊筛选：">
						<el-input v-model="tableForm.keyword" placeholder="请输入关键字" clearable @change="filterByForm" />
					</el-form-item>
					<el-form-item>
						<el-button type="warning" @click="filterByForm" v-if="tableData.length" icon="el-icon-search">查找
						</el-button>
						<el-button type="primary" @click="saveTable" v-if="tableData.length" :loading="uploading"
							icon="my-icon-save">导入订单({{tableData.length}})</el-button>
						<el-button type @click="sourceData=[]" icon="el-icon-refresh">重新上传</el-button>
						<el-button type @click="removeRepeat" v-if="repeatCount">删除重复梯号、项目号的订单(共：{{repeatCount}})
						</el-button>
						<el-button type @click="openDialogNotin=true" v-if="notInList.length"
							:disabled="openDialogNotin">显示无法匹配元数据的订单(共：{{notInList.length}})</el-button>
					</el-form-item>
				</el-form>
				<upload-excel-component v-else size="mini" :on-success="handleSuccess" :before-upload="beforeUpload" />
			</div>
			<div v-if="uploading">正在导入订单中，请等待处理完成...</div>
			<!--批量导入-->
			<div v-if="sourceData.length">
				<el-table size="mini" ref="listTable"
					:data="tableData.slice((queryUpload.page-1)*queryUpload.pagesize, queryUpload.page*queryUpload.pagesize)"
					border highlight-current-row fit stripe max-height="500" v-loading="uploading">
					<el-table-column type="expand">
						<template slot-scope="props">
							<el-row :gutter="20">
								<el-col :span="6">订单类型:{{parseStr(props.row,'typeId')}}</el-col>
								<el-col :span="6">物料号/版本号:{{props.row.materialNo}}</el-col>
								<el-col :span="6">物料名称:{{props.row.productName}}</el-col>
								<el-col :span="6">图号/版本号:{{props.row.caselNo}}</el-col>
								<el-col :span="6" :title="props.row.projectNo">项目号:{{props.row.projectNo}}</el-col>
								<el-col :span="6">项目名称:{{props.row.projectName}}</el-col>
								<el-col :span="6">梯型:{{props.row.model}}</el-col>
								<el-col :span="6">梯号:{{props.row.modelNo}}</el-col>
								<el-col :span="6">数量:{{props.row.count}} {{props.row.util}}</el-col>
								<el-col :span="6">单价:{{props.row.price | currency}}</el-col>
								<el-col :span="6">元数据单价:{{props.row.metaprice | currency}}</el-col>
							</el-row>
						</template>
					</el-table-column>
					<el-table-column label="No." fixed="left" align="center" width="50">
						<template slot-scope="scope">
							<span>{{scope.$index+(queryUpload.page - 1) * queryUpload.pagesize + 1}}</span>
						</template>
					</el-table-column>
					<!--订单数据列表-->
					<el-table-column v-for="item of tableKeys.filter(o=>o.show)" :prop="item.value" :label="item.label"
						:key="item.value" :width="item.width">
						<template slot-scope="scope">
							<div class="row-list" :title="scope.row[item.value]">
								<span>{{parseStr(scope.row,item.value)}}</span>
								<span v-if="item.value==='metaprice'&&!scope.row.notin" style="margin-left:5px;">
									<el-button type="text" icon="el-icon-edit" @click="editPrice(scope.row)" />
								</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" fixed="right" align="center" width="100">
						<template slot-scope="scope">
							<el-button size="mini" type="text" @click="handleDelete(scope.row)">移除</el-button>
							<el-button size="mini" type="text" v-if="scope.row.notin" @click="handleEdit(scope.row)">编辑
							</el-button>
						</template>
					</el-table-column>
				</el-table>
				<div class="page-container" style="padding: 10px 0;">
					<div>查询条件 ->
						<span v-if="tableForm.typeId">订单类型：{{parseStr(tableForm,'typeId')}}；</span>
						<span v-if="tableForm.keyword">模糊查询：{{parseStr(tableForm,'keyword')}}</span>
					</div>
					<el-pagination size="mini" @size-change="uploadSizeChange" @current-change="uploadCurrentChange"
						:current-page.sync="queryUpload.page" :page-sizes="[20, 50, 100, 200, 500]"
						:page-size="queryUpload.pagesize" layout="total,sizes, prev, pager, next" :total="uploadTotal">
					</el-pagination>
				</div>
			</div>
		</div>
		<el-dialog title="无法匹配元数据的订单列表" :visible.sync="openDialogNotin" append-to-body width="60%">
			<el-table size="mini" :data="notInList" border highlight-current-row fit max-height="500">
				<el-table-column label="订单类型" prop="typeId" width="70">
					<template slot-scope="scope">
						<span>{{parseStr(scope.row,'typeId')}}</span>
					</template>
				</el-table-column>
				<el-table-column label="物料描述" prop="productName" />
				<el-table-column label="物料号/版本号" prop="materialNo" width="120" />
				<el-table-column label="梯型" prop="model" width="100" />
				<el-table-column label="梯号" prop="modelNo" width="80" />
				<el-table-column label="项目号" prop="projectNo" width="120">
					<template slot-scope="scope">
						<span :title="scope.row.projectNo">{{scope.row.projectNo}}</span>
					</template>
				</el-table-column>
				<el-table-column label="单价" prop="price" width="100" />
				<el-table-column label="操作" fixed="right" align="center" width="100">
					<template slot-scope="scope">
						<el-button size="mini" type="text" @click="handleEdit(scope.row)" v-if="scope.row.notin">加入产品
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-dialog>
		<el-dialog title="新增产品" :visible.sync="openDialogVisible" append-to-body>
			<editProduct :editRow="editRow" :setting="setting" @back="finishedEdit" />
		</el-dialog>
		<el-dialog title="编辑订单单价" :visible.sync="editDialogVisible" append-to-body width="200px">
			<div>
				<el-input-number size="mini" v-if="editRow" v-model="editRow.metaprice" controls-position="right"
					:min="0" style="width:100%" />
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" @click="editDialogVisible = false">取 消</el-button>
				<el-button size="mini" type="primary" @click="updatePrice">确 定</el-button>
			</span>
		</el-dialog>
	</section>
</template>
<script>
import editProduct from "@/components/editProduct";
import UploadExcelComponent from "@/components/UploadExcel";
export default {
	name: "role",
	components: { editProduct, UploadExcelComponent },
	data() {
		return {
			tableKeys: [
				{ label: "订单类型", value: "typeId", width: 80, show: true },
				{ label: "重复订单", value: "isRepeat", width: 80, show: true },
				{ label: "匹配客户名称", value: "crmName", show: true },
				{ label: "订单编号", value: "sourceserial", show: true },
				{ label: "物料描述", value: "productName", show: true },
				{ label: "物料号/版本号", value: "materialNo", show: true },
				{ label: "项目号", value: "projectNo", show: true },
				{ label: "梯型", value: "model", width: 100 },
				{ label: "梯号", value: "modelNo", width: 60 },
				{ label: "数量", value: "count", width: 50 },
				{ label: "单位", value: "util", width: 50 },
				{ label: "单价", value: "price", width: 80, show: true },
				{ label: "元单价", value: "metaprice", width: 80, show: true },
				{ label: "箱号", value: "boxNo", width: 70 },
				{ label: "制单日期", value: "orderDate", width: 100, show: true },
				{ label: "交货日期", value: "deliveryDate", width: 100, show: true },
				{ label: "图号/版本号", value: "caselNo", width: 120 },
				{ label: "项目名称", value: "projectName", width: 150 },
				{ label: "备注", value: "content", width: 150 }
			],
			uploading: false,
			setting: {},
			typeList: [],
			crmList: [],
			pList: [],
			sourceserialList: [],
			productList: [],
			modelNoList: [],
			serialList: [],
			uploadTotal: 0,
			queryUpload: {
				page: 1,
				pagesize: 100
			},
			lastId: 0,
			lastUploadId: 0,
			tableForm: {
				keyword: "",
				typeId: ""
			},
			openDialogVisible: false,
			editDialogVisible: false,
			editRow: null,
			repeatCount: 0,
			checkOut: 0,
			uploadRepeatCount: 0,
			uploadTable: [],
			sourceData: [],
			tableData: [],
			tableHeader: [],
			openDialogNotin: false,
			notInList: []
		};
	},
	methods: {
		editPrice(row) {
			this.editRow = row;
			this.editDialogVisible = true;
		},
		updatePrice() {
			this.editDialogVisible = false;
			// 更新元数据单价
			let condition = {
				type: 'updateData',
				collectionName: 'product',
				updateDate: true,
				data: {
					id: this.editRow.productId,
					price: this.editRow.metaprice
				}
			};
			this.$axios.$post('mock/db', { data: condition }).then(res => {
				console.log('handleChangePrice', this.editRow, res);
				this.sourceData.forEach(item => {
					if (item.crmId == this.editRow.crmId && item.typeId == this.editRow.typeId && item.materialNo == this.editRow.materialNo) {
						item.metaprice = this.editRow.metaprice;
					}
				});
				//console.log(this.sourceData);
				this.tableData = _.cloneDeep(this.sourceData);
				this.writeFile();
			});
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
		listRowClick(row) {
			row.extend = !row.extend ? true : false;
			this.$refs["listTable"].toggleRowExpansion(row, row.extend);
		},
		parseStr(row, field) {
			switch (field) {
				case "typeId":
					let type = _.find(this.typeList, { id: row[field] });
					return type.name;
				case "orderDate":
					return moment(row[field]).format("YYYY-MM-DD");
				case "deliveryDate":
					return moment(row[field]).format("YYYY-MM-DD");
				default:
					return row[field];
			}
		},
		filterByForm() {
			this.tableData = [];
			let lists = _.cloneDeep(this.sourceData);
			if (this.tableForm.typeId) {
				lists = _.filter(lists, { typeId: this.tableForm.typeId });
			}

			lists.forEach(item => {
				for (let k in item) {
					if (["crmName", "sourceserial", "productName", "materialNo", "projectNo", "model", "modelNo", "boxNo", "caselNo", "projectName"].includes(k) && item[k].includes(this.tableForm.keyword)) {
						let tIndex = _.findIndex(this.tableData, { id: item.id });
						if (!~tIndex) {
							this.tableData.push(item);
						}
					}
				}
			});
			this.uploadTotal = this.tableData.length;
		},
		selectionChange(selection) {
			this.uploadTable = selection;
			this.uploadRepeatCount = 0;
			this.checkOut = 0;
			selection.forEach(item => {
				if (item.isRepeat !== undefined) {
					this.uploadRepeatCount++;
				}
				if (!item["元数据匹配"]) {
					this.checkOut++;
				}
			});
			//console.log("this.uploadRepeatCount", this.uploadRepeatCount, this.checkOut);
		},
		// 新增产品后处理
		finishedEdit(row) {
			if (row) {
				this.productList.push(row);
				let crm = _.find(this.setting.crm, { id: row.crmId });
				// 列出所有匹配的订单（物料号、物料描述、价格、订单类型）一致的订单;
				let lists = _.filter(this.sourceData, {
					materialNo: row.materialNo,
					productName: row.name,
					price: row.price,
					typeId: row.typeId
				});
				lists.forEach(item => {
					item.materialNo = row.materialNo;
					item.productId = row.id;
					item.productName = row.name;
					item.price = row.price;
					item.util = row.util;
					item.metaprice = row.price;
					item.ptypeId = row.ptypeId;
					item.model = row.model;
					item.modelNo = row.modelNo;
					item.crmId = row.crmId;
					item.crmName = crm.name;
					let index = _.findIndex(this.sourceData, { index: item.index });
					if (index > -1) {
						delete item.notin;
						this.$set(this.sourceData, index, item);
					}
					let notIndex = _.findIndex(this.notInList, { index: item.index });
					if (notIndex > -1) {
						this.notInList.splice(notIndex, 1);
					}
				});
				this.tableData = _.cloneDeep(this.sourceData);
			}
			this.openDialogVisible = false;
		},
		// 编辑订单（新建产品数据）
		handleEdit(row) {
			//debugger
			this.editRow = _.cloneDeep(row);
			this.editRow.name = this.editRow.productName;
			delete this.editRow.id,
				delete this.editRow.deliveryDate,
				delete this.editRow.flowStateId,
				delete this.editRow.index,
				delete this.editRow.notin,
				delete this.editRow.orderDate,
				delete this.editRow.projectName,
				delete this.editRow.projectNo,
				delete this.editRow.sourceserial,
				delete this.editRow.productName;
			this.openDialogVisible = true;
		},
		removeRepeat() {
			let list = [];
			this.sourceData.forEach(item => {
				//sourceData
				if (!item["isRepeat"]) {
					list.push(item);
				}
			});
			this.tableForm.crmId = "";
			this.repeatCount = 0;
			this.sourceData = list;
			this.tableData = list;
			this.uploadTotal = list.length;
		},
		// 检查订单梯号是否重复
		checkRepeat(arr) {
			//this.repeatCount = 0;
			let counts = 0;
			arr.forEach(item => {
				if (item.isRepeat !== undefined) {
					counts++;
				}
			});
			this.repeatCount = counts;
		},
		beforeUpload(file) {
			this.tableData = [];
			const isLt1M = file.size / 1024 / 1024 < 1;
			if (isLt1M) {
				this.uploading = true;
				return true;
			}
			this.$message({
				message: "文件大小不能超过1M",
				type: "warning"
			});
			return false;
		},
		handleDelete(row) {
			this.$confirm("确定删除该订单?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				let index = _.findIndex(this.sourceData, { index: row.index });
				this.sourceData.splice(index, 1);
				this.tableData = _.cloneDeep(this.sourceData);
				this.uploadTotal = this.tableData.length;
				this.$message({
					type: "success",
					message: "删除成功!"
				});
			}).catch(() => { });
		},
		checkSerial(index) {
			let now = moment(new Date()).format("YYYY-MM-DD HH:mm");
			now = now.split(" ");
			let dd = now[0].split("-");
			let tt = now[1].split(":");
			let serial = index + "-JH" + dd[0] + "" + dd[1] + "" + dd[2] + "" + tt[0] + "" + tt[1];
			return serial;
		},
		handleSuccess({ results, header }) {
			this.crmList = [];
			this.pList = [];
			// 处理列名
			this.tableHeader = []; //['isMake','isRepeat'];
			this.notInList = [];
			// 重复订单量
			this.uploadRepeatCount = 0;
			let listData = [];
			results.forEach((item, index) => {
				if (item['订单编号']) {
					this.lastUploadId++;
					let obj = {
						index: index + 1,
						id: this.lastUploadId,
						createByUser: this.$store.state.user.name
					};
					for (let k in item) {
						let value = item[k];
						k = k.replace(/(^\s+)|(\s+$)/g, ""); // 去除空格
						let head = _.find(this.tableKeys, { label: k });
						if (head) {
							obj[head.value] = this._setValue(head.value, value);
							//生产订单与采购订单区分
							if (head.value == "productName") {
								if (!value.includes("包装箱") && (value.includes("轿顶防护栏") || value.includes("线槽") || value.includes("挂钩") || value.includes("救援装置柜"))) {
									obj.typeId = 2;
									obj.flowStateId = 5;
								} else {
									obj.typeId = 1;
									obj.flowStateId = 1;
								}
								// 汇总产品
								if (_.findIndex(this.pList, { productName: value }) < 0) {
									this.pList.push({ productName: value });
								}
							}
							// 汇总订单号
							if (head.value == "sourceserial") {
								obj.dserial = value;
								if (_.findIndex(this.sourceserialList, { sourceserial: value }) < 0) {
									this.sourceserialList.push({ sourceserial: value });
								}
							}
							if (head.value == "projectNo") {
								obj.dprojectNo = value;
							}
							if (head.value == "modelNo") {
								obj.dmodelNo = value;
							}
						}
					}
					// 匹配产品分类和产品ID
					let product = _.find(this.productList, {
						name: obj.productName,
						materialNo: obj.materialNo,
						typeId: obj.typeId
					});
					//debugger
					if (product) {
						let crm = _.find(this.setting.crm, { id: product.crmId });
						if (crm) {
							if (_.findIndex(this.crmList, { id: product.crmId }) < 0) {
								this.crmList.push(crm);
							}
							obj = _.merge(obj, {
								metaprice: product.price,
								productId: product.id,
								ptypeId: product.ptypeId,
								crmId: product.crmId,
								crmName: crm.name
							});
						} else {
							obj.notin = true;
							this.notInList.push(obj);
						}

					} else {
						obj.notin = true;
						this.notInList.push(obj);
					}
					// 检查重复订单 notInList
					if (this.checkModelNo(obj)) {
						obj.isRepeat = "是";
						this.uploadRepeatCount += 1;
					}
					listData.push(obj);
				}
			});
			//console.log("this.sourceserialList", this.sourceserialList);
			this.sourceData = _.orderBy(listData, ["typeId", "deliveryDate"], ["asc", "asc"]);
			this.tableData = _.cloneDeep(this.sourceData);
			this.uploadTotal = this.sourceData.length;
			this.uploading = false;
		},
		checkModelNo(row) {
            if (_.find(this.modelNoList, { sourceserial: row.sourceserial, deliveryDate: row.deliveryDate, materialNo: row.materialNo })) {
                debugger
				return true;
			}
			return false;
		},
		uploadSizeChange(val) {
			this.queryUpload.pagesize = val;
		},
		uploadCurrentChange(val) {
			this.queryUpload.page = val;
		},
		saveTable() {
			if (this.uploadRepeatCount > 0) {
				this.$alert("有" + this.uploadRepeatCount + "个重复的订单、物料、交货日期的订单，请清理后再提交保存！");
				return;
			}
			// 检查订单的完善
			let checkNotIn = _.filter(this.sourceData, { notin: true });
			if (checkNotIn.length) {
				this.$alert("提交订单中有" + checkNotIn.length + "个无法匹配元数据的产品，请处理后再提交保存！");
				return;
			}
			this.$confirm("确定导入订单?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				this.saveData();
			}).catch(() => { });
		},
		_setValue(key, value) {
			switch (key) {
				case "count":
					return Number(value);
				case "price":
					return Number(value);
				case "orderDate":
					return new Date(value).getTime();
				case "deliveryDate":
					return new Date(value).getTime();
				default:
					return _.trim(String(value));
			}
		},
		parseSource(datas) {
			let list = datas.map(item => {
				delete item.index, delete item.metaprice;
				return item;
			});
			return list;
		},
		async saveData() {
			//this.uploading = true;
			let loadingMask = this.$loading({ background: "rgba(0, 0, 0, 0.5)" });
			// 梳理数据做合并订单处理
			let dataList = [], index = 0;
			this.tableData.forEach(item => {
				this.lastId++;
				index++;
				item.id = this.lastId;
				item.serial = this.checkSerial(index);
				if (/^91/.test(item.sourceserial)) { // 是否为售后类型
					item.business = 1;
				} else if (/^45/.test(item.sourceserial)) {
					item.business = 2;
				}
				delete item.index;
				dataList.push(item);
			});

			let condition = {
				type: "addPatch",
				collectionName: "order",
				notNotice: true,
				data: dataList
			};
			let epList = dataList.filter(o => {
				return o.id === '' || !o.id || !o.crmId;
			})
			//debugger
			if (epList.length) {
				loadingMask.close();
				this.$message.error('数据解析出问题了，请联系管理员');
				return
			}
			// 订单保存
			this.$axios.$post("mock/db", { data: condition }).then(result => {
				loadingMask.close();
				//this.uploading = false;
				window.location.reload();
			});
		},
		// 获取10天内所有已经导入的订单列表,列出物料号，交货日期,校验是否重复
		async getModelNoList(match = {}) {
			//let now = new Date();
			let sd = new Date(new Date().setDate(new Date().getDate() - 20));
			let ed = new Date(new Date().setDate(new Date().getDate() + 1));
			let params = {
				type: "getColumns",
				collectionName: "order",
				condition: {
					flowStateId: { $lt: 10 },
					updateDate: { $gte: sd.getTime(), $lte: ed.getTime() }
				},
				cols: {
					productName: 1,
					crmId: 1,
					sourceserial: 1,
					projectNo: 1,
					materialNo: 1,
					deliveryDate: 1
				}
			};
            let result = await this.$axios.$post("mock/db", { data: params });
            console.log('getModelNoList', result)
			this.modelNoList = result;
		},
		async _getLastId() {
			let condition = {
				type: "getId",
				data: {
					model: "order"
				}
			};
			let result = await this.$axios.$post("mock/db", { data: condition });
			if (result) {
				//console.log("lastId", result);
				this.lastId = result;
			}
			let uploadCondition = {
				type: "getId",
				data: {
					model: "orderUpload"
				}
			};
			let uploadResult = await this.$axios.$post("mock/db", {
				data: uploadCondition
			});
			if (uploadResult) {
				//console.log("lastUploadId", uploadResult);
				this.lastUploadId = uploadResult;
			}
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
				this.typeList = this.setting.type;
				this.productList = this.setting.product;
				//this.crmList = _.clone(this.setting.crm);
				this.getModelNoList();
			}
		}
	},
	created() {
		this.getSetting();
		this._getLastId();
	},
	mounted() { }
};
</script>

<style lang="scss" scoped>
.upload-container {
	display: flex;
	align-item: center;
}
.page-container {
	display: flex;
	align-items: center;
	justify-content: space-between;
}

.row-list {
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	&.warning {
		color: red;
	}
}
/deep/ .el-table {
	.cell {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		> i {
			font-size: 14px;
			color: #eee;
			margin-right: 5px;
			&.payed {
				color: green;
			}
		}
		.el-button {
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			max-width: 100%;
		}
	}
	.warning {
		color: red;
	}
	/deep/ .el-table__expanded-cell {
		padding: 20px;
		.el-row {
			border-bottom: 1px solid #ddd;
			&:last-child {
				border: 0;
			}

			.el-col {
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
				line-height: 25px;

				> span {
					&:first-child {
						width: 80px;
						display: inline-block;
						font-weight: bold;
					}
				}
			}
		}
		.el-form-item {
			width: 32%;
			margin: 0;
			.el-form-item__label {
				font-weight: bold;
			}
		}
	}
}
</style>

=======
<template>
	<section>
		<div class="page-title">
			<div>
				<span>原始采购订单导入</span>
			</div>
		</div>
		<div class="form-container">
			<div class="upload-container">
				<el-form :inline="true" :model="tableForm" ref="tableForm" size="mini" v-if="sourceData.length">
					<el-form-item label="订单类型：">
						<el-select v-model="tableForm.typeId" placeholder="请选择" clearable @change="filterByForm">
							<el-option v-for="types in setting.type" :key="types.id" :label="types.name" :value="types.id" />
						</el-select>
					</el-form-item>
					<el-form-item label="模糊筛选：">
						<el-input v-model="tableForm.keyword" placeholder="请输入关键字" clearable @change="filterByForm" />
					</el-form-item>
					<el-form-item>
						<el-button type="warning" @click="filterByForm" v-if="tableData.length" icon="el-icon-search">查找</el-button>
						<el-button type="primary" @click="saveTable" v-if="tableData.length" :loading="uploading" icon="my-icon-save">导入订单({{tableData.length}})</el-button>
						<el-button type @click="sourceData=[]" icon="el-icon-refresh">重新上传</el-button>
						<el-button type @click="removeRepeat" v-if="repeatCount">删除重复梯号、项目号的订单(共：{{repeatCount}})</el-button>
						<el-button type @click="openDialogNotin=true" v-if="notInList.length" :disabled="openDialogNotin">显示无法匹配元数据的订单(共：{{notInList.length}})</el-button>
					</el-form-item>
				</el-form>
				<upload-excel-component v-else size="mini" :on-success="handleSuccess" :before-upload="beforeUpload" />
			</div>
			<div v-if="uploading">正在导入订单中，请等待处理完成...</div>
			<!--批量导入-->
			<div v-if="sourceData.length">
				<el-table size="mini" ref="listTable" :data="tableData.slice((queryUpload.page-1)*queryUpload.pagesize, queryUpload.page*queryUpload.pagesize)" border highlight-current-row fit stripe max-height="500" v-loading="uploading">
					<el-table-column type="expand">
						<template slot-scope="props">
							<el-row :gutter="20">
								<el-col :span="6">订单类型:{{parseStr(props.row,'typeId')}}</el-col>
								<el-col :span="6">物料号/版本号:{{props.row.materialNo}}</el-col>
								<el-col :span="6">物料名称:{{props.row.productName}}</el-col>
								<el-col :span="6">图号/版本号:{{props.row.caselNo}}</el-col>
								<el-col :span="6" :title="props.row.projectNo">项目号:{{props.row.projectNo}}</el-col>
								<el-col :span="6">项目名称:{{props.row.projectName}}</el-col>
								<el-col :span="6">梯型:{{props.row.model}}</el-col>
								<el-col :span="6">梯号:{{props.row.modelNo}}</el-col>
								<el-col :span="6">数量:{{props.row.count}} {{props.row.util}}</el-col>
								<el-col :span="6">单价:{{props.row.price | currency}}</el-col>
								<el-col :span="6">元数据单价:{{props.row.metaprice | currency}}</el-col>
							</el-row>
						</template>
					</el-table-column>
					<el-table-column label="No." fixed="left" align="center" width="50">
						<template slot-scope="scope">
							<span>{{scope.$index+(queryUpload.page - 1) * queryUpload.pagesize + 1}}</span>
						</template>
					</el-table-column>
					<!--订单数据列表-->
					<el-table-column v-for="item of tableKeys.filter(o=>o.show)" :prop="item.value" :label="item.label" :key="item.value" :width="item.width">
						<template slot-scope="scope">
							<div class="row-list" :title="scope.row[item.value]">
								<span>{{parseStr(scope.row,item.value)}}</span>
								<span v-if="item.value==='metaprice'&&!scope.row.notin" style="margin-left:5px;">
									<el-button type="text" icon="el-icon-edit" @click="editPrice(scope.row)"/>
								</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" fixed="right" align="center" width="100">
						<template slot-scope="scope">
							<el-button size="mini" type="text" @click="handleDelete(scope.row)">移除</el-button>
							<el-button size="mini" type="text" v-if="scope.row.notin" @click="handleEdit(scope.row)">编辑</el-button>
						</template>
					</el-table-column>
				</el-table>
				<div class="page-container" style="padding: 10px 0;">
					<div>查询条件 ->
						<span v-if="tableForm.typeId">订单类型：{{parseStr(tableForm,'typeId')}}；</span>
						<span v-if="tableForm.keyword">模糊查询：{{parseStr(tableForm,'keyword')}}</span>
					</div>
					<el-pagination size="mini" @size-change="uploadSizeChange" @current-change="uploadCurrentChange" :current-page.sync="queryUpload.page" :page-sizes="[20, 50, 100, 200, 500]" :page-size="queryUpload.pagesize" layout="total,sizes, prev, pager, next" :total="uploadTotal"></el-pagination>
				</div>
			</div>
		</div>
		<el-dialog title="无法匹配元数据的订单列表" :visible.sync="openDialogNotin" append-to-body width="60%">
			<el-table size="mini" :data="notInList" border highlight-current-row fit max-height="500">
				<el-table-column label="订单类型" prop="typeId" width="70">
					<template slot-scope="scope">
						<span>{{parseStr(scope.row,'typeId')}}</span>
					</template>
				</el-table-column>
				<el-table-column label="物料描述" prop="productName" />
				<el-table-column label="物料号/版本号" prop="materialNo" width="120" />
				<el-table-column label="梯型" prop="model" width="100" />
				<el-table-column label="梯号" prop="modelNo" width="80" />
				<el-table-column label="项目号" prop="projectNo" width="120">
					<template slot-scope="scope">
						<span :title="scope.row.projectNo">{{scope.row.projectNo}}</span>
					</template>
				</el-table-column>
				<el-table-column label="单价" prop="price" width="100" />
				<el-table-column label="操作" fixed="right" align="center" width="100">
					<template slot-scope="scope">
						<el-button size="mini" type="text" @click="handleEdit(scope.row)" v-if="scope.row.notin">加入产品</el-button>
					</template>
				</el-table-column>
			</el-table>
		</el-dialog>
		<el-dialog title="新增产品" :visible.sync="openDialogVisible" append-to-body>
			<editProduct :editRow="editRow" :setting="setting" @back="finishedEdit" />
		</el-dialog>
		<el-dialog title="编辑订单单价" :visible.sync="editDialogVisible" append-to-body width="200px">
			<div>
				<el-input-number size="mini" v-if="editRow" v-model="editRow.metaprice" controls-position="right" :min="0" style="width:100%"/>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button size="mini" @click="editDialogVisible = false">取 消</el-button>
				<el-button size="mini" type="primary" @click="updatePrice">确 定</el-button>
			</span>
		</el-dialog>
	</section>
</template>
<script>
import editProduct from "@/components/editProduct";
import UploadExcelComponent from "@/components/UploadExcel";
export default {
	name: "role",
	components: { editProduct, UploadExcelComponent },
	data() {
		return {
			tableKeys: [
				{ label: "订单类型", value: "typeId", width: 80, show: true },
				{ label: "重复订单", value: "isRepeat", width: 80, show: true },
				{ label: "匹配客户名称", value: "crmName", show: true },
				{ label: "订单编号", value: "sourceserial", show: true },
				{ label: "物料描述", value: "productName", show: true },
				{ label: "物料号/版本号", value: "materialNo", show: true },
				{ label: "项目号", value: "projectNo", show: true },
				{ label: "梯型", value: "model", width: 100 },
				{ label: "梯号", value: "modelNo", width: 60 },
				{ label: "数量", value: "count", width: 50 },
				{ label: "单位", value: "util", width: 50 },
				{ label: "单价", value: "price", width: 80, show: true },
				{ label: "元单价", value: "metaprice", width: 80, show: true },
				{ label: "箱号", value: "boxNo", width: 70 },
				{ label: "制单日期", value: "orderDate", width: 100, show: true },
				{ label: "交货日期", value: "deliveryDate", width: 100, show: true },
				{ label: "图号/版本号", value: "caselNo", width: 120 },
				{ label: "项目名称", value: "projectName", width: 150 },
				{ label: "备注", value: "content", width: 150 }
			],
			uploading: false,
			setting: {},
			typeList: [],
			crmList: [],
			pList: [],
			sourceserialList: [],
			productList: [],
			modelNoList: [],
			serialList: [],
			uploadTotal: 0,
			queryUpload: {
				page: 1,
				pagesize: 100
			},
			lastId: 0,
			lastUploadId: 0,
			tableForm: {
				keyword: "",
				typeId: ""
			},
			openDialogVisible: false,
			editDialogVisible: false,
			editRow: null,
			repeatCount: 0,
			checkOut: 0,
			uploadRepeatCount: 0,
			uploadTable: [],
			sourceData: [],
			tableData: [],
			tableHeader: [],
			openDialogNotin: false,
			notInList: []
		};
	},
	methods: {
		editPrice(row){
			this.editRow = row;
			this.editDialogVisible = true;
		},
		updatePrice(){
			this.editDialogVisible = false;
			// 更新元数据单价
			let condition = {
				type: 'updateData',
				collectionName: 'product',
				updateDate: true,
				data: {
					id: this.editRow.productId,
					price: this.editRow.metaprice
				}
			};
			this.$axios.$post('mock/db', { data: condition }).then(res=>{
				console.log('handleChangePrice', this.editRow, res);
				this.sourceData.forEach(item=>{
					if(item.crmId == this.editRow.crmId && item.typeId == this.editRow.typeId && item.materialNo == this.editRow.materialNo){
						item.metaprice = this.editRow.metaprice;
					}
				});
				//console.log(this.sourceData);
				this.tableData = _.cloneDeep(this.sourceData);
				this.writeFile();
			});
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
		listRowClick(row) {
			row.extend = !row.extend ? true : false;
			this.$refs["listTable"].toggleRowExpansion(row, row.extend);
		},
		parseStr(row, field) {
			switch (field) {
				case "typeId":
					let type = _.find(this.typeList, { id: row[field] });
					return type.name;
				case "orderDate":
					return moment(row[field]).format("YYYY-MM-DD");
				case "deliveryDate":
					return moment(row[field]).format("YYYY-MM-DD");
				default:
					return row[field];
			}
		},
		filterByForm() {
			this.tableData = [];
			let lists = _.cloneDeep(this.sourceData);
			if (this.tableForm.typeId) {
				lists = _.filter(lists, { typeId: this.tableForm.typeId });
			}

			lists.forEach(item => {
				for (let k in item) {
					if (["crmName", "sourceserial", "productName", "materialNo", "projectNo", "model", "modelNo", "boxNo", "caselNo", "projectName"].includes(k) && item[k].includes(this.tableForm.keyword)) {
						let tIndex = _.findIndex(this.tableData, { id: item.id });
						if (!~tIndex) {
							this.tableData.push(item);
						}
					}
				}
			});
			this.uploadTotal = this.tableData.length;
		},
		selectionChange(selection) {
			this.uploadTable = selection;
			this.uploadRepeatCount = 0;
			this.checkOut = 0;
			selection.forEach(item => {
				if (item.isRepeat !== undefined) {
					this.uploadRepeatCount++;
				}
				if (!item["元数据匹配"]) {
					this.checkOut++;
				}
			});
			//console.log("this.uploadRepeatCount", this.uploadRepeatCount, this.checkOut);
		},
		// 新增产品后处理
		finishedEdit(row) {
			if (row) {
				this.productList.push(row);
				let crm = _.find(this.setting.crm, { id: row.crmId });
				// 列出所有匹配的订单（物料号、物料描述、价格、订单类型）一致的订单;
				let lists = _.filter(this.sourceData, {
					materialNo: row.materialNo,
					productName: row.name,
					price: row.price,
					typeId: row.typeId
				});
				lists.forEach(item => {
					item.materialNo = row.materialNo;
					item.productId = row.id;
					item.productName = row.name;
					item.price = row.price;
					item.util = row.util;
					item.metaprice = row.price;
					item.ptypeId = row.ptypeId;
					item.model = row.model;
					item.modelNo = row.modelNo;
					item.crmId = row.crmId;
					item.crmName = crm.name;
					let index = _.findIndex(this.sourceData, { index: item.index });
					if (index > -1) {
						delete item.notin;
						this.$set(this.sourceData, index, item);
					}
					let notIndex = _.findIndex(this.notInList, { index: item.index });
					if (notIndex > -1) {
						this.notInList.splice(notIndex, 1);
					}
				});
				this.tableData = _.cloneDeep(this.sourceData);
			}
			this.openDialogVisible = false;
		},
		// 编辑订单（新建产品数据）
		handleEdit(row) {
			//debugger
			this.editRow = _.cloneDeep(row);
			this.editRow.name = this.editRow.productName;
			delete this.editRow.id,
				delete this.editRow.deliveryDate,
				delete this.editRow.flowStateId,
				delete this.editRow.index,
				delete this.editRow.notin,
				delete this.editRow.orderDate,
				delete this.editRow.projectName,
				delete this.editRow.projectNo,
				delete this.editRow.sourceserial,
				delete this.editRow.productName;
			this.openDialogVisible = true;
		},
		removeRepeat() {
			let list = [];
			this.sourceData.forEach(item => {
				//sourceData
				if (!item["isRepeat"]) {
					list.push(item);
				}
			});
			this.tableForm.crmId = "";
			this.repeatCount = 0;
			this.sourceData = list;
			this.tableData = list;
			this.uploadTotal = list.length;
		},
		// 检查订单梯号是否重复
		checkRepeat(arr) {
			//this.repeatCount = 0;
			let counts = 0;
			arr.forEach(item => {
				if (item.isRepeat !== undefined) {
					counts++;
				}
			});
			this.repeatCount = counts;
		},
		beforeUpload(file) {
			this.tableData = [];
			const isLt1M = file.size / 1024 / 1024 < 1;
			if (isLt1M) {
				this.uploading = true;
				return true;
			}
			this.$message({
				message: "文件大小不能超过1M",
				type: "warning"
			});
			return false;
		},
		handleDelete(row) {
			this.$confirm("确定删除该订单?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			})
				.then(() => {
					let index = _.findIndex(this.sourceData, { index: row.index });
					this.sourceData.splice(index, 1);
					this.tableData = _.cloneDeep(this.sourceData);
					this.uploadTotal = this.tableData.length;
					this.$message({
						type: "success",
						message: "删除成功!"
					});
				})
				.catch(() => { });
		},
		checkSerial(index) {
			let now = moment(new Date()).format("YYYY-MM-DD HH:mm");
			now = now.split(" ");
			let dd = now[0].split("-");
			let tt = now[1].split(":");
			let serial = index + "-JH" + dd[0] + "" + dd[1] + "" + dd[2] + "" + tt[0] + "" + tt[1];
			return serial;
		},
		handleSuccess({ results, header }) {
			this.crmList = [];
			this.pList = [];
			// 处理列名
			this.tableHeader = []; //['isMake','isRepeat'];
			this.notInList = [];
			// 重复订单量
			this.uploadRepeatCount = 0;
			let listData = [];
			results.forEach((item, index) => {
				if(item['订单编号']){
					this.lastUploadId++;
					let obj = {
						index: index + 1,
						id: this.lastUploadId,
						createByUser: this.$store.state.user.name
					};
					for (let k in item) {
						let value = item[k];
						k = k.replace(/(^\s+)|(\s+$)/g, ""); // 去除空格
						let head = _.find(this.tableKeys, { label: k });
						if (head) {
							obj[head.value] = this._setValue(head.value, value);
							//生产订单与采购订单区分
							if (head.value == "productName") {
								if (!value.includes("包装箱") && (value.includes("轿顶防护栏") || value.includes("线槽") || value.includes("挂钩") || value.includes("救援装置柜"))) {
									obj.typeId = 2;
									obj.flowStateId = 5;
								} else {
									obj.typeId = 1;
									obj.flowStateId = 1;
								}
								// 汇总产品
								if (_.findIndex(this.pList, { productName: value }) < 0) {
									this.pList.push({ productName: value });
								}
							}
							// 汇总订单号
							if (head.value == "sourceserial") {
								obj.dserial = value;
								if (_.findIndex(this.sourceserialList, { sourceserial: value }) < 0) {
									this.sourceserialList.push({ sourceserial: value });
								}
							}
							if (head.value == "projectNo") {
								obj.dprojectNo = value;
							}
							if (head.value == "modelNo") {
								obj.dmodelNo = value;
							}
						}
					}
					// 匹配产品分类和产品ID
					let product = _.find(this.productList, {
						name: obj.productName,
                        materialNo: obj.materialNo,
                        //modelNo:obj.modelNo,
						typeId: obj.typeId
					});
					//debugger
					if (product) {
						let crm = _.find(this.setting.crm, { id: product.crmId });
						if(crm){
							if (_.findIndex(this.crmList, { id: product.crmId }) < 0) {
								this.crmList.push(crm);
							}
							obj = _.merge(obj, {
								metaprice: product.price,
								productId: product.id,
								ptypeId: product.ptypeId,
								crmId: product.crmId,
								crmName: crm.name
							});
						}else{
							obj.notin = true;
							this.notInList.push(obj);
						}

					} else {
						obj.notin = true;
						this.notInList.push(obj);
					}
					// 检查重复订单 notInList
					if (this.checkModelNo(obj)) {
						obj.isRepeat = "是";
						this.uploadRepeatCount += 1;
					}
					listData.push(obj);
				}
			});
			//console.log("this.sourceserialList", this.sourceserialList);
			this.sourceData = _.orderBy(listData, ["typeId", "deliveryDate"], ["asc", "asc"]);
			this.tableData = _.cloneDeep(this.sourceData);
			this.uploadTotal = this.sourceData.length;
			this.uploading = false;
		},
		checkModelNo(row) {
			if (_.find(this.modelNoList, {sourceserial: row.sourceserial, deliveryDate: row.deliveryDate, materialNo: row.materialNo})) {
				return true;
			}
			return false;
		},
		uploadSizeChange(val) {
			this.queryUpload.pagesize = val;
		},
		uploadCurrentChange(val) {
			this.queryUpload.page = val;
		},
		saveTable() {
			if (this.uploadRepeatCount > 0) {
				this.$alert("有" + this.uploadRepeatCount + "个重复的梯号和项目号的订单，请清理后再提交保存！");
				return;
			}
			// 检查订单的完善
			let checkNotIn = _.filter(this.sourceData, { notin: true });
			if (checkNotIn.length) {
				this.$alert("提交订单中有" + checkNotIn.length + "个无法匹配元数据的产品，请处理后再提交保存！");
				return;
			}
			this.$confirm("确定导入订单?", "提示", {
				confirmButtonText: "确定",
				cancelButtonText: "取消",
				type: "warning"
			}).then(() => {
				this.saveData();
			}).catch(() => { });
		},
		_setValue(key, value) {
			switch (key) {
				case "count":
					return Number(value);
				case "price":
					return Number(value);
				case "orderDate":
					return new Date(value).getTime();
				case "deliveryDate":
					return new Date(value).getTime();
				default:
					return _.trim(String(value));
			}
		},
		parseSource(datas) {
			let list = datas.map(item => {
				delete item.index, delete item.metaprice;
				return item;
			});
			return list;
		},
		async saveData() {
			//this.uploading = true;
			let loadingMask = this.$loading({ background: "rgba(0, 0, 0, 0.5)" });
			// 梳理数据做合并订单处理
			let dataList = [], index = 0;
			this.tableData.forEach(item => {
				this.lastId++;
				index++;
				item.id = this.lastId;
                item.serial = this.checkSerial(index);
                if(/^91/.test(item.sourceserial)){ // 是否为售后类型
                    item.business = 1;
                }else if(/^45/.test(item.sourceserial)){
                    item.business = 2;
                }
				delete item.index;
				dataList.push(item);
			});

			let condition = {
				type: "addPatch",
				collectionName: "order",
				notNotice: true,
				data: dataList
            };
            let epList = dataList.filter(o=>{
                return o.id === '' || !o.id || !o.crmId;
            })
            //debugger
            if(epList.length){
                loadingMask.close();
                this.$message.error('数据解析出问题了，请联系管理员');
                return
            }
			// 订单保存
			this.$axios.$post("mock/db", { data: condition }).then(result => {
				loadingMask.close();
				//this.uploading = false;
				window.location.reload();
			});
		},
		// 获取10天内所有已经导入的订单列表,列出物料号，交货日期,校验是否重复
		async getModelNoList(match = {}) {
			//let now = new Date();
			let sd = new Date(new Date().setDate(new Date().getDate() - 9));
			let ed = new Date(new Date().setDate(new Date().getDate() + 1));
			let params = {
				type: "getColumns",
				collectionName: "order",
				condition: {
					updateDate: { $gte: sd.getTime(), $lte: ed.getTime() }
				},
				cols: {
					productName: 1,
					crmId: 1,
					sourceserial: 1,
					projectNo: 1,
					materialNo: 1,
					deliveryDate: 1
				}
			};
			let result = await this.$axios.$post("mock/db", { data: params });
			//console.log("getModelNoList", result);
			this.modelNoList = result;
		},
		async _getLastId() {
			let condition = {
				type: "getId",
				data: {
					model: "order"
				}
			};
			let result = await this.$axios.$post("mock/db", { data: condition });
			if (result) {
				//console.log("lastId", result);
				this.lastId = result;
			}
			let uploadCondition = {
				type: "getId",
				data: {
					model: "orderUpload"
				}
			};
			let uploadResult = await this.$axios.$post("mock/db", {
				data: uploadCondition
			});
			if (uploadResult) {
				//console.log("lastUploadId", uploadResult);
				this.lastUploadId = uploadResult;
			}
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
				this.typeList = this.setting.type;
				this.productList = this.setting.product;
				//this.crmList = _.clone(this.setting.crm);
				this.getModelNoList();
			}
		}
	},
	created() {
		this.getSetting();
		this._getLastId();
	},
	mounted() { }
};
</script>

<style lang="scss" scoped>
.upload-container {
  display: flex;
  align-item: center;
}
.page-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.row-list {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  &.warning {
    color: red;
  }
}
/deep/ .el-table {
  .cell {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    > i {
      font-size: 14px;
      color: #eee;
      margin-right: 5px;
      &.payed {
        color: green;
      }
    }
    .el-button {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
    }
  }
  .warning {
    color: red;
  }
  /deep/ .el-table__expanded-cell {
    padding: 20px;
    .el-row {
      border-bottom: 1px solid #ddd;
      &:last-child {
        border: 0;
      }

      .el-col {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        line-height: 25px;

        > span {
          &:first-child {
            width: 80px;
            display: inline-block;
            font-weight: bold;
          }
        }
      }
    }
    .el-form-item {
      width: 32%;
      margin: 0;
      .el-form-item__label {
        font-weight: bold;
      }
    }
  }
}
</style>

>>>>>>> 96229637a28dbc57d9f0dff1bdf2ca241d6b8a51
