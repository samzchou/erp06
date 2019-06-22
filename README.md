# erp
"# jueheErp" 
    chomd 777 -R jueheErp
    cnpm install mongoose@5.2.8 --save
    cnpm install script-loader --save
	cnpm install vue-count-to --save
    -- 配置端口号：/config/index.js
    -- mongoDB配置：/config/db/index.js

    -- 服务启动守护 # cnpm install -g pm2 
        pm2 start npm --name "juehe" -- run start