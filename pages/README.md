# PAGES

This directory contains your Application Views and Routes.
The framework reads all the .vue files inside this directory and creates the router of your application.

More information about the usage of this directory in the documentation:
https://nuxtjs.org/guide/routing

#db core
db.counters.updateMany({ model: { $in: ['order','store','storeCalc','storeIn','finance'] } },{ $set: { "count" : 0 } });
db.order.remove({});
db.store.remove({});
db.storeCalc.remove({});
db.storeIn.remove({});
db.finance.remove({});

