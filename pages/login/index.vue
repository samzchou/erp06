<template>
    <section class="login-content">
        <h3>系统登录</h3>
        <el-form :model="ruleForm" status-icon :rules="rules" ref="ruleForm" size="medium" @keyup.native.enter="submitForm">
            <el-form-item prop="username">
                <el-input placeholder="用户名" v-model="ruleForm.username" prefix-icon="my-icon-user" auto-complete="off"/>
            </el-form-item>
            <el-form-item prop="password">
                <el-input placeholder="密码" type="password" v-model="ruleForm.password" prefix-icon="my-icon-lock" auto-complete="off"></el-input>
            </el-form-item>
            <transition name="el-zoom-in-top">
                <el-form-item prop="captchaCode" class="captcha-content" v-if="loginErrNum > 2">
                    <el-input placeholder="图形验证码" v-model="ruleForm.captchaCode" auto-complete="off" prefix-icon="my-icon-strikethrough" style="width:150px;"/>
                    <el-tooltip content="点击切换验证码" placement="top">
                        <span v-html="imgCodeUrl" @click="updateImgCode"></span>
                    </el-tooltip>
                </el-form-item>
            </transition>
            <el-form-item>
                <el-checkbox v-model="ruleForm.remember">记住账号</el-checkbox>
            </el-form-item>
            <el-form-item class="btns">
                <el-button type="primary" :loading="loadingSubmit" @click="submitForm" size="medium">登录系统</el-button>
            </el-form-item>
        </el-form>
    </section>
</template>
<script>
export default {
    async asyncData({ app, route }) {
        let prev_path = route.query.prev_path || '/';
        return {
            prev_path
        };
    },
    data() {
        // 图片验证码相关验证处理
        let validateCaptchaCode = (rule, value, callback) => {
            if(this.imgCodeVal.toLowerCase() === value.toLowerCase()){
                callback();
            }else{
                callback(new Error('验证码输入错误！'));
            }
        };
        return {
            imgCodeVal:'',
            imgCodeUrl:'',
            loginErrNum:0,
            loadingSubmit:false,
            ruleForm:{
                username: '',
                password: '',
                captchaCode: '',
                remember: true
            },
            rules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 16, message: '长度在 6 到 16 个字符', trigger: 'blur' }
                ],
                captchaCode: [
                    { required: true, message: '请输入图形验证码', trigger: 'blur' },
                    { validator: validateCaptchaCode, trigger: 'blur' }
                ]
            }
        }
    },
    methods:{
        async updateImgCode(){
            let result = await this.$axios.$post('mock/db', {data:{
                token: false,
                type:'captcha'
            }});
            this.imgCodeUrl = result.svg;
            this.imgCodeVal = result.text;
        },
        submitForm(){
            this.$refs.ruleForm.validate((valid) => {
                if (valid) {
                    this.loadingSubmit = true;
                    let {username, password} = this.ruleForm;
                    let loadingMask = this.$loading({background: 'rgba(0, 0, 0, 0.5)'});
                    let reqData = {
                        username : this.ruleForm.username,
                        password : this.ruleForm.password
                    }
                    this.$axios.$post('mock/db',{
                        data:{
                            token: false,
                            type:'login',
                            collectionName:'user',
                            data:reqData
                        }
                    }).then(result=>{
                        loadingMask.close();
                        //console.log('submitForm',result)
                        this.loadingSubmit = false;
                        if(result){
                            this.$store.commit('UPDATE_USER', result);
                            this.$cookies.set('token', result.token, '1m', '/');
                            if(this.prev_path && this.prev_path.indexOf('http') === 0){
                                debugger
                                location.href = this.prev_path;
                            }else{
                                this.$router.replace(this.prev_path);
                            }
                        }else{
                            this.loginErrNum++;
                            if(this.loginErrNum > 2){
                                this.updateImgCode();
                            }
                        }
                    })
                }
            })
        }
    },
    mounted(){
        this.updateImgCode();
    },
    layout:'login'
}
</script>

<style lang="scss" scoped>
    .login-content{
        h3{
            line-height: 40px;
            text-align: center;
        }
        .captcha-content{
            /deep/ .el-form-item__content{
                display: flex;
                align-items: center;
                span.el-tooltip{
                    height: 36px;
                    //border: 1px solid #DDD;
                    margin-left:10px;
                }
            }
        }
    }
</style>
