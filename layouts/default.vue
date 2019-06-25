<template>
	<el-container class="app-layout">
		<el-header height="40">
			<app-header class="app-header"/>
		</el-header>
		<el-container>
			<el-aside :class="{'collapse':!sidebar.opened}" width="200px">
				<app-aside :isCollapse="!sidebar.opened"/>
			</el-aside>
			<el-main>
				<el-breadcrumb separator-class="el-icon-arrow-right">
					<el-breadcrumb-item v-for="(item,idx) in breadcrumb" :key="idx">{{item}}</el-breadcrumb-item>
				</el-breadcrumb>
				<div class="main-content">
						<transition name="page-enter">
							<nuxt class="page-content page-enter-active"/>
						</transition>
				</div>
			</el-main>
		</el-container>
	</el-container>
</template>

<script>
import {
	mapState
} from 'vuex';
//import {appHeader,appAside} from './layout';
import appHeader from './app-header';
import appAside from './app-aside';
export default {
	components:{
		appHeader,appAside
	},
	computed:{
		...mapState(['sidebar']),
	},

	data(){
		return {
			breadcrumb:[]
		}
	},
	watch:{
		$route (val) {
			this.setBreadcrumb();
		}
	},
	methods:{
		setBreadcrumb(){
			let path = this.$route.fullPath;
			this.breadcrumb = path.split('/').map(item=>{
				item = item==''?'home':item;
				return item;
			})
		}
	},
	mounted(){
		this.setBreadcrumb();
	}

}
</script>


<style lang="scss" scoped>

	.app-layout{
		height: 100%;
		/deep/ .el-header{
			padding:0;
			height:40px;
			background-color: $c-theme;
			color:$c-white;
		}
		/deep/ .el-aside{
			transition: width .3s;
			overflow: hidden;
			background-color: #f5f5f5;
			box-sizing: border-box;
			border-right:1px solid #DDD;
			&.collapse{
				width:45px !important;
				.el-submenu__title{
					padding-left:10px !important;
				}
			}
		}
		/deep/ .el-main{
			padding:0;
			.main-content{
				height: calc(100% - 35px);
				overflow: hidden;
				box-sizing: border-box;
				overflow:auto;
				.scrollbar{
					height: 100%;
					/deep/ .el-scrollbar__wrap {
						overflow-x: hidden;
					}
				}
				.page-content{
					padding:20px 40px 20px 20px;
					.form-container{
						padding: 20px 0;
    					//width: 500px;
					}
					.search-content{
						padding: 10px 0;
						/deep/ .el-form{
							.el-form-item{
								margin-bottom: 5px;
							}
						}
					}
				}
			}
			.el-breadcrumb{
				box-sizing: border-box;
				padding: 10px 20px;
				background-color: #F8F8F8;
				border-bottom: 1px solid #ececec;
			}

		}
	}

</style>

