const fs = require("fs");
const filedFun = {
    getPath(path){
        return './config/files/dataList.json';
    },
    // 判断文件是否存在
    existsFile(path){
        try{
            fs.accessSync(path,fs.F_OK);
        }catch(e){
            return false;
        };
        return true;
    },
    // 读取文件
    readFile(params){
        let path = this.getPath();
		if(this.existsFile(path) === false){
			return  {
				success:false,
				msgDesc:'文件不存在'
			};
		}
        try{
            let file = fs.readFileSync(path,'utf-8');
			return {
				success:true,
				response:file
			};
        }catch(e){
            return  {
				success:false,
				msgDesc:'文件读取失败'
			};
        };
    },
    // 写入文件
    writeFile(params){
        let path = this.getPath();
        let datas = this.readFile().response;
        datas = JSON.parse(datas);
        datas[params.key] = params.data;
        try{
			fs.writeFileSync(path, JSON.stringify(datas));
			return  {
				success:true,
				msgDesc:'文件写入成功'
			};
        }catch(e){
            return  {
				success:false,
				msgDesc:'文件写入失败'
			};
        };
    },
    // 删除文件
    removeFile(params){
        let path = this.getPath(params.path);
		if(this.existsFile(path) === false){
			return  {
				success:false,
				msgDesc:'文件不存在'
			};
        }
        try{
            fs.unlinkSync(path)
            return {
                success:true,
				msgDesc:'文件删除成功'
            };
        }catch(e){
            return  {
				success:false,
				msgDesc:'文件删除错误！'
			};
        };
    },
};

module.exports = ({data}) => {
    return new Promise(function (resolve, reject) {
        let result = filedFun[data.type](data);
        resolve(result);
    });
}
