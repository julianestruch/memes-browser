const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../../data/clipsearch.db');
const db = new sqlite3.Database(dbPath);

function basename(p) {
  if (!p) return '';
  return p.split(/[\\\/]/).pop();
}

db.serialize(() => {
  db.all('SELECT id, file_path, thumbnail_path FROM clips', (err, rows) => {
    if (err) {
      console.error('Error leyendo la base de datos:', err);
      process.exit(1);
    }
    rows.forEach(row => {
      const file = basename(row.file_path);
      const thumb = basename(row.thumbnail_path);
      db.run('UPDATE clips SET file_path = ?, thumbnail_path = ? WHERE id = ?', [file, thumb, row.id], (err) => {
        if (err) {
          console.error('Error actualizando registro:', err);
        }
      });
    });
    console.log('¡Actualización de paths completada!');
  });
});

db.close(); 