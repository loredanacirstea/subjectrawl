/**
 * HTTP Header Security
 *
 * enforce HTTP Strict Transport Security (HSTS) to prevent ManInTheMiddle-attacks
 * on supported browsers (all but IE)
 * > http://www.html5rocks.com/en/tutorials/security/transport-layer-security
 *
 * @header Strict-Transport-Security: max-age=2592000; includeSubDomains
 */

// attach connect-style middleware for response header injection
WebApp.connectHandlers.use(function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return next();
});

//Access-Control-Allow-Origin: http://swagger.io
//Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept


initCsvCollection = function(csv, Collection){
    var data = Assets.getText(csv);
    var results = Papa.parse(data, {
        header: true
    });
    bulkCollectionUpdate(Collection, results.data, {
      primaryKey: "id",
      callback: function() {
        console.log("Done. Collection "+ Collection["_name"] + " now has " +       Collection.find().count() + " documents.");
      }
    });
}

initUrlCollection = function(url, Collection){
    var results = Papa.parse(url, {
        download: true,
        header: true
    });
    bulkCollectionUpdate(Collection, results.data, {
      primaryKey: "id",
      callback: function() {
        console.log("Done. Collection "+ Collection["_name"] + " now has " +       Collection.find().count() + " documents.");
      }
    });
}

initData = function(){
    initCsvCollection("ontologies.csv", Ontologies);
    initCsvCollection("apps.csv", Apps);
    initCsvCollection("subjectraw.csv", Subject);
    initCsvCollection("subjectraw_relation.csv", Relation);
}

initAppCache = function(){
  var apps = Apps.find().fetch();
  for(i in apps){
    applist[apps[i]["name"]] = new Mongo.Collection(apps[i]["name"]);    
    initUrlCollection(apps[i]["csv_url"], applist[apps[i]["name"]]);
  }
}

nodash = function(Collection, fields){
  var col = Collection.find().fetch();
  for(var i in col){
    var query = {};
    for(var j in fields){
      query[fields[j]] = col[i][fields[j]].replace(/-/g,"");
    }
    Collection.update({_id: col[i]._id}, {$set: query});
    if(i % 10000 == 0){
      console.log(i+": "+Collection.findOne({_id: col[i]._id}));
    }
  }
}

//initData();
//initAppCache();



