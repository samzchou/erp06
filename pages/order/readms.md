仓库与财务提出库存盘点需要按照日清月结的原则显示信息，
目前系统显示的是总入库量和总出库量，库存盘点表需要升级，做到清晰显示每日每月出入库量，看得到每月期初余额和期末余额，月底做账需要用的
1.增加盘点详细清单表，统计到每日，可汇总为每月、每年

----采购需要升级对应的价格，目前导入的物料价格都是蒂森的销售价格，采购价格应与销售价格区别开来，应该具备设置采购单价的功能，应收应付才能准确使用
1.导入的订单实际单价按照产品库中的元单价为依据。可以实时更新元数据的单价
2.采购制单操作中可以实时变更实际采购单价
3.财务结算对比元数据的单价和订单的价格计算毛利

----实际库存需要有修改的功能，报废或者遗失，蒂森订单经常出现取消的情况
1.库存表增加一个字段，定义常量类型（报废、遗失），备注说明

db.counters.updateMany({model:{$in:['order','store','storeIn','finance','storeCalc','storeLoss']}},{$set:{"count":0}});
db.order.remove({});
db.store.remove({});
db.storeIn.remove({});
db.finance.remove({});
db.storeCalc.remove({});
db.storeLoss.remove({});

config/
navMenu.js

/config/db/
index.js
conect.js
/mock/
db.js

pages/order/
import-buy.vue
buy.vue
sale.vue
order-row.vue

pages/store/
in-buy.vue
in-sale.vue
calc.vue
calc-list.vue

pages/final/
*

数据表counter 加 storeCalc storeLoss
鞥家数据表storeCalc


330107071/aa 6：10 24.63 23.2       4
330081087/aa 9:15 105.02 103.5      6
330209612/ 3：5 296.88 260.5        2
330044820/aa 6:10 70.9

db.storeCalc.aggregate([
    {$match: {typeId: 1, storeTypeId: 2, createDate: {$gte: 1550332800000, $lte: 1550419200000}}},
    {
        $group:{
            _id:{ materialNo: "$materialNo" },
            typeId: { $first: "$typeId" },
			productName: { $first: "$productName" },
            materialNo: { $first: "$materialNo" },
			util: { $first: "$util" },
			incount: { $sum: "$incount" },
			outcount: { $sum: "$outcount" },
			createDate: { $first: "$createDate" },
			createByUser: { $first: "$createByUser" },
			total: { $sum: 1 },
			result: {"$push": "$$ROOT"}
        }
    }
])
