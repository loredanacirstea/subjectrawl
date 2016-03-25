path = function(uuid, origin, lang, returnIds){
  returnIds = (typeof returnIds === "undefined") ? true : returnIds;
  var path = [];
  if(uuid != origin){
    path.push(uuid);
    var id = uuid;
    while(id != origin){
      id = Relation.findOne({uuid1:id})["uuid2"];
      path.push(id);
    }
    if(returnIds == false){
      var path_sub = [];
      for(i =0; i < path.length; i++){
        path_sub.push(Subject.findOne({uuid:path[i], lang:lang}));
        path_sub[path_sub.length-1]._id = path_sub[path_sub.length-1]._id_str;
      }
      path = path_sub;
    }
  }
  return path;
}

subject = function(id, lang){
  var subject = Subject.findOne({uuid: id, lang: lang});
  subject._id = subject._id._str;
  var relations = idsToString(Relation.find({uuid2: id}));
  if(relations.length == 0){
    var kids = false;
  }
  else{
    kids = [];
    for(var i = 0; i < relations.length; i++){
      if(relations[i].uuid1 != "NULL"){
        var kid = Subject.findOne({uuid: relations[i]["uuid1"], lang: lang});
        if(kid != undefined){
          kid._id = kid._id._str;
          subkids = Relation.find({uuid2: kid["uuid"]}).fetch().length;
          kids.push(kid);
          kids[kids.length-1].name = [kid["subject"]];
          kids[kids.length-1].haschildren = [subkids];
        }
      }
    }
  }
  var sub = subject;
  //delete sub.id;
  sub.name = [subject["subject"]];
  sub.haschildren = [relations.length];
  sub.children = kids;
  sub = [sub];
  return sub;
}

ontology = function(id, lang){
  var onto = Ontologies.findOne({uuid: id, lang: lang});
  onto._id = onto._id._str;
  id = onto.uuid_onto;
  var relations = idsToString(Relation.find({uuid2: id}));
  if(relations.length == 0){
    kids = false;
  }
  else{
    kids = [];
    for(var i=0; i < relations.length; i++){
      var kid = Ontologies.findOne({uuid_onto: relations[i]["uuid1"], lang: lang});
      if(kid != undefined){
        kid._id = kid._id._str;
        subkids = Relation.find({uuid2: kid["uuid_onto"]}).fetch().length;
        kids.push(kid);
        kids[kids.length-1].name = [kid["description"]];
        kids[kids.length-1].haschildren = [subkids];
      }
    }
  }
  var sub = onto;
  sub.name = [onto.description];
  sub.haschildren = [relations.length];
  sub.children = kids;
  sub = [sub];
  return sub;
}

tree_recursive = function(id, lang, data, callback){
  for(var kid = 0; kid <  data.children.length; kid++){
    if(data.children[kid].haschildren[0] > 0){    
      data.children[kid] = callback(data.children[kid]["uuid"], lang)[0];
      data.children[kid] = tree_recursive(data.children[kid]["uuid"], lang, data.children[kid], callback);
    }
  }
  return data;
}

tree_flat_recursive = function(id, lang, data, ord){
  var kids = data[data.length-1].children;
  for(var kid =0; kid < kids.length; kid++){
    data.push(subject(kids[kid]["uuid"], lang)[0]);
    data[data.length-1].order = ord + 1;
    data[data.length-1].title = data[data.length-1].name[0];
    if(kids[kid].haschildren[0] > 0){
      data = tree_flat_recursive(kids[kid]["uuid"], lang, data, data[data.length-1].order);
    }
  }
  return data;
}

Picker.route('/translate/:from/:to/:phrase', function (params, req, res, next) {
  var lang1 = params.from,
      lang2 = params.to,
      phrase = decodeURI(params.phrase),
      sep, ini, type;

  if(params.query){
    //concept separator
    if(params.query.sep)
      sep = decodeURI(params.query.sep);
    //initial fillers (spaces, tabs)
    if(params.query.ini)
      ini = decodeURI(params.query.ini);
    //response type - can be json; defaults to text
    if(params.query.type)
      type = params.query.type;
  }

  //no separator -> 1 concept
  if(typeof sep !== 'undefined')
    phrase = phrase.split(sep);
  else
    phrase = [phrase];

  var transl = [], subj, tr = '', iniStr, phr;
  for(var i = 0; i < phrase.length; i++){
    //memorize no. of filler characters
    if(typeof ini !== 'undefined'){
      iniStr = phrase[i].match('^' + ini + '*')[0];
      phrase[i] = phrase[i].substring(iniStr.length);
    }
    //find the closest translation first: == or case insensitive or expand to concepts that contain the phrase
    subj = idsToString(Subject.find({lang:lang1, subject: phrase[i]}));

    if(subj.length === 0)
      subj = idsToString(Subject.find({lang:lang1, subject: {$regex: '^'+phrase[i]+'$', $options: '<i>'}}));

    //if(subj.length === 0)
    //  subj = idsToString(Subject.find({lang:lang1, subject: {$regex: '^'+phrase[i], $options: '<i>'}}));
    if(subj.length === 0)
      subj = idsToString(Subject.find({lang:lang1, subject: {$regex: phrase[i], $options: '<i>'}}));

    //find the first translation by uuid
    for(var j = 0; j < subj.length; j++){
      tr = Subject.findOne({uuid: subj[j].uuid, lang: lang2});
      if(tr){
        tr = tr.subject;
        break;
      }
      else
        tr = '';
    }

    //match case with query
    if(tr.length > 0)
      if(phrase[i].toLowerCase() === phrase[i])
        tr = tr.toLowerCase()
      else if(phrase[i].toUpperCase() === phrase[i])
        tr = tr.toUpperCase();
      else if(phrase[i][0].toUpperCase() === phrase[i][0])
        tr = tr[0].toUpperCase() + tr.substring(1);

    if(typeof iniStr !== 'undefined')
      tr = iniStr + tr;
    transl.push(tr);
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  //output normal string or json if this is the type wanted
  if(type === 'text') {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8' 
    });
    if(typeof sep !== 'undefined')
      res.end(transl.join(sep));
    else
      res.end(transl);
  }
  else {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8' 
    });
    res.end(JSON.stringify(transl));
  }
});

