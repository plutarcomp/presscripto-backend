const fs = require('fs');
const semver = require('semver');
const path = require('path');

// Ruta al archivo package.json
const packageJsonPath = path.join(__dirname, '..', 'package.json');  // Correcta ruta a package.json

// Función para actualizar la versión en el archivo package.json
function updateVersion() {
  // Leer el archivo package.json
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  // Incrementar la versión (por ejemplo, incrementando el patch)
  const newVersion = semver.inc(packageJson.version, 'patch');  // Usa 'minor' o 'major' si prefieres

  // Actualizar la versión en el archivo package.json
  packageJson.version = newVersion;

  // Escribir el archivo package.json con la nueva versión
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

}

// Exportamos la función
module.exports = updateVersion;