import Database from 'better-sqlite3';
import { createClient } from '@libsql/client';

const migrate = async () => {
    try {
        console.log("Leyendo base de datos local (SQLite)...");
        const localDb = new Database('database.sqlite', { readonly: true });
        const templates = localDb.prepare('SELECT * FROM templates').all();
        console.log(`¡Encontradas ${templates.length} plantillas locales!`);

        if (templates.length === 0) {
            console.log("No hay plantillas que migrar.");
            return;
        }

        console.log("Conectando a Turso...");
        const tursoDb = createClient({
            url: 'libsql://app-email-edilior21.aws-us-east-2.turso.io',
            authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzMzMjU2MTEsImlkIjoiMDE5Y2UyNzAtYjEwMS03NDU4LWI2YjgtZWNhNjNlMmYxOGMwIiwicmlkIjoiNjM5NzhlM2YtY2UxZS00OGI2LTg0ZjYtMzVjYjlmMzZmOWZkIn0.sbT5sBjoSiejRcFOogIAjQ45bvg_q6eYEmMGgeIGcd5ll0yi4_06n4QB_MIAJEI5FfJccF491l5tfz7qOJ7xBA',
        });

        console.log("Migrando datos a la nube...");
        
        for (const t of templates) {
            await tursoDb.execute({
                sql: `
                  INSERT INTO templates (id, title, lastEdited, category, status, icon, htmlBody, "to", subject, created_at)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                  ON CONFLICT(id) DO NOTHING
                `,
                args: [
                    t.id, t.title, t.lastEdited, t.category, t.status, 
                    t.icon, t.htmlBody, t.to, t.subject, t.created_at
                ]
            });
        }
        
        console.log("¡Migración completada con éxito!");
        
    } catch(err) {
        console.error("Error durante la migración:", err);
    }
};

migrate();
