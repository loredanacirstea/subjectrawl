languages = {
	"la" :"Latin",
	"en" : "English",
	"es" : "Spanish",
	"jp" : "Japanese",
	"ro" : "Romanian",
	"code" : "Official Ids"
}

Array.prototype.unique = function() {
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
 
oc = function oc(a) {
  var o = {};
  for(var i=0;i<a.length;i++)
  {
    o[a[i]]='';
  }
  return o;
}

idsToString = function idsToString(cursor){
	var result = [];
	cursor.forEach(function(ont){
		result.push(ont);
		result[result.length-1]._id = result[result.length-1]._id._str;
	});
	return result;
}