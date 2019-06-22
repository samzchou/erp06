<template>
	<section class="invoice-container">
		<div class="tabs">
			<div v-for="(tab,idx) in tabs" :key="idx" :class="{'active':currTab==idx}" @click="go(idx)">{{tab.label}}</div>
		</div>
        <nuxt-child :key="$route.path" />
	</section>
</template>
<script>
export default {
    //'可开票','已开票','发票汇总'
	data: () => ({
        currTab:0,
        tabs:[{label:'待开票',url:'/invoice'},{label:'已开票',url:'/invoice/finish'},{label:'发票汇总',url:'/invoice/collect'}]
	}),
	methods: {
        go(index){
            this.currTab = index;
            this.$router.push(this.tabs[index]['url'])
        }
	}
}
</script>
<style lang="scss" scoped>
.invoice-container {
	.tabs {
		display: flex;
		border-bottom: 1px solid #ddd;
		> div {
			margin-right: 20px;
            line-height: 30px;
            font-weight: bold;
            cursor: pointer;
            color:#888;
			&.active {
				color: $c-main;
			}
		}
    }
}
</style>


