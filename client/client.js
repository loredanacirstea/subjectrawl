Session.set( "languages", {
            "la" :"Latin",
            "en" : "English",
            "es" : "Spanish",
            "jp" : "Japanese",
            "ro" : "Romanian",
            "code" : "Official Ids"
          });
Session.setDefault( "origin", "be81554a-7759-11e4-adb6-57ce06b062da" );
Session.setDefault("choose_output","value");
Session.setDefault("official_id_lang", "code");
//Session.setDefault("async_cache", {"path":0});
async_cache = {"path":0};

Template.registerHelper("choose", function(opt1,opt2){
  if(opt1 === undefined){
    return opt2;
  }
  else{
    return opt1;
  }
});

Template.registerHelper("log", function(opt){
  console.log(opt);
});

Template.registerHelper("flag", function(lang){
  if(lang != undefined){
    var img = "/icons/"+lang+".png";
    return img;
  }
});
Template.registerHelper("iconify", function(source, lang){
  if(source != undefined){
    return source;
  }
  else{
    var img = "/icons/"+lang+".png";
    return img;
  }
});

show_uuids = function show_uuids(){
  if($('.uncoverable').attr("type") == "hidden")
    $('.uncoverable').attr("type","text");
  else
    $('.uncoverable').attr("type","hidden");
}
text_tool = function text_tool(data){
  var text_id = data.level+"_input";
  var hidden_id = data.level+"_input_id";
  if(data.level.indexOf("search") == -1){
    text_type = "text";
    var action = "select";
  }
  else{
    text_type = "hidden";
    var action = "activate";
  }
  Blaze.renderWithData(Template.input, {text_id: text_id, placeholder: "Choose from "+data.level, hidden_id: hidden_id, buttons_id: data.level+"_buttons", text_type: text_type}, data.node);
    $("#"+data.drop.dropdown_id).dropdown({
        action: action,
        allowCategorySelection: true,
        onChange: function(value, text, $choice){
          console.log(value);
          console.log(text);
          console.log($choice);
          var id = $choice[0].attributes["data-uuid"].value;
          var text = $choice[0].attributes["data-name"].value;
          var lang = $choice[0].attributes["data-lang"].value;
          $('#'+hidden_id).val(id);
          if(Session.get("choose_output")=="value")
            $('#'+text_id).val(text);
          else if(Session.get("choose_output")=="uuid")
            $('#'+text_id).val(id);
          else{
            $.getJSON( "/translations/"+id, function(data1){
              $('#'+text_id).val(data1[Session.get("official_id_lang")][0]);
            });
          }
        }
    });
}

nav_tool = function nav_tool(data){
  $("#"+data.drop.dropdown_id).dropdown({
      allowCategorySelection: true,
      onChange: function(value, text, $choice){
        var id = $choice[0].attributes["data-uuid"].value;
        var lang = $choice[0].attributes["data-lang"].value;
        var origin = data.origin;
        window.location.href = "/tools/"+lang+"/"+id+"/origin/"+origin;
        Blaze.render(Template.tools, document.body);
      }
      }
    );
}

search = function(type, node, id, lang, callback){
  var path = "/tree_flat/"+lang+"/"+id;
  if(Object.keys(async_cache).indexOf(path) == -1){
    $.getJSON( path, function(data1){
        async_cache[path] = data;
        console.log(async_cache);
        Session.set("async_cache", async_cache);
        var data = {};
        data.subjects = data1;
        data.drop={};
        data.drop.dropdown_id = type + "_dropdown";
        data.callback = callback;
        data.level = type;
        data.node = node;
        Blaze.renderWithData(Template.search_simple_dropdown, data, data.node);
    });
  }
  else{
    data1 = async_cache[path];
    var data = {};
    data.subjects = data1;
    data.drop={};
    data.drop.dropdown_id = type + "_dropdown";
    data.callback = callback;
    data.level = type;
    data.node = node;
    Blaze.renderWithData(Template.search_simple_dropdown, data, data.node);
  }
}