Picker.route('/subject_path/:lg/:_id/origin/:origin', function (params, req, res, next) {
  var id = params._id;
  var lang = params.lg;
  var origin = params.origin;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(path(id, origin, lang, false)));
});

Picker.route('/subject/:lg/:_id', function (params, req, res, next) {
  var id = params._id;
  var lang = params.lg;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(subject(id,lang)));
});

Picker.route('/ontology/:lg/:_id', function (params, req, res, next) {
  var id = params._id;
  var lang = params.lg;
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(ontology(id,lang)));
});

Picker.route('/ontologies', function (params, req, res, next) {
  var onto = Ontologies.find();
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(idsToString(onto)));
});

Picker.route('/ontologies/:lg', function (params, req, res, next) {
  var lang = params.lg;
  var onto = Ontologies.find({lang:lang}).fetch();
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(onto));
});

Picker.route('/translations/:_id', function (params, req, res, next) {
  var id = params._id;
  var eq = idsToString(Subject.find({uuid:id}));
  var transl = {};
  for(i = 0; i < eq.length; i++){
    transl[eq[i]["lang"]] = [eq[i]["subject"]];
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(transl));
});

Picker.route('/apps/:lg/:_id/origin/:origin', function (params, req, res, next) {
  var id = params._id;
  var lang = params.lg;
  var origin = params.origin;
  var path = path(id, origin);
  var applist = {};
  for(i = 0; i < path.length; i++){
    if(Apps.find({uuid:path[i]}).fetch().length >0 ){
      var apps = Apps.find({uuid:path[i]}).fetch();
      for(j =0 ; j < apps.length; j++){
        applist[j.toString()] = apps[i];
        url = apps[i]["root_url"];
        var params = url.match("(<)([^>]+)(>)");
        for(p in params){
          //url
        }
        //applist[j.toString()].root_url = ;
      }
      break;
    }
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(transl));
});


Picker.route('/tree/:lg/:_id', function (params, req, res, next) {
  var id = params._id;
  var lang = params.lg;
  data = subject(id, lang);
  data = data[0];
  if(data.haschildren[0] > 0){
    data = tree_recursive(id, lang, data, subject);
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(data));

});

Picker.route('/tree_onto/:lg/:_id', function (params, req, res, next) {
  var id = params._id;
  var lang = params.lg;
  data = ontology(id, lang);
  data = data[0];
  if(data.haschildren[0] > 0){
    data = tree_recursive(id, lang, data, ontology);
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(data));

});

Picker.route('/tree_onto', function (params, req, res, next) {
  var object = {name:["Ontologies"], children:[]};
  var langss = Ontologies.find({}, {fields: {lang:1, _id:0}}).fetch();
  var langs = [];
  for(var i=0; i < langss.length; i++){
    langs.push(langss[i].lang);
  }
  langs = langs.unique();
  for(var i = 0; i < langs.length; i++){
    var root = Ontologies.find({lang: langs[i], ordered: {$in: ["1","0",1,0]}}, {fields: {_id:0}}).fetch();
    var kids = [];
    if(root != undefined){
      for(var r = 0; r < root.length; r++){
        var data = ontology(root[r].uuid, langs[i]);
          data = data[0];
        if(data.haschildren[0] > 0){
          data = tree_recursive(root[r].uuid, langs[i], data, ontology);
        }
        if(data.ordered == "1" || data.ordered == 1){
          kids.push(data);
        }
        else{
          kids = data.children;
        }
      }
    }
    else{
      var ontos = Ontologies.find({lang: langs[i]});
      if(ontos != undefined){
        ontos = idsToString(ontos);
        for(var o = 0; o < ontos.length; o++){
          kids.push(ontology(ontos[o].uuid, langs[i])[0]);
        }
      }
    }
    object.children.push({name:[languages[langs[i]]], lang: langs[i], children: kids});
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(object));

});


Picker.route('/tree_flat/:lg/:_id', function (params, req, res, next) {
  var lang = params.lg;
  var id = params._id;
  data = subject(id, lang);
  data[0].order = 0;
  data[0].title = data[0].name[0];
  if(data[0].haschildren[0] > 0){
    data = tree_flat_recursive(id, lang, data, data[0].order);
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify(data));

});

Picker.route('/languages', function (params, req, res, next) {
  var langss = Ontologies.find({}, {fields: {lang:1, _id:0}}).fetch();
  var langs = [];
  for(var i=0; i < langss.length; i++){
    langs.push(langss[i].lang);
  }
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.end(JSON.stringify({ languages: langs.unique()}));
});

