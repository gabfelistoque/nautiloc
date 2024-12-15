const fs = require('fs');
const path = require('path');

// Criar diretório /tmp se não existir
if (!fs.existsSync('/tmp')) {
  fs.mkdirSync('/tmp');
}

// Criar arquivo app.db vazio
fs.writeFileSync('/tmp/app.db', '');
