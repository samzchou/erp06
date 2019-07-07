module.exports = {
    dbConect: { "dataUrl": "127.0.0.1", "dataPort": "27017", "dataName": "jueheNew", "username": "", "password": "" }, //47.91.231.119
    /*----------数据表Collections-----------*/
    collectionList: [
        { "name": "用户列表", "colname": "user" }
    ],
    collections: {
        /*--------------全局数据设定--------------*/
        setting: {
            name: {
                type: String,
                default: 'opts',
            },
            content: {
                type: Object,
                default: ''
            }
        },
        /*--------------ID自增计数器--------------*/
        counters: {
            model: {
                type: String,
                default: '',
            },
            count: {
                type: Number,
                default: 0
            }
        },
        /*----------权限数据-----------*/
        role: {
            id: {
                type: Number,
                default: 0
            },
            name: {
                type: String,
                default: '',
                label: '名称命名'
            },
            tag: {
                type: String,
                default: '',
                label: '标签识别'
            },
            content: {
                type: String,
                default: '',
                label: '描述'
            }
        },
        /*----------组织部门-----------*/
        org: {
            id: {
                type: Number,
                default: 0
            },
            name: {
                type: String,
                default: '',
                label: '名称命名'
            },
            content: {
                type: String,
                default: '',
                label: '描述'
            }
        },
        /*----------职位-----------*/
        pos: {
            id: {
                type: Number,
                default: 0
            },
            orgId: {
                type: Number,
                default: '',
                label: '组织ID'
            },
            name: {
                type: String,
                default: '',
                label: '名称命名'
            },
            content: {
                type: String,
                default: '',
                label: '描述'
            }
        },
        /*----------仓库库位-----------*/
        storeNo: {
            id: {
                type: Number,
                default: 0
            },
            name: {
                type: String,
                default: '',
                label: '名称命名'
            },
            content: {
                type: String,
                default: '',
                label: '描述'
            }
        },
        /*----------业务分类-----------*/
        type: {
            id: {
                type: Number,
                default: 0
            },
            name: {
                type: String,
                default: '',
                label: '名称命名'
            },
            content: {
                type: String,
                default: '',
                label: '描述'
            }
        },
        /*----------产品分类-----------*/
        ptype: {
            id: {
                type: Number,
                default: 0
            },
            typeId: {
                type: Number,
                default: 0
            },
            name: {
                type: String,
                default: '',
                label: '名称命名'
            },
            content: {
                type: String,
                default: '',
                label: '描述'
            }
        },
        /*----------付款方式-----------*/
        payType: {
            id: {
                type: Number,
                default: 0
            },
            name: {
                type: String,
                default: '',
                label: '名称命名'
            },
            content: {
                type: String,
                default: '',
                label: '描述'
            }
        },
        /*----------流程状态数据-----------*/
        flowState: {
            id: {
                type: Number,
                default: 0
            },
            typeId: {
                type: Number,
                default: 0
            },
            name: {
                type: String,
                default: '',
                label: '名称命名'
            },
            content: {
                type: String,
                default: '',
                label: '描述'
            }
        },
        /*----------用户数据-----------*/
        user: {
            id: {
                type: Number,
                default: 0
            },
            roles: {
                type: Array,
                default: [],
                label: '权限组ID'
            },
            posId: {
                type: Number,
                default: 0,
                label: '职位ID'
            },
            username: {
                type: String,
                default: '',
                label: '用户名'
            },
            password: {
                type: String,
                default: 'juehe123456',
                label: '密码'
            },
            name: {
                type: String,
                default: '',
                label: '姓名'
            },
            token: {
                type: String,
                default: '',
                label: '后台验证码'
            },
            content: {
                type: String,
                default: '',
                label: '描述'
            }
        },
        /*----------客户数据-----------*/
        crm: {
            id: {
                type: Number,
                default: 0
            },
            typeId: {
                type: Number,
                default: 0,
                label: '业务类型ID'
            },
            isuse: {
                type: Boolean,
                default: true,
                label: '禁用状态'
            },
            crmNo: {
                type: String,
                default: '',
                label: '客户编号'
            },
            name: {
                type: String,
                default: '',
                label: '客户名称'
            },
            revenueNo: {
                type: String,
                default: '',
                label: '税号'
            },
            slv: {
                type: Number,
                default: 0,
                label: '税率'
            },
            bank: {
                type: String,
                default: '',
                label: '开户银行'
            },
            bankNo: {
                type: String,
                default: '',
                label: '银行账号'
            },
            address: {
                type: String,
                default: '',
                label: '地址'
            },
            contactName: {
                type: String,
                default: '',
                label: '联系人'
            },
            contactPhone: {
                type: String,
                default: '',
                label: '联系电话'
            },
            payTypeId: {
                type: Number,
                default: 0,
                label: '付款方式'
            },
            payTimes: {
                type: String,
                default: '',
                label: '付款周期'
            },
            content: {
                type: String,
                default: '',
                label: '描述'
            },
            updateDate: {
                type: Number,
                default: new Date().getTime(),
                label: '最后更新'
            }
        },
        /*----------产品数据-----------*/
        product: {
            id: {
                type: Number,
                default: 0
            },
            typeId: {
                type: Number,
                default: 0,
                label: '业务类型ID'
            },
            ptypeId: {
                type: Number,
                default: 0,
                label: '产品分类ID'
            },
            crmId: {
                type: Number,
                default: 0,
                label: '客户ID'
            },
            isuse: {
                type: Boolean,
                default: true,
                label: '禁用状态'
            },
            name: {
                type: String,
                default: '',
                label: '产品名称'
            },
            model: {
                type: String,
                default: '',
                label: '梯形'
            },
            modelNo: {
                type: String,
                default: '',
                label: '梯号'
            },
            parentMater: {
                type: String,
                default: '',
                label: '父物料号'
            },
            materialNo: {
                type: String,
                default: '',
                label: '物料号'
            },
            caselNo: {
                type: String,
                default: '',
                label: '图号版本号'
            },
            util: {
                type: String,
                default: '',
                label: '单位'
            },
            price: {
                type: Number,
                default: 0,
                label: '单价'
            },
            content: {
                type: String,
                default: '',
                label: '描述'
            },
            updateDate: {
                type: Number,
                default: new Date().getTime(),
                label: '最后更新'
            }
        },
        /*----------订单数据-----------*/
        order: {
            id: {
                type: Number,
                default: 0
            },
            isColled: {
                type: Boolean,
                default: false,
                label: '是否已导出配料单'
            },
            business: {
                type: Number,
                default: 0,
                label: '业务类型' // 售后或项目等
            },
            isDelay: {
                type: Boolean,
                default: false,
                label: '推迟送货'
            },
            isCanceled: {
                type: Boolean,
                default: false,
                label: '是否已取消'
            },
            isPayed: {
                type: Boolean,
                default: false,
                label: '是否已付款'
            },
            invoiceNumber: {
                type: String,
                default: '',
                label: '发票号'
            },
            typeId: {
                type: Number,
                default: 0,
                label: '业务类型ID'
            },
            ptypeId: {
                type: Number,
                default: 0,
                label: '产品分类ID'
            },
            flowStateId: {
                type: Number,
                default: 0,
                label: '流程状态ID'
            },
            serial: {
                type: String,
                default: '',
                label: '系统订单号'
            },
            dserial: {
                type: String,
                default: '',
                label: '原始订单号'
            },
            sourceIds: {
                type: String,
                default: '',
                label: '原始订单号'
            },
            sourceserial: {
                type: String,
                default: '',
                label: '原始订单号汇总，字符串split,'
            },
            crmId: {
                type: Number,
                default: 0,
                label: '客户ID'
            },
            crmName: {
                type: String,
                default: '',
                label: '客户名称'
            },
            productId: {
                type: Number,
                default: 0,
                label: '产品ID'
            },
            productName: {
                type: String,
                default: '',
                label: '产品名称'
            },
            projectNo: {
                type: String,
                default: '',
                label: '项目号汇总'
            },
            dprojectNo: {
                type: String,
                default: '',
                label: '原始项目号'
            },
            projectName: {
                type: String,
                default: '',
                label: '项目名称'
            },
            boxNo: {
                type: String,
                default: '',
                label: '箱号'
            },
            model: {
                type: String,
                default: '',
                label: '梯形'
            },
            modelNo: {
                type: String,
                default: '',
                label: '原始梯号汇总'
            },
            dmodelNo: {
                type: String,
                default: '',
                label: '原始梯号'
            },
            materialNo: {
                type: String,
                default: '',
                label: '物料号'
            },
            caselNo: {
                type: String,
                default: '',
                label: '图号版本号'
            },
            util: {
                type: String,
                default: '',
                label: '单位'
            },
            price: {
                type: Number,
                default: 0,
                label: '单价'
            },
            metaprice: {
                type: Number,
                default: 0,
                label: '元单价'
            },
            count: {
                type: Number,
                default: 0,
                label: '订单量'
            },
            releaseCount: {
                type: Number,
                default: 0,
                label: '实际订单量'
            },
            orderDate: {
                type: Number,
                default: new Date().getTime(),
                label: '制单日期'
            },
            deliveryDate: {
                type: Number,
                default: new Date().getTime(),
                label: '交货日期'
            },
            outTypeId: {
                type: Number,
                default: 0,
                label: '出货类型ID'
            },
            content: {
                type: String,
                default: '',
                label: '描述'
            },
            createByUser: {
                type: String,
                default: '',
                label: '创建人'
            },
            updateDate: {
                type: Number,
                default: new Date().getTime(),
                label: '更新日期'
            },
            updateByUser: {
                type: String,
                default: '',
                label: '操作人'
            },
        },
        /*----------订单上传原始数据，暂废弃-----------*/
        orderUpload: {
            id: {
                type: Number,
                default: 0
            },
            isPayed: {
                type: Boolean,
                default: false
            },
            flowStateId: {
                type: Number,
                default: 0
            },
            typeId: {
                type: Number,
                default: 0
            },
            ptypeId: {
                type: Number,
                default: 0
            },
            sourceserial: {
                type: String,
                default: ''
            },
            crmId: {
                type: Number,
                default: 0
            },
            crmName: {
                type: String,
                default: ''
            },
            productId: {
                type: Number,
                default: 0
            },
            productName: {
                type: String,
                default: ''
            },
            projectNo: {
                type: String,
                default: ''
            },
            projectName: {
                type: String,
                default: ''
            },
            boxNo: {
                type: String,
                default: ''
            },
            model: {
                type: String,
                default: ''
            },
            modelNo: {
                type: String,
                default: ''
            },
            materialNo: {
                type: String,
                default: ''
            },
            caselNo: {
                type: String,
                default: ''
            },
            util: {
                type: String,
                default: ''
            },
            price: {
                type: Number,
                default: 0
            },
            count: {
                type: Number,
                default: 0
            },
            orderDate: {
                type: Number,
                default: new Date().getTime()
            },
            deliveryDate: {
                type: Number,
                default: new Date().getTime()
            },
            content: {
                type: String,
                default: ''
            },
            createByUser: {
                type: String,
                default: ''
            },
            updateDate: {
                type: Number,
                default: new Date().getTime()
            }
        },
        /*----------仓库数据（待入库）-----------*/
        storeIn: {
            id: {
                type: Number,
                default: 0
            },
            isPayed: {
                type: Boolean,
                default: false,
                label: '是否已付款'
            },
            invoiceNumber: {
                type: String,
                default: '',
                label: '发票收据号'
            },
            isAdded: {
                type: Boolean,
                default: false,
                label: '是否入库'
            },
            typeId: {
                type: Number,
                default: 0,
                label: '业务类型'
            },
            orderId: {
                type: Number,
                default: 0,
                label: '订单ID'
            },
            orderIds: {
                type: Array,
                default: [],
                label: '所有子订单ID'
            },
            orderSerial: {
                type: String,
                default: '',
                label: '制单订单号'
            },
            serial: {
                type: String,
                default: '',
                label: '订单号'
            },
            sourceserial: {
                type: String,
                default: '',
                label: '原始订单号'
            },
            crmId: {
                type: Number,
                default: 0,
                label: '客户ID'
            },
            crmName: {
                type: String,
                default: '',
                label: '客户名称'
            },
            productId: {
                type: Number,
                default: 0,
                label: '产品ID'
            },
            productName: {
                type: String,
                default: '',
                label: '产品名称'
            },
            materialNo: {
                type: String,
                default: '',
                label: '物料号'
            },
            projectName: {
                type: String,
                default: '',
                label: '项目名称'
            },
            model: {
                type: String,
                default: '',
                label: '项目号'
            },
            price: {
                type: Number,
                default: 0,
                label: '单价'
            },
            metaprice: {
                type: Number,
                default: 0,
                label: '元单价'
            },
            util: {
                type: String,
                default: '',
                label: '单位'
            },
            count: {
                type: Number,
                default: 0,
                label: '订单量'
            },
            incount: {
                type: Number,
                default: 0,
                label: '实际入库量'
            },
            deliveryDate: {
                type: Number,
                default: new Date().getTime(),
                label: '原始订单交付日期'
            },
            finishedDate: {
                type: Number,
                default: new Date().getTime(),
                label: '订单实际交付日期'
            },
            createByUser: {
                type: String,
                default: '',
                label: '操作人'
            },
            createDate: {
                type: Number,
                default: new Date().getTime(),
                label: '创建日期'
            },
            updateByUser: {
                type: String,
                default: '',
                label: '更新人'
            },
            updateDate: {
                type: Number,
                default: new Date().getTime(),
                label: '更新日期'
            }
        },
        /*----------仓库数据（入库出库）-----------*/
        store: {
            id: {
                type: Number,
                default: 0
            },
            isPayed: {
                type: Boolean,
                default: false,
                label: '是否已付款'
            },
            typeId: {
                type: Number,
                default: 0,
                label: '业务类型ID'
            },
            crmId: {
                type: Number,
                default: 0,
                label: '客户ID'
            },
            productName: {
                type: String,
                default: '',
                label: '货品名称'
            },
            materialNo: {
                type: String,
                default: '',
                label: '物料号'
            },
            storeTypeId: {
                type: Number,
                default: 0,
                label: '出入库类型ID'
            },
            storeNoId: {
                type: Number,
                default: 0,
                label: '库位ID'
            },
            price: {
                type: Number,
                default: 0,
                label: '单价'
            },
            metaprice: {
                type: Number,
                default: 0,
                label: '单价'
            },
            util: {
                type: String,
                default: '',
                label: '单位'
            },
            incount: {
                type: Number,
                default: 0,
                label: '当前入库量'
            },
            count: {
                type: Number,
                default: 0,
                label: '库存量'
            },
            losscount: {
                type: Number,
                default: 0,
                label: '遗失量'
            },
            scrapcount: {
                type: Number,
                default: 0,
                label: '报废量'
            },
            atcount: {
                type: Number,
                default: 0,
                label: '总入库量'
            },
            outcount: {
                type: Number,
                default: 0,
                label: '总出库量'
            },
            outTypeId: {
                type: Number,
                default: 0,
                label: '出库类型ID'
            },
            createByUser: {
                type: String,
                default: '',
                label: '创建人'
            },
            createDate: {
                type: Number,
                default: new Date().getTime(),
                label: '创建日期'
            },
            updateByUser: {
                type: String,
                default: '',
                label: '更新人'
            },
            updateDate: {
                type: Number,
                default: new Date().getTime(),
                label: '更新日期'
            }
        },
        /**仓库盘点表 */
        storeCalc: {
            id: {
                type: Number,
                default: 0
            },
            typeId: {
                type: Number,
                default: 0,
                label: '业务类型ID'
            },
            crmId: {
                type: Number,
                default: 0,
                label: '客户ID'
            },
            productName: {
                type: String,
                default: '',
                label: '货品名称'
            },
            materialNo: {
                type: String,
                default: '',
                label: '物料号'
            },
            storeTypeId: {
                type: Number,
                default: 0,
                label: '出入库类型ID'
            },
            price: {
                type: Number,
                default: 0,
                label: '单价'
            },
            metaprice: {
                type: Number,
                default: 0,
                label: '单价'
            },
            util: {
                type: String,
                default: '',
                label: '单位'
            },
            incount: {
                type: Number,
                default: 0,
                label: '当前入库量'
            },
            outcount: {
                type: Number,
                default: 0,
                label: '当前出库量'
            },
            storeCount: {
                type: Number,
                default: 0,
                label: '当前库存量'
            },
            createByUser: {
                type: String,
                default: '',
                label: '创建人'
            },
            createDate: {
                type: Number,
                default: new Date().getTime(),
                label: '创建日期'
            }
        },
        /*----------仓库损耗数据-----------*/
        storeLoss: {
            id: {
                type: Number,
                default: 0
            },
            materialNo: {
                type: String,
                default: '',
                label: '物料号'
            },
            lostcount: {
                type: Number,
                default: 0,
                label: '遗失数量'
            },
            scrapcount: {
                type: Number,
                default: 0,
                label: '遗失数量'
            },
            createByUser: {
                type: String,
                default: '',
                label: '创建人'
            },
            createDate: {
                type: Number,
                default: new Date().getTime(),
                label: '创建日期'
            }
        },
        /*----------财务-----------*/
        finance: {
            id: {
                type: Number,
                default: 0
            },
            isPayed: {
                type: Boolean,
                default: false,
                label: '已收款/付款'
            },
            payType: {
                type: Number,
                default: 0,
                label: '收付款类型ID,1:付款2:收款'
            },
            orderIds: {
                type: Array,
                default: [],
                label: 'storeIn订单ID'
            },
            orderSerial: {
                type: String,
                default: '',
                label: '制单号'
            },
            serial: {
                type: String,
                default: '',
                label: '系统订单号'
            },
            sourceserial: {
                type: String,
                default: '',
                label: '原始订单号汇总，字符串split'
            },
            projectName: {
                type: String,
                default: '',
                label: '项目名称'
            },
            projectNo: {
                type: String,
                default: '',
                label: '项目号'
            },
            crmId: {
                type: Number,
                default: '',
                label: '客户ID'
            },
            deliveryDate: {
                type: Number,
                default: new Date().getTime(),
                label: '交货日期'
            },
            crmName: {
                type: String,
                default: '',
                label: '客户名称'
            },
            price: {
                type: Number,
                default: 0,
                label: '总金额'
            },
            invoiceNumber: {
                type: String,
                default: '',
                label: '发票号或单据号'
            },
            createDate: {
                type: Number,
                default: new Date().getTime(),
                label: '创建日期'
            },
            createByUser: {
                type: String,
                default: '',
                label: '创建人'
            },
            content: {
                type: String,
                default: '',
                label: '备注说明'
            }
        },
    }

};