// TESTS: for paper._polygon, paper._star

var TEST = function(cb, args) {
	var rt = [];
	for (var i=0; i<Math.pow(2,args.length); i++) {
		var carg = [];
		var t = i;
		var m = 1;
		for (var j=0; j<args.length; j++) {
			var t1 = t & m;
			if (t1)
				carg.push(args[j]);
			else
				carg.push(args[j]-1);
			m <<= 1;
		}
				
		var r = cb.apply(paper,carg);
		//console.log(paper);
		rt.push(r);
	}
			
	return rt;
};

var pr = TEST(paper._polygon,[0,0,3,0]);
var sr = TEST(paper._star,[0,0,3,0,0]);
document.write(pr+'</br>');
document.write(sr);
console.log(pr);
console.log(sr);
