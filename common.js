/*
Collections = {};
Ontologies = Collections.Ontologies = new Mongo.Collection("ontologies");
Subject = Collections.Subject =  new Mongo.Collection("subject");
Relation = Collections.Relation = new Mongo.Collection("subject_relation");
*/

//Subject =  new Mongo.Collection("subject");
//Relation = new Mongo.Collection("subject_relation");

//Ontologies = new Mongo.Collection("ontologies_d");
//Apps = new Mongo.Collection("apps");
//Subject =  new Mongo.Collection("subjectraw_d");
//Relation =  new Mongo.Collection("rawrelation_d");
applist = {};

idsToString = function idsToString(cursor){
	var result = [];
	cursor.forEach(function(ont){
		result.push(ont);
		result[result.length-1]._id = result[result.length-1]._id._str;
	});
	return result;
}

Array.prototype.unique = function()
{
	var n = {},r=[];
	for(var i = 0; i < this.length; i++) 
	{
		if (!n[this[i]]) 
		{
			n[this[i]] = true; 
			r.push(this[i]); 
		}
	}
	return r;
}
 
oc = function oc(a)
{
  var o = {};
  for(var i=0;i<a.length;i++)
  {
    o[a[i]]='';
  }
  return o;
}

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

Router.route('/subject_path/:lg/:_id/origin/:origin', function () {
	var id = this.params._id;
  	var lang = this.params.lg;
  	var origin = this.params.origin;
  	this.response.end(JSON.stringify(path(id, origin, lang, false)));
}, {where: 'server'});

Router.route('/subject/:lg/:_id', function () {
	var id = this.params._id;
  	var lang = this.params.lg;
	this.response.end(JSON.stringify(subject(id,lang)));
}, {where: 'server'});

Router.route('/ontology/:lg/:_id', function () {
	var id = this.params._id;
  	var lang = this.params.lg;
	this.response.end(JSON.stringify(ontology(id,lang)));
}, {where: 'server'});

Router.route('/ontologies', function () {
	//var onto = Ontologies.find().fetch();
	//this.response.end(JSON.stringify(onto));
	var onto = Ontologies.find();
	this.response.end(JSON.stringify(idsToString(onto)));
}, {where: 'server'});

Router.route('/ontologies/:lg', function () {
	var lang = this.params.lg;
	var onto = Ontologies.find({lang:lang}).fetch();
	this.response.end(JSON.stringify(onto));
}, {where: 'server'});


Router.route('/', function () {
  	this.render('ontologies');
});

Router.route('/translations/:_id', function () {
	var id = this.params._id;
	var eq = idsToString(Subject.find({uuid:id}));
	var transl = {};
	for(i = 0; i < eq.length; i++){
		transl[eq[i]["lang"]] = [eq[i]["subject"]];
	}
	this.response.end(JSON.stringify(transl));
}, {where: 'server'});


Router.route('/apps/:lg/:_id/origin/:origin', function () {
	var id = this.params._id;
	var lang = this.params.lg;
	var origin = this.params.origin;
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
	this.response.end(JSON.stringify(transl));
}, {where: 'server'});

Router.route('/tab', function(){
	this.render('tab');
});

Router.route('/tools/:lg/:_id/origin/:origin', function(){
	this.render('tools', {
		data: function(){
			var data = {};
			data["id"] = this.params._id;
			data["lang"] = this.params.lg;
			data["origin"] = this.params.origin;
			return data;
		}
	});
});

tree_recursive = function(id, lang, data, callback){
	for(var kid = 0; kid <  data.children.length; kid++){
		if(data.children[kid].haschildren[0] > 0){		
			data.children[kid] = callback(data.children[kid]["uuid"], lang)[0];
			data.children[kid] = tree_recursive(data.children[kid]["uuid"], lang, data.children[kid], callback);
		}
	}
	return data;
}

Router.route('/tree/:lg/:_id', function () {
	var id = this.params._id;
  	var lang = this.params.lg;
  	data = subject(id, lang);
  	data = data[0];
	if(data.haschildren[0] > 0){
		data = tree_recursive(id, lang, data, subject);
	}
	this.response.end(JSON.stringify(data));

}, {where: 'server'});

Router.route('/tree_onto/:lg/:_id', function () {
	var id = this.params._id;
  	var lang = this.params.lg;
  	data = ontology(id, lang);
  	data = data[0];
	if(data.haschildren[0] > 0){
		data = tree_recursive(id, lang, data, ontology);
	}
	this.response.end(JSON.stringify(data));

}, {where: 'server'});

Router.route('/tree_onto', function () {
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
		object.children.push({name:[langs[i]], children: kids});
	}
	this.response.end(JSON.stringify(object));

}, {where: 'server'});

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

Router.route('/tree_flat/:lg/:_id', function () {
	var lang = this.params.lg;
	var id = this.params._id;
  	data = subject(id, lang);
  	data[0].order = 0;
  	data[0].title = data[0].name[0];
	if(data[0].haschildren[0] > 0){
		data = tree_flat_recursive(id, lang, data, data[0].order);
	}
	this.response.end(JSON.stringify(data));

}, {where: 'server'});

Router.route('/languages', function () {
	var langss = Ontologies.find({}, {fields: {lang:1, _id:0}}).fetch();
	var langs = [];
	for(var i=0; i < langss.length; i++){
		langs.push(langss[i].lang);
	}
	this.response.end(JSON.stringify({ languages: langs.unique()}));
}, {where: 'server'});
