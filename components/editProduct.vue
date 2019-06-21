<template>
  <section>
    <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="120px" size="mini">
      <el-form-item label="业务分类" prop="typeId">
          <el-radio-group v-model="ruleForm.typeId" @change="filterPtype">
              <el-radio v-for="(type,idx) in setting.type" :label="type.id" :key="idx">
                  {{type.name}}
              </el-radio>
          </el-radio-group>
      </el-form-item>
      <el-form-item label="产品分类" prop="ptypeId">
          <el-select v-model="ruleForm.ptypeId" placeholder="请选择" style="width:200px">
              <el-option v-for="ptype in pList" :key="ptype.id" :label="ptype.name" :value="ptype.id"/>
          </el-select>
      </el-form-item>
      <el-form-item label="产品名称" prop="name">
          <el-input v-model="ruleForm.name" style="width:200px"/>
      </el-form-item>
      <el-form-item label="关联客户" prop="crmId">
          <el-select v-model="ruleForm.crmId" placeholder="请选择" style="width:200px">
              <el-option v-for="crm in formCrmList" :key="crm.id" :label="crm.name" :value="crm.id"/>
          </el-select>
      </el-form-item>

      <el-form-item label="规格/梯型" prop="model">
          <el-input v-model="ruleForm.model" style="width:200px"/>
      </el-form-item>
      <el-form-item label="型号/梯号" prop="modelNo">
          <el-input v-model="ruleForm.modelNo" style="width:200px"/>
      </el-form-item>
      <el-form-item label="父级物料号" prop="parentMater">
          <el-select v-model="ruleForm.parentMater" filterable clearable placeholder="父级物料号" style="width:200px">
              <el-option v-for="s in materialNoList" :key="s" :value="s" :label="s"/>
          </el-select>
          <span>* 如属套件内，请选择已有的父级物料号,否则请直接输入</span>
      </el-form-item>
      <el-form-item label="物料号/版本号" prop="materialNo">
          <el-input placeholder="请输入物料号" v-model="ruleForm.materialNo" style="width:200px"/>
      </el-form-item>
      <el-form-item label="图号/版本号" prop="caselNo">
          <el-input v-model="ruleForm.caselNo" style="width:200px"/>
      </el-form-item>
        <el-form-item label="单位" prop="util">
          <el-input v-model="ruleForm.util"  style="width:120px"/>
      </el-form-item>
      <el-form-item label="单价" prop="price">
          <el-input v-model="ruleForm.price" style="width:150px">
              <template slot="append">
                  <span>元</span>
              </template>
          </el-input>
      </el-form-item>
      <el-form-item label="备注说明" prop="content">
          <el-input v-model="ruleForm.content" type="textarea" :autosize="{ minRows: 3, maxRows: 10}" placeholder="请输入内容"></el-input>
      </el-form-item>
      <el-form-item>
          <el-button type="primary" size="medium" @click.stop="submitForm" :loading="loadingSave" :disabled="loadingSave">{{!loadingSave?'提交保存':'正在保存数据...'}}</el-button>
          <el-button type="infor" size="medium" @click.stop="$emit('back')" :disabled="loadingSave">取消返回</el-button>
          <span v-if="loadingSave">提交后，请等待完成...</span>
      </el-form-item>
    </el-form>
  </section>
</template>

<script>
  const formObj = {
    typeId:'',
    ptypeId:'',
    crmId:'',
    name:'',
    model:'',
    modelNo:'',
    parentMater:'',
    materialNo:'',
    caselNo:'',
    util:'',
    price:'',
    content:''
  }
  export default {
    name:'edit-product',
    props:{
      setting:{
        type:Object,
        required:true,
        default:()=>{}
      },
      editRow:{
        type:Object,
        required:true,
        default:()=>{}
      }
    },
    data(){
      return {
        isEdit:false,
        materialNoList:[],
        dataId:undefined,
        ptypeList:[],
        typeList:[],
        pList:[],
        formCrmList:[],
        loadingSave:false,
        ruleForm:formObj,
        rules:{
            typeId: [
              { required: true, message: '请选择业务分类', trigger: 'change'},
            ],
            ptypeId: [
              { required: true, message: '请选择产品分类', trigger: 'change'},
            ],
            crmId: [
              { required: true, message: '请选择客户', trigger: 'change'},
            ],
            name: [
              { required: true, message: '请输入产品名称', trigger: 'blur'},
            ],
            util: [
              { required: true, message: '请输入单位', trigger: 'blur'},
            ],
            price: [
              { required: true, message: '请输入单价', trigger: 'blur'},
            ]
        }
      }
    },
    watch:{

      editRow:{
        handler(newObj) {
          this.setItem();
        },
        immediate: true
      }
    },
    methods:{
      setItem(){
        //debugger
        this.ruleForm = _.merge({...formObj}, this.editRow);
        if(this.ruleForm.productName){
          this.$set(this.ruleForm,'name', this.ruleForm.productName);
        }
        if(this.ruleForm.typeId != ''){
          delete this.ruleForm._id,delete this.ruleForm.__v;
          this.dataId = this.ruleForm.id;
          //this.pList = _.filter(this.ptypeList,{typeId:this.ruleForm.typeId});
          this.filterPtype(this.ruleForm.typeId, true);
        }
        this.getSetting();
      },
      filterPtype(val, flag){
        if(!flag){
          this.ruleForm.ptypeId = '';
          this.ruleForm.crmId = '';
        }
        if(val != ''){
          this.pList = _.filter(this.setting.ptype,{typeId:val});
          this.filterCrm(val);
        }else{
          this.pList = _.cloneDeep(this.setting.ptype);
        }
      },
      filterCrm(typeId){
        this.formCrmList = _.filter(this.setting.crm,{typeId:typeId});
      },
      submitForm(){
        this.$refs['ruleForm'].validate((valid) => {
          if(valid) {
            this.loadingSave = true;
            let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
            let condition = {
              type:'addData',
              collectionName: 'product',
              data:{...this.ruleForm}
            };
            if(this.dataId){
              condition.type = 'updateData';
              condition.data.id = this.dataId;
              condition.updateDate = true;
            }
            this.$axios.$post('mock/db', {data:condition}).then(result=>{
              loadingMask.close();
              //console.log(condition.data);
              //console.log(result);
              this.writeFile();
              this.filterPtype('');
              if(!this.dataId){
                this.$emit('back', result);
              }else{
                this.$emit('back', condition.data);
              }
              this.loadingSave = false;
              this.dataId = undefined;
            });
          }
        });
      },
      async writeFile(){
        let params = {
          type:'listData',
          collectionName: 'product',
          data:{}
        }
        let data = await this.$axios.$post('mock/db', {data:params});
        let condition = {
          type:'updateSetting',
          collectionName: 'product',
          data:data.list
        }
        await this.$axios.$post('mock/db', {data:condition});
      },
      // 获取已设定的基础数据和元数据
      getSetting(){
        /* this.typeList = this.setting.type;
        this.ptypeList = this.setting.ptype;
        this.crmList = this.setting.crm; */
        // 父级物料号
        let materialNoList = [];
        this.setting.product.forEach(item=>{
          if(item.parentMater && !materialNoList.includes(item.parentMater)){// 如存在父级
            materialNoList.push(item.parentMater);
          }else{
            if(item.materialNo && !materialNoList.includes(item.materialNo)){
              materialNoList.push(item.materialNo);
            }
          }
        });
        this.materialNoList = materialNoList;
      }
    },
    created(){
      this.getSetting();
    },
  }
</script>