search_tree = function(){
  var dropdownid = "search_tree"+data["id"];
  $.getJSON( "/tree/"+data["lang"]+"/"+data["id"], function(data1){
      var dat = {};
      dat.drop = data1;
      dat.drop.dropdown_id = dropdownid;
      Blaze.renderWithData(Template.search_tree_dropdown, dat, document.getElementById("search_tool"));
  });
}
//att id! give names to callback
new_dropdown = function(level, node, id, lang, origin, callback){
  var dat = {};
  dat.callback = callback;
  dat.level = level;
  dat.origin = origin;
  //console.log(Session.get("async_cache"));
  console.log(async_cache);
  if(typeof callback === 'function'){
    var nodeid = level + "_" + callback.name;
    var dropdown_id = level+"_dropdown"+"_"+callback.name;
  }
  else{
    var nodeid = level;
    var dropdown_id = level+"_dropdown";
  }
  $("#"+node.id).append('<div class="flex" id="'+nodeid+'">');
  node = document.getElementById(nodeid);
  dat.node = node;
  if(level == "kids"){
    var path = "/subject/"+lang+"/"+id;
    //var async_cache = Session.get("async_cache");
    console.log(async_cache);
    if(Object.keys(async_cache).indexOf(path) == -1){
      $.getJSON( path, function(data){
        async_cache[path] = data;
        console.log(async_cache);
        Session.set("async_cache", async_cache);
        dat.drop = data[0];
        dat.drop.dropdown_id = dropdown_id;
        dat.drop.icon = "/icons/kids.png";
        Blaze.renderWithData(Template.khron_drop, dat, node);
      });
    }
    else{
        data = async_cache[path];
        dat.drop = data[0];
        dat.drop.dropdown_id = dropdown_id;
        dat.drop.icon = "/icons/kids.png";
        Blaze.renderWithData(Template.khron_drop, dat, node);
    }
  }
  else if(level == "siblings"){
    var path = "/subject_path/"+lang+"/"+id+"/origin/"+origin;
    //var async_cache = Session.get("async_cache");
    console.log(async_cache);
    if(Object.keys(async_cache).indexOf(path) == -1){
      $.getJSON( path, function(data1){
        async_cache[path] = data1;
        console.log(async_cache);
        Session.set("async_cache", async_cache);
        var path2 = "/subject/"+data1[1]["lang"]+"/"+data1[1]["uuid"];
        if(Object.keys(async_cache).indexOf(path2) == -1){
          $.getJSON( path2, function(data2){
              async_cache[path2] = data2;
              Session.set("async_cache", async_cache);
              //dat.drop = data2[0];
              
              dat.drop = data1[0];
              dat.drop["name"] = [data1[0]["subject"]];
              dat.drop.children = data2[0].children;
              
              dat.drop.dropdown_id = dropdown_id;
              dat.drop.icon = "/icons/siblings.png";
              Blaze.renderWithData(Template.khron_drop, dat, node);
          });
        }
        else{
          data2 = async_cache[path2];
          //dat.drop = data2[0];

          dat.drop = data1[0];
          dat.drop["name"] = [data1[0]["subject"]];
          dat.drop.children = data2[0].children;

          dat.drop.dropdown_id = dropdown_id;
          dat.drop.icon = "/icons/siblings.png";
          Blaze.renderWithData(Template.khron_drop, dat, node);
        }
      });
    }
    else{
      data1 = async_cache[path];
      var path2 = "/subject/"+data1[1]["lang"]+"/"+data1[1]["uuid"];
      if(Object.keys(async_cache).indexOf(path2) == -1){
          $.getJSON( path2, function(data2){
              async_cache[path2] = data2;
              Session.set("async_cache", async_cache);
              //dat.drop = data2[0];

              dat.drop = data1[0];
              dat.drop["name"] = [data1[0]["subject"]];
              dat.drop.children = data2[0].children;

              dat.drop.dropdown_id = dropdown_id;
              dat.drop.icon = "/icons/siblings.png";
              Blaze.renderWithData(Template.khron_drop, dat, node);
          });
        }
        else{
          data2 = async_cache[path2];
          //dat.drop = data2[0];

          dat.drop = data1[0];
          dat.drop["name"] = [data1[0]["subject"]];
          dat.drop.children = data2[0].children;

          dat.drop.dropdown_id = dropdown_id;
          dat.drop.icon = "/icons/siblings.png";
          Blaze.renderWithData(Template.khron_drop, dat, node);
        }
    }
  }
  else if(level == "tree"){
    var path = "/tree/"+lang+"/"+id;
    //var async_cache = Session.get("async_cache");
    console.log(async_cache);
    if(Object.keys(async_cache).indexOf(path) == -1){
      $.getJSON( path, function(data){
          async_cache[path] = data;
          console.log(async_cache);
          Session.set("async_cache", async_cache);
          dat.drop = data;
          dat.drop.dropdown_id = dropdown_id;
          dat.drop.icon = "/icons/onto.png";
          Blaze.renderWithData(Template.khron_drop, dat, node);
      });
    }
    else{
      data = async_cache[path];
      dat.drop = data;
      dat.drop.dropdown_id = dropdown_id;
      dat.drop.icon = "/icons/onto.png";
      Blaze.renderWithData(Template.khron_drop, dat, node);
    }
  }
  else if(level == "tree_flat"){
    var path = "/tree_flat/"+lang+"/"+id;
    //var async_cache = Session.get("async_cache");
    console.log(async_cache);
    if(Object.keys(async_cache).indexOf(path) == -1){
      $.getJSON( path, function(data){
          async_cache[path] = data;
          console.log(async_cache);
          Session.set("async_cache", async_cache);
          for(var i = 0; i < data.length; i++){
            delete data[i].children;
          }
          dat.drop = data[0];
          dat.drop.children = data.slice(1,data.length);
          dat.drop.dropdown_id = dropdown_id;
          dat.drop.icon = "/icons/onto.png";
          for(var i = 0; i < dat.drop.children.length; i++){
            dat.drop.children[i].name = [Array(dat.drop.children[i].order+1).join(" : ")+ dat.drop.children[i].name[0]];
          }
          Blaze.renderWithData(Template.khron_drop, dat, node);
      });
    }
    else{
      data = async_cache[path];
          for(var i = 0; i < data.length; i++){
            delete data[i].children;
          }
          dat.drop = data[0];
          dat.drop.children = data.slice(1,data.length);
          dat.drop.dropdown_id = dropdown_id;
          dat.drop.icon = "/icons/onto.png";
          for(var i = 0; i < dat.drop.children.length; i++){
            dat.drop.children[i].name = [Array(dat.drop.children[i].order+1).join(" : ")+ dat.drop.children[i].name[0]];
          }
          Blaze.renderWithData(Template.khron_drop, dat, node);
    }
  }
  else if(level == "path"){
    var path = "/subject_path/"+lang+"/"+id+"/origin/"+origin;
    //var async_cache = Session.get("async_cache");
    console.log(async_cache);
    if(Object.keys(async_cache).indexOf(path) == -1){
      $.getJSON( path, function(data){
          async_cache[path] = data;
          console.log(async_cache);
          Session.set("async_cache", async_cache);
          dat.drop = data[0];
          dat.drop["name"] = [data[0]["subject"]];
          dat.drop.children = [];
          for(var i = 1 ; i < data.length ; i++){
            dat.drop.children.push(data[i]);          
            dat.drop.children[i-1]["name"] = [data[i]["subject"]];
          }
          dat.drop.dropdown_id = dropdown_id;
          dat.drop.icon = "/icons/path.png";
          Blaze.renderWithData(Template.khron_drop, dat, node);
      });
    }
    else{
      data = async_cache[path];
      dat.drop = data[0];
          dat.drop["name"] = [data[0]["subject"]];
          dat.drop.children = [];
          for(var i = 1 ; i < data.length ; i++){
            dat.drop.children.push(data[i]);          
            dat.drop.children[i-1]["name"] = [data[i]["subject"]];
          }
          dat.drop.dropdown_id = dropdown_id;
          dat.drop.icon = "/icons/path.png";
          Blaze.renderWithData(Template.khron_drop, dat, node);

    }
  }
  else if(level == "translations"){
    var path = "/translations/"+id;
    //var async_cache = Session.get("async_cache");
    console.log(async_cache);
    if(Object.keys(async_cache).indexOf(path) == -1){
      $.getJSON( path, function(data){
        async_cache[path] = data;
        console.log(async_cache);
        Session.set("async_cache", async_cache);
        dat.drop = {};
        dat.drop.name = data[Session.get("lang")];
        dat.drop.children = [];
        var keys = Object.keys(data);
        for(var i = 0; i < keys.length; i++){
          dat.drop.children.push({name:data[keys[i]], uuid:id, lang:keys[i], subject:data[keys[i]]});
        }
        dat.drop.dropdown_id = dropdown_id;
        dat.drop.icon = "/icons/langs.png";
        Blaze.renderWithData(Template.khron_drop, dat, node);
      }); 
    }
    else{
      data = async_cache[path];
      dat.drop = {};
        dat.drop.name = data[Session.get("lang")];
        dat.drop.children = [];
        for(var i =0; i < data.length; i++){
          dat.drop.children.push({name:data[i], uuid:id});
        }
        dat.drop.dropdown_id = dropdown_id;
        dat.drop.icon = "/icons/langs.png";
        Blaze.renderWithData(Template.khron_drop, dat, node);
    }
  }

}

