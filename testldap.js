var ldap = require('ldapjs');

ldap.Attribute.settings.guid_format = ldap.GUID_FORMAT_B;

var client = ldap.createClient({
//  url: 'ldap://127.0.0.1/CN=test,OU=Development,DC=Home'
    url: 'ldap://dirsrvc.camara.gov.br:389'


});

var opts = {
  filter: '(cn=P_6486)',
  scope: 'sub',
  attributes: ['objectGUID', 'mail']
},
senha = process.argv[2];

client.bind('P_6486@redecamara.camara.gov.br', senha, function (err) {
    if (err) {
        console.log('erro ao fazer bind');
        console.log('erro especifico: ' + err.message);
        client.unbind(function(err) {
            console.log('estou fazendo um unbind, pois ocorreu um erro.'); 
        });
        return;
        throw new Error(err.message);
    }
  client.search('DC=redecamara, DC=camara, DC=gov, DC=br', opts, function (err, search) {
    search.on('searchEntry', function (entry) {
      var user = entry.object;
      console.log(user);
      client.unbind(function(err){}); 
    });
  });
});
