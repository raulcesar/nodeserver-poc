var ldap = require('ldapjs');
var fs = require('fs');
var moment = require('moment');

ldap.Attribute.settings.guid_format = ldap.GUID_FORMAT_B;

var client = ldap.createClient({
//  url: 'ldap://127.0.0.1/CN=test,OU=Development,DC=Home'
    url: 'ldap://dirsrvc.camara.gov.br:389'


});

var filterStrPrefix='(&(mail=*@camara.leg.br)(title=Servidor Efetivo)';
var filterStr = 'cn=p_';
var opts = {
//  filter: '(cn=P_6486)',
    //filter:'(&(OU=Usuarios)(mail=*@camara.leg.br))',
    filter:'',
  //scope: 'sub'
  scope: 'sub'
    //,
//  attributes: ['objectGUID', 'mail']
    },
    senha = process.argv[2],
    arq = process.argv[3];


var vezesmax = parseInt(process.argv[4]) || 2;
var arquivoUnico = Boolean(process.argv[5] || false);
var iniciovezes = parseInt(process.argv[6]) || 1;
var searchescomplete = 0;
var criaArquivo = function (vez) {
client.bind('P_6486@redecamara.camara.gov.br', senha, function (err) {
    if (err) {
        console.log('erro ao fazer bind');
        console.log('erro especifico: ' + err.message);
        client.unbind(function(err) {
            console.log('estou fazendo um unbind, pois ocorreu um erro: ' + err); 
        });
        return;
    }
    var callbacksearch = function(err, search) {
        search.on('searchEntry', function (entry) {
            var objeto = entry.object;
            var utc = parseInt(objeto.lastLogon)/10000;
            var day = moment(utc);
            var msg = objeto.cn+ ',' + 
                objeto.displayName + ',' + 
                objeto.givenName + ',' + 
                objeto.sn + ',' + 
                objeto.mail + ',' + 
                objeto.telephoneNumber + ',' + 
                day.format('DD/MM/YYYY - hh:mm:ss');

            fs.appendFile(arquivo, msg + '\n', function(err) {
                if (err) { 
                    console.log('deu merda: ' + JSON.stringify(err));
                } else {
                    //console.log('inclui no arquivo: ' + msg);
                }
            });

        });
        search.on('end', function(result) {
            searchescomplete ++;
            console.log('searchescomplete: ' + searchescomplete);
            console.log('vezesmax: ' + vezesmax);
            if (vezesmax === searchescomplete) {
                client.unbind(function(err){
                    if (err) {
                       console.log('erro no unbind: ' + JSON.stringify(err));
                    }
                });
                console.log('unbinding: ');
            }
        });    
    };
    
    opts.filter = filterStrPrefix + '(cn=p_' + vez + '*))';
    console.log(opts.filter);
    var arquivosufixo = '.csv';
    if (!arquivoUnico) {
        arquivosufixo = '_' + vez + '.csv';
    }

    var arquivo = arq + arquivosufixo; 

    client.search('DC=redecamara, DC=camara, DC=gov, DC=br', opts, callbacksearch); 
});
};
vezesmax += iniciovezes - 1;
for (var i = iniciovezes ; i <= vezesmax ; i++) {
    console.log('i: ' + i);
    criaArquivo(i);
}