Template.tools.rendered = function(){
  Session.set("lang",this.data["lang"]);
  Session.set("origin",this.data["origin"]);
  var dropdowns = ["kids", "siblings", "path", "tree", "tree_flat", "translations"];
/*
  for(i = 0; i < dropdowns.length; i++){
    new_dropdown(dropdowns[i], document.getElementById("text_drop"), this.data["id"], this.data["lang"], this.data["origin"], text_tool);
    new_dropdown(dropdowns[i], document.getElementById("nav_drop"), this.data["id"], this.data["lang"], this.data["origin"], nav_tool);
  } */
  Blaze.render(Template.choose_output, document.getElementById("choose_output"));
  
  new_dropdown("kids", document.getElementById("text_drop"), this.data["id"], this.data["lang"], this.data["origin"], text_tool);
  new_dropdown("siblings", document.getElementById("text_drop"), this.data["id"], this.data["lang"], this.data["origin"], text_tool);
  new_dropdown("path", document.getElementById("text_drop"), this.data["id"], this.data["lang"], this.data["origin"], text_tool);
  new_dropdown("tree", document.getElementById("text_drop"), this.data["id"], this.data["lang"], this.data["origin"], text_tool);
  new_dropdown("tree_flat", document.getElementById("text_drop"), this.data["id"], this.data["lang"], this.data["origin"], text_tool);
  new_dropdown("translations", document.getElementById("text_drop"), this.data["id"], this.data["lang"], this.data["origin"], text_tool);
  //new_dropdown("kids", document.getElementById("nav_drop"), this.data["id"], this.data["lang"], this.data["origin"], nav_tool);
  new_dropdown("tree", document.getElementById("nav_drop"), this.data["id"], this.data["lang"], this.data["origin"], nav_tool);
  new_dropdown("path", document.getElementById("nav_drop"), this.data["id"], this.data["lang"], this.data["origin"], nav_tool);
  new_dropdown("translations", document.getElementById("nav_drop"), this.data["id"], this.data["lang"], this.data["origin"], nav_tool);

  //search_tree(this.data);
  search("search_simple", document.getElementById("search_tool"), this.data.id, this.data.lang, text_tool);
  Blaze.renderWithData(Template.tags_tool, this.data, document.getElementById("tags_tool"));
  
  Blaze.render(Template.tiny_editor, document.getElementById("tiny_editor"));
}

