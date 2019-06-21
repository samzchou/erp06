<template>
    <el-row :gutter="20">
      <el-col :span="12">{{orderList}}</el-col>
    </el-row>
</template>
<script>
export default {
    name:'order-row',
    props:{
        row:{
            type:Object,
            required:true
        }
    },
    watch:{
		row:{
            handler(newObj){
				this.getOrderList();
            },
            deep: true
        }
	},
    data(){
        return {
            orderList:[],
        }
    },
    methods:{
        async getOrderList(){
            let condition = {
				type:"listData",
				collectionName:'order',
				data:{
                    sourceserial:row.sourceserial
				}
			}
            let result = await this.$axios.$post('mock/db', {data:condition});
            //debugger
            this.orderList = result.list;
        },
    },
    mounted(){
        this.getOrderList();
    }
}
</script>

