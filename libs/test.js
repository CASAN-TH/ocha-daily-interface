// var a = btoa('thamturakit');
// console.log(Buffer.from('thamturakit').toString('base64'));
// password -> md5 -> btoa
var n = function(e) {
    console.log(e);
    for (var t = "", n = 0; n < e.length; n += 2) t += String.fromCharCode(parseInt(e.substr(n, 2), 16));
    console.log(t);
    return t
}
var md5 = require('js-md5');
var sha1 = require('sha1');
var sha256 = require('sha256');
var utf8 = require('utf8');
var md5Pass = md5('thamturakit');
var t1 = sha256(md5Pass + 'T4oOK7O1');
var t2 = sha256(t1 + 'j4H3DUkCOFniO5RAFvsij56UEMHgsmiz');
var md5Key = n(t2);
console.log(Buffer.from(md5Pass).toString('base64'));
console.log(Buffer.from(md5Key).toString('base64'));
// console.log(md5Pass. + 'T4oOK7O1');
//113 238 148 173 71 55 230 165 155 48 27 111 87 238 135 180 