Template.choose_output.rendered = function(){
  $('#choose_output_dropdown').dropdown({
    action: 'combo',
    onChange: function(text) {
      Session.set("choose_output",text);
    }
  });
}

Template.tags_tool.rendered = function(){
  var path = "/tree_flat/"+this.data["lang"]+"/"+this.data["id"];
  if(Object.keys(async_cache).indexOf(path) == -1){
    $.getJSON( path, function(data){     
        async_cache[path] = data;
        console.log(async_cache);
        Session.set("async_cache", async_cache);
        console.log(data);
        $('#tags_search').search({
            source: data,
            minCharacters: 3,
            maxResults: 200,
            searchFields: [
              'title'
            ]
            /*,onResultsAdd: function(){
              return '<a class="ui label">'+result+'</a>';
            }*/
            
            ,onSelect : function(event,val){
              console.log(event.target.textContent);
              var uuid;
              for(var i = 0; i < data.length; i++){
                if(data[i].title == event.target.textContent){
                  uuid = data[i].uuid;
                }
              }
              if($("#tags_uuids").val().split(",").indexOf(uuid) != -1 ){
                /*
                $('.ui .search').popup({
                    //popup : $('.ui.popup'),
                    inline: true,
                    content: 'Tag already added',
                    position: 'right center',
                    delay: {
                      show: 0,
                      hide: 3000
                    }
                });
                $('.ui .search').popup('show');
                $('.ui .search').popup('hide');
                  */
              }
              else{
                $("#tags").append('<div class="ui tag label" value="'+uuid+'">'+event.target.textContent+'<i class="delete icon"></i></div>');
                $(".results").transition('fade');
                $(".prompt").val("");
                if($("#tags_uuids").val() == ''){
                  $("#tags_uuids").val(uuid);
                }
                else{
                  $("#tags_uuids").val($("#tags_uuids").val()+','+uuid);
                }
              }
            },
            onResults : function(response){
                console.log(response);
                //Session.set(response);
            }
        });
    });
  }
  else{
    data = async_cache[path];
    console.log(data);
    $('#tags_search').search({
            source: data,
            minCharacters: 3,
            maxResults: 200,
            searchFields: [
              'title'
            ]         
            ,onSelect : function(event,val){
              console.log(event.target.textContent);
              var uuid;
              for(var i = 0; i < data.length; i++){
                if(data[i].title == event.target.textContent){
                  uuid = data[i].uuid;
                }
              }
              if($("#tags_uuids").val().split(",").indexOf(uuid) != -1 ){
              }
              else{
                $("#tags").append('<div class="ui tag label" value="'+uuid+'">'+event.target.textContent+'<i class="delete icon"></i></div>');
                $(".results").transition('fade');
                $(".prompt").val("");
                if($("#tags_uuids").val() == ''){
                  $("#tags_uuids").val(uuid);
                }
                else{
                  $("#tags_uuids").val($("#tags_uuids").val()+','+uuid);
                }
              }
            },
            onResults : function(response){
                console.log(response);
            }
        });
  }
}
Template.tags_tool.events({
  'click .delete.icon': function(event){
    var tags = event.target.parentNode.parentNode.childNodes;
    for(var i = 0; i < tags.length; i++){
      if(tags[i].isEqualNode(event.target.parentNode)){
        var uuids = $("#tags_uuids").val().split(",");
        uuids.splice(i,1).join();
        console.log(uuids);
        $("#tags_uuids").val(uuids);
      }
    }
    event.target.parentNode.parentNode.removeChild(event.target.parentNode);
  }
});

