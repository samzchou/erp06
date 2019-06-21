<template>
    <section class="aside-container">
        <el-scrollbar class="scrollbar">
            <el-menu :collapse="isCollapse" :default-active="menuActive">
                <el-submenu v-for="(menu,idx) in menuList" :key="idx" :index="String(idx)" >
                    <template slot="title">
                        <i :class="'my-icon-'+menu.icon" v-if="menu.icon"/>
                        <span slot="title">{{menu.label}}</span>
                    </template>
                    <el-menu-item v-for="(subMenu,sidx) in menu.children" :key="idx+'-'+sidx" :index="idx+'-'+sidx" @click="goPath(subMenu.path, idx+'-'+sidx)">
                        <i :class="'my-icon-'+subMenu.icon" v-if="subMenu.icon"/>
                        <span>{{subMenu.label}}</span>
                    </el-menu-item>
                </el-submenu>
            </el-menu>
        </el-scrollbar>
        <div class="aside-footer">
            <i :class="sidebar.opened?'el-icon-d-arrow-left':'el-icon-d-arrow-right'" @click="toggleCollapse"/>
        </div>
    </section>
</template>
<script>
import {
	mapState
} from 'vuex';
import navMenu from '@/config/navMenu';
import $bus from '@/util/bus';
export default {
    name:'app-aside',
    props:{
        isCollapse:{
            type:Boolean,
            default:false
        }
    },
    watch: {
	   $route (r) {
	        this.setNav(r.path);
	   }
	},
    computed:{
		...mapState(['sidebar']),
	},
    data(){
        return {
            menuActive:'',
            menuList:[]
        }
    },
    methods:{
        toggleCollapse(){
            this.$store.commit('TOGGLE_SIDEBAR');
        },
        goPath(path, index){
            this.clearStore(['formObj']);
            this.menuActive = index;
            this.$cookies.set('menu-active', index);
            // 清除缓存
            this.$router.push(path); 
        },
        clearStore(list){
            list.forEach(lis => {
                //this.$storage.session.remove(lis);
            });  
        },
        setNav(routePath){
            for(let i=0; i<this.menuList.length; i++){
                if(this.menuList[i]['children'].length){
                    for(let n=0; n<this.menuList[i]['children'].length; n++){
                        let path = this.menuList[i]['children'][n]['path'];
                        if(path === routePath){
                            this.goPath(routePath, i+'-'+n);
                            break;
                        }
                    }
                }
            }
        }
    },
    mounted(){
        this.menuActive = this.$cookies.get('menu-active') || '';
        this.menuList = navMenu.menuList;
	    this.setNav(this.$route.path);
    }
}
</script>

<style lang="scss" scoped>
    .aside-container{
        height: 100%;
        
        .scrollbar{
            height: calc(100% - 20px);
            /deep/ .el-scrollbar__wrap {
                overflow-x: hidden;
                //margin-right:0 !important;
                .el-menu--collapse{
                    width:auto;
                }
            }
        }
        /deep/ .el-menu{
            border:0;
            background-color:transparent;
            .el-submenu__title{
                font-weight: bold;
                height: 50px;
                line-height: 50px;
                transition: all .2s;
                color: #666;
                .el-submenu__icon-arrow{
                    right:40px;
                }
            }
            .el-menu-item{
                height: 36px;
                line-height: 36px;
                min-width:auto;
                font-size:12px;
                i{
                    font-size:14px;
                }
            }
        }
        .aside-footer{
            height: 20px;
            display: flex;
            justify-content: center;
            background-color: #ececec;
            align-items: center;
        }
    }
    
</style>
