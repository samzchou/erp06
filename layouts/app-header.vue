<template>
    <section class="header-container">
        <div class="left">
            <i class="my-icon-bars bars" @click="setCollapse"/>
            <span style="margin-left: 15px; font-size: 16px;">珏合ERP</span>
        </div>
        <div class="right">
            <el-dropdown trigger="click" @command="handleCommand">
                <span class="el-dropdown-link">
                    用户：{{username}}<i class="el-icon-arrow-down el-icon--right"></i>
                </span>
                <el-dropdown-menu slot="dropdown">
                    <el-dropdown-item command="111">退出系统</el-dropdown-item>
                    <el-dropdown-item command="222">切换成英文</el-dropdown-item>
                </el-dropdown-menu>
            </el-dropdown>
        </div>
    </section>
</template>
<script>
export default {
    name:'app-header',
    computed:{
        username(){
            return this.$store.state.user.username;
        }
    },
    methods:{
        handleCommand(command){
            this.$message('click on item ' + command);
        },
        setCollapse(){
            this.$store.commit('TOGGLE_SIDEBAR')
        }
    }
}
</script>

<style lang="scss" scoped>
    .header-container{
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        box-sizing: border-box;
        padding:0 15px;
        .left{
            display: flex;
            align-items: center;
            i.bars{
                font-size:18px;
            }
            img.logo{
                height: 24px;
                margin: 0 20px;
            }
            
        }
        .right{
            min-width: 100px;
            /deep/ .el-dropdown{
                color:#FFF;
            }
        }
        
    }
</style>
