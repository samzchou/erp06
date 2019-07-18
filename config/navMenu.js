export default {
    "menuList": [{
            "label": "基础数据配置",
            "icon": "cog",
            "children": [
                { "label": "系统权限", "icon": "list-ul", "path": "/options/role" },
                { "label": "机构部门", "icon": "list-ul", "path": "/options/org" },
                { "label": "职务", "icon": "list-ul", "path": "/options/pos" },
                { "label": "仓库库位", "icon": "list-ul", "path": "/options/storeNo" },
                { "label": "业务分类", "icon": "list-ul", "path": "/options/type" },
                { "label": "产品分类", "icon": "list-ul", "path": "/options/ptype" },
                { "label": "付款方式", "icon": "list-ul", "path": "/options/payType" },
                { "label": "流程状态", "icon": "list-ul", "path": "/options/flowState" }
            ]
        },
        {
            "label": "元数据配置",
            "icon": "rss",
            "children": [
                { "label": "用户管理", "icon": "list-ul", "path": "/meta/user" },
                { "label": "客户管理", "icon": "list-ul", "path": "/meta/crm" },
                { "label": "产品管理", "icon": "list-ul", "path": "/meta/product" }
            ]
        },
        {
            "label": "计划/订单",
            "icon": "ils",
            "children": [
                { "label": "订单导入", "icon": "list-ul", "path": "/order/import-buy" },
                { "label": "采购制单", "icon": "list-ul", "path": "/order/buy" },
                { "label": "采购订单管理", "icon": "list-ul", "path": "/order/buy-list" },
                { "label": "生产制单", "icon": "list-ul", "path": "/order/sale" },
                { "label": "生产订单管理", "icon": "list-ul", "path": "/order/sale-list" },
                { "label": "计划单", "icon": "list-ul", "path": "/order/plane-list" },
            ]
        },
        {
            "label": "仓库",
            "icon": "recycle",
            "children": [
                { "label": "配料单", "icon": "list-ul", "path": "/store/collocation" },
                { "label": "采购订单入库", "icon": "list-ul", "path": "/store/in-buy" },
                { "label": "生产订单入库", "icon": "list-ul", "path": "/store/in-sale" },
                { "label": "库存清单明细", "icon": "list-ul", "path": "/store/calc-list" },
                { "label": "库存盘点", "icon": "list-ul", "path": "/store/calc" },
                { "label": "出库-送货单", "icon": "list-ul", "path": "/store/out" },
                { "label": "已出库", "icon": "list-ul", "path": "/store/outsend" }
            ]
        },
        {
            "label": "财务结算",
            "icon": "rmb",
            "children": [
                { "label": "采购付款", "icon": "list-ul", "path": "/finial/payout" },
                //{"label":"应收款", "icon":"list-ul", "path":"/finial/payin"},
                { "label": "发票管理", "icon": "list-ul", "path": "/invoice" }
            ]
        }
    ]

}