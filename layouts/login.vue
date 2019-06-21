<template>
    <div class="login-container">
        <nuxt class="login-form" />
    </div>
</template>

<style lang="scss" scoped>
    .login-container{
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #6a7392;
        .login-form{
            width:300px;
            border-radius: 5px;
            background-color: #FFF;
            box-sizing: border-box;
            padding:20px;
        }
    }
</style>

