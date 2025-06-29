const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, '../../data/clipsearch.db');
const videosDir = path.join(__dirname, '../../uploads/videos');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.all('SELECT id, file_path FROM clips', (err, rows) => {
    if (err) {
      console.error('Error leyendo la base de datos:', err);
      process.exit(1);
    }
    let deleted = 0;
    rows.forEach(row => {
      const videoPath = path.join(videosDir, row.file_path);
      if (!fs.existsSync(videoPath)) {
        db.run('DELETE FROM clips WHERE id = ?', [row.id], (err) => {
          if (err) {
            console.error('Error eliminando registro:', err);
          } else {
            deleted++;
          }
        });
      }
    });
    setTimeout(() => {
      console.log(`¡Limpieza completada! Clips eliminados: ${deleted}`);
      db.close();
    }, 1000);
  });
}); 