Template.search_simple_dropdown.rendered = function(callback){
    if (typeof this.data.callback === "function") {
      this.data.callback(this.data);
    }
    else{
      $("#"+this.data.drop.dropdown_id).dropdown();
    }
}

Template.search_tree_dropdown.rendered = function(){
      $(".dropdown").dropdown({
        onChange: function(value, text, $choice){
          console.log($choice[0].attributes["data-uuid"].value);
        }
      });
}

Template.add_text_button.events({
  'click .button': function(event){
    var template_name = event.target.parentNode.parentNode.getAttribute("id");
    if(template_name.indexOf('_buttons') != -1)
      var extra = template_name.indexOf('_buttons');
    template_name = template_name.substring(0,extra);
    var text = $("#"+template_name+"_input").val();
    var id = $("#"+template_name+"_input_id").val();
    tinymce.activeEditor.execCommand('mceInsertContent', false, '<span class="T '+id+'" style="font-weight: bold;" data-mce-style="font-weight: bold;">'+text+'</span>&#160;');
    //$("#"+template_name+"_input").val("");
  }
});

Template.tiny_editor.rendered = function(){
    copyit = function(){
        $("#lab").html($("#tinymce").html())
        alert($("#content_ifr").contents().find("#tinymce").html())
    }

    blend = function(){
       // $(".T").css("fontWeight", "normal")
       // $(".ref").remove()
       $("#content_ifr").contents().find(".T").css("fontWeight", "normal")
       $("#content_ifr").contents().find(".ref").remove()
    }
    bold = function(){
        $("#content_ifr").contents().find(".T").css("fontWeight", "bold")
        //alert("hgh")
    }
    check = function(lang, constr, refs){
        var terms = $("#content_ifr").contents().find(".T");
        var ids = []
        var iids =[]
        terms.each(function(index){
            $($(this).attr('class').split(' ')).each(function(i) { 
                if (this[0] !== 'T') {
                    ids[terms[index]] = this;
                    iids.push(this)
                    //alert(this)
                    $.getJSON("../../smp/get_term.php?id="+this, function( data ) {
                        //console.log(data)
                        if (constr) {
                            if ($(terms[index]).html() == data[lang]) {
                                $el=$("")
                            } else {
                                $el = $('<span class="incorrect">'+$(terms[index]).html()+"</span> ")
                            }
                            $(terms[index]).html( "").append($el).append(" "+data[lang])
                        } else {
                            $(terms[index]).html( "").append(data[lang])
                        }
                        
                        if (refs) {
                            $el = $('<a href="http://sliced.ro/smp/ta.php?ta='+data['taid']+'"  class="ref" target="_new"><img src="fwd.png" /></a>')
                            $(terms[index]).append($el)
                        }
                    });
                }    
            });
        })
        //console.log(iids)
    }

    tinymce.init({
        selector: "textarea",
        theme: "modern",
        plugins: [
            "advlist autolink lists link image charmap print preview hr anchor pagebreak",
            "searchreplace wordcount visualblocks visualchars code fullscreen",
            "insertdatetime media nonbreaking save table contextmenu directionality",
            "emoticons template paste textcolor smp"
        ],
        toolbar1: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image",
        toolbar2: "print preview media | forecolor backcolor emoticons",
        image_advtab: true,
        templates: [
            {title: 'Test template 1', content: 'Test 1'},
            {title: 'Test template 2', content: 'Test 2'}
        ]
    });
}

Template.khron_drop.rendered= function(callback){
    if (typeof this.data.callback === "function") {
      this.data.callback(this.data);
    }
    else{
      $("#"+this.data.drop.dropdown_id).dropdown({
        action: 'select',
        allowCategorySelection: true
      });
    }
};


choose_ontology = function choose_ontology(data){
  $("#"+data.drop.dropdown_id).dropdown({
        action: 'select',
        allowCategorySelection: true,
        onChange: function(value, text, $choice){
          var id = $choice[0].attributes["data-uuid"].value;
          var lang = $choice[0].attributes["data-lang"].value;
          console.log($choice);
          Session.set("lang", lang);
          Session.set("origin", id);
          data = {id: id, lang: lang, origin: id};
          console.log(data);
          Blaze.renderWithData(Template.jstree, data, document.getElementById("tree"));
        }
  });
}
Template.ontologies.rendered = function(){
  $.getJSON( "/tree_onto", function(data){
    var dat = {};
    dat.drop = data;
    dat.drop.dropdown_id = "ontologies";
    dat.drop.icon = "/icons/onto.png";
    dat.callback = choose_ontology;
    console.log(dat);
    Blaze.renderWithData(Template.khron_drop, dat, document.getElementById("onto_drop"));
  });
}

Template.tab.rendered = function(){
  $('#context1 .menu .item')
      .tab({
        context: $('#context1')
      })
    ;
  $('#transl_tab').popup();
  $('#search_tab').popup();
  $('#tools_tab').popup();
}
Template.jstree.rendered = function(){      
    var term_id = this.data.id;
    var lang = this.data.lang;
    var origin = this.data.origin;
    var languages = Session.get("languages");

    //$('#results').html('<h3 class="ui top attached header">Select one or more terms</h3><div class="ui info message" id="event_result"></div>');
    $('#results').html('');
    Blaze.render(Template.tab, document.getElementById("results"));
    $('#transl_content').html('<p>Select one or more terms.</p><p>**known bug**</p><p>do not select an open node or </p><p>a node that was recently closed</p><p>*browser freezes*</p>');

        /*
        if($('#ontology')){
            $('#ontology').remove();
        }
        $('.row').append(
            $('<div id="ontology">').append(
                $('<p id="lang">'),
                $('<p id="description">'),
                $('<p id="relation">'),
                $('<p id="source">')
            )
        )

        if(lang != "code"){
            var src = 'icons/'+lang+'.png';
        } else{
            var src = 'icons/ids.png';
        }
        $('#lang').html('<img src="'+src+'">');
        $('#description').html(description);
        $('#relation').html(' - '+relation_name);
        $('#source').html('<a target="_blank" href="'+source+'"><img src="icons/link.png"></a>');

       */
    $('#jstree').jstree("destroy");

    $('#jstree').jstree({
      'plugins': ["checkbox"],
      'core' : {
        'themes': {
            'name': 'proton',
            'responsive': true,
            'icons' : false
            //'stripes' : true
        },
        'data' : function (node, cb) {
            //console.log(node["id"])
            if(node["id"] == "#"){
              var id = term_id;
            }
            else{
              var id = node["id"];
            }
             
            $.getJSON( "/subject/"+lang+"/"+id, function(data){
                  //console.log(data);
                  var n = data[0];        
              
                  //console.log(n["children"])
                  console.log(n);
                  kids = [];
                  for(i =0; i< n["children"].length; i++){       
                      if(n["children"][i]["haschildren"][0] > 0){
                        var haskids = true;
                      }
                      else{
                        var haskids = false;
                      }
                      //console.log(haskids);
                      kids.push(
                        { "id" : n["children"][i]["uuid"],
                          "text" : n["children"][i]["name"],
                          "state" : {'opened': false},
                          "children" : haskids
                        }
                      );
                  }
                  //console.log(n);
                  tree= {
                      'id' : n["uuid"],
                      'text' : n["name"],
                      'state' : { 'opened' : true},
                      'children' : kids
                  }
                  cb(tree);
              }
            );
        }
      }
    }).bind("changed.jstree", function(evt, data) {
              var i, j, r = [];
              //$('#results').html('<h3 class="ui top attached header">Info</h3><div class="ui info message" id="event_result"></div>');
              $('#transl_content').html('');
              $('#search_div').html('');
              $('#tools_div').html('');

              if(data.selected.length == 1){
                  //console.log(data.instance.get_node(data.selected));
                  var txt = data.instance.get_node(data.selected).text[0];
                  txt = txt.toLowerCase();
                  var id = data.instance.get_node(data.selected).id;
                  
                  var transl = [];               

                  $.getJSON( "/translations/"+id, function(output){
                    
                    console.log(output);
                    var langs = Object.keys(output);
                    
                    $('#transl_content').append(
                        $('<table class="ui very basic table" id="translations">')
                    );

                    for(i = 0; i < langs.length; i++){
                      //console.log(output[langs[i]]);

                        var src = 'icons/'+langs[i]+'.png';

                        $('#translations').append(
                            $('<tr>').append(
                                $('<td>').append(
                                    $('<img>').attr({
                                                'src': src,
                                                'data-toggle': 'tooltip',
                                                'data-placement': 'left',
                                                'title': languages[langs[i]]
                                              })
                                    ),
                                $('<td>').append(output[langs[i]])
                            )
                        )
                            
                    }
                  })

               // }})}
                 // });
                  

                  $('#search_content').append(
                    $('<div class="search" id="search_div">').html(''));
                      /*
                      $('<img>').attr({
                                          'class': 'img_apps_first',
                                          'src': 'icons/search.png',
                                          'data-toggle': 'tooltip',
                                          'data-placement': 'left',
                                          'title': 'Search Tools'
                                          }),
                    */
                  $('#search_div').append(
                      $('<a>').attr({
                                'target': '_blank',
                                'href': 'https://www.google.com/?#q='+txt,
                                'data-toggle': 'tooltip',
                                'data-placement': 'left',
                                'title': 'Google Search'
                                }).append(
                                $('<img>').attr({
                                          'class': 'img_apps',
                                          'src': 'icons/google.png'
                                          })
                                ),
                      $('<a>').attr({
                                'target': '_blank',
                                'href': 'https://www.google.com/search?tbm=isch&q='+txt,
                                'data-toggle': 'tooltip',
                                'data-placement': 'bottom',
                                'title': 'Google Images'
                                }).append(
                                $('<img>').attr({'class': 'img_apps', 'src': 'icons/image.png'})
                                ),
                      $('<a>').attr({
                                'target': '_blank',
                                'href': 'https://www.google.com/webhp#q='+txt+'&tbm=bks',
                                'data-toggle': 'tooltip',
                                'data-placement': 'bottom',
                                'title': 'Google Books'
                                }).append(
                                $('<img>').attr({'class': 'img_apps', 'src': 'icons/books.png'})
                                ),
                      $('<a>').attr({
                                'target': '_blank',
                                'href': 'http://scholar.google.com/scholar?hl='+lang+'&q='+txt,
                                'data-toggle': 'tooltip',
                                'data-placement': 'bottom',
                                'title': 'Google Scholar'
                                }).append(
                                $('<img>').attr({'class': 'img_apps', 'src': 'icons/scholar.png'})
                                ),
                      $('<a>').attr({
                                'target': '_blank',
                                'href': 'https://www.google.com/webhp#q='+txt+'&tbm=vid',
                                'data-toggle': 'tooltip',
                                'data-placement': 'bottom',
                                'title': 'Google Videos'
                                }).append(
                                $('<img>').attr({'class': 'img_apps', 'src': 'icons/video.png'})
                                ),
                      $('<a>').attr({
                                'target': '_blank',
                                'href': 'https://www.google.com/webhp#q='+txt+'&tbm=app',
                                'data-toggle': 'tooltip',
                                'data-placement': 'bottom',
                                'title': 'Google Apps'
                                }).append(
                                $('<img>').attr({'class': 'img_apps', 'src': 'icons/apps.png'})
                                ),
                      $('<a>').attr({
                                'target': '_blank',
                                'href': 'https://'+lang+'.wikipedia.org/wiki/'+txt,
                                'data-toggle': 'tooltip',
                                'data-placement': 'bottom',
                                'title': 'Wikipedia'
                                }).append(
                                $('<img>').attr({'class': 'img_apps', 'src': 'icons/wiki.png'})
                                )
                    //)
                  );

                jQuery.ajax({
              type: 'POST',
              url: "https://public.opencpu.org/ocpu/github/loredanacirstea/ontobrowse/R/load_apps",
              data: {'uuid': '"'+id+'"', 'lang': '"'+lang+'"', 'origin': '"'+origin+'"'},
              success: function(dat) {
                  n = dat.split("\n");
                  n = "https://public.opencpu.org" + n[0] + "/json";
                  jQuery.ajax({
                      type: 'GET',
                      url: n,
                      success: function(output){

                //$.getJSON( "/apps/"+lang+"/"+id+"/origin/"+origin, function(output){

                    console.log(output);

                    if(output.length != 0){  
                      $('#apps_content').append(
                        $('<div class="apps">').append(
                            $('<img>').attr({
                                          'class': 'img_apps_first',
                                          'src': 'icons/apps.png',
                                          'data-toggle': 'tooltip',
                                          'data-placement': 'left',
                                          'title': 'Apps'
                                          })
                        )
                      );
                      for(i = 0; i < output.length; i++){
                        $('.apps').append(
                            $('<a>').attr({
                                  'target': '_blank',
                                  'href': output[i]["root_url"][0],
                                  'data-toggle': 'tooltip',
                                  'data-placement': 'bottom',
                                  'title': output[i]["name"][0]
                                  }).append(
                                  $('<img>').attr({'class': 'img_apps', 'src': output[i]["icon"][0]})
                                  )
                        );
                      }
                    }
                    }})}
                 // }
                } );
 
                    $('#tools_content').append(
                        $('<div class="plugins" id="tools_div">').html(''));
                    $('#tools_div').append(    
                            $('<a>').attr({
                                  'target': '_blank',
                                  'href': 'tools/'+lang+'/'+id+'/origin/'+origin,
                                  'data-toggle': 'tooltip',
                                  'data-placement': 'bottom',
                                  'title': 'Subject Plugins'
                                  }).append(
                                  $('<img>').attr({'class': 'img_apps', 'src': 'icons/plugin.png'})
                                  )
                            );

              } else if(data.selected.length > 1){    
                        for(i = 0, j = data.selected.length; i < j; i++) {
                            $('#transl_content').append(
                              $('<p>').append(data.instance.get_node(data.selected[i]).text[0])
                            );
                        }
                      }

                      else if(data.selected.length == 0){
                          //$('#results').html('<h3 class="ui top attached header">Select one or more terms</h3><div class="ui info message" id="event_result"></div>');
                          $('#transl_content').html('<p>Select one or more terms.</p><p>**known bug**</p><p>do not select an open node or </p><p>a node that was recently closed</p><p>*browser freezes*</p>');
                      }
          
          });
}