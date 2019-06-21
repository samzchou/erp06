db.orderUpload.aggregate([
    {
	   "$match" : {"projectNo":{"$in":['E/30059857.024']}}
    },
    { "$sort": { "deliveryDate":1 } },
    { 
        "$group": {
            "_id": { "sourceserial": "$sourceserial" },
            "model":{"$first" :"$model"},
            "modelNo":{"$first" :"$modelNo"},
            "boxNo":{"$first" :"$boxNo"},
            "projectName":{"$first" :"$projectName"},
            "projectNo":{"$first" :"$projectNo"},
            "orderDate":{"$first" :"$orderDate"},
            "deliveryDate":{"$first" :"$deliveryDate"},
            "count":{"$first" :"$count"}
        }
        
    }
])
