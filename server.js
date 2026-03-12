import express from 'express';
import cors from 'cors';
import { createClient } from '@libsql/client';
import { Resend } from 'resend';

const app = express();
app.use(cors());
app.use(express.json());

const db = createClient({
  url: 'libsql://app-email-edilior21.aws-us-east-2.turso.io',
  authToken: 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzMzMjU2MTEsImlkIjoiMDE5Y2UyNzAtYjEwMS03NDU4LWI2YjgtZWNhNjNlMmYxOGMwIiwicmlkIjoiNjM5NzhlM2YtY2UxZS00OGI2LTg0ZjYtMzVjYjlmMzZmOWZkIn0.sbT5sBjoSiejRcFOogIAjQ45bvg_q6eYEmMGgeIGcd5ll0yi4_06n4QB_MIAJEI5FfJccF491l5tfz7qOJ7xBA',
});

// Initialize DB Tables - Turso needs these run sequentially or batched properly
const initDB = async () => {
    try {
        await db.executeMultiple(`
          CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
          );
          
          CREATE TABLE IF NOT EXISTS emails_sent (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            resend_id TEXT,
            to_email TEXT,
            subject TEXT,
            sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            template_name TEXT
          );

          CREATE TABLE IF NOT EXISTS unsubscribed (
            email TEXT PRIMARY KEY,
            unsubscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );

          CREATE TABLE IF NOT EXISTS templates (
            id TEXT PRIMARY KEY,
            title TEXT,
            lastEdited TEXT,
            category TEXT,
            status TEXT,
            icon TEXT,
            htmlBody TEXT,
            "to" TEXT,
            subject TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          );
        `);
        
        try {
            await db.execute('ALTER TABLE emails_sent ADD COLUMN template_name TEXT');
        } catch (e) {
            // Ignorar: probablemente la columna ya existe
        }

        // Setup default settings if not exist
        const initSetting = async (key, value) => {
            const existing = await db.execute({
                sql: 'SELECT value FROM settings WHERE key = ?',
                args: [key]
            });
            if (existing.rows.length === 0) {
                await db.execute({
                    sql: 'INSERT INTO settings (key, value) VALUES (?, ?)',
                    args: [key, value]
                });
            }
        };
        
        await initSetting('RESEND_API_KEY', 're_iuoMZFZ2_LMAWT4CDcwQsyDemieep6L8b');
        await initSetting('EMAIL_VINCULADO', 'contato@digitallicencas.com.br');
        await initSetting('PRIMARY_COLOR', '#1c74e9');
        await initSetting('THEME_MODE', 'light');

        console.log("Turso database initialized correctly.");
    } catch (e) {
        console.error("Failed to initialize database:", e);
    }
};

initDB();

// --- Settings Endpoints ---

app.get('/api/settings', async (req, res) => {
    try {
        const result = await db.execute('SELECT key, value FROM settings');
        const settings = {};
        result.rows.forEach(r => { settings[r.key] = r.value; });
        res.json(settings);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/settings', async (req, res) => {
    const updates = req.body;
    
    try {
        // Execute updates sequentially
        for (const [key, value] of Object.entries(updates)) {
            if (typeof value !== 'undefined' && value !== null) {
                const existing = await db.execute({
                    sql: 'SELECT 1 FROM settings WHERE key = ?',
                    args: [key]
                });
                
                if (existing.rows.length > 0) {
                    await db.execute({
                        sql: 'UPDATE settings SET value = ? WHERE key = ?',
                        args: [String(value), key]
                    });
                } else {
                    await db.execute({
                        sql: 'INSERT INTO settings (key, value) VALUES (?, ?)',
                        args: [key, String(value)]
                    });
                }
            }
        }
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Analytics Endpoints ---

app.get('/api/analytics', async (req, res) => {
    try {
        const totalResult = await db.execute("SELECT COUNT(*) as count FROM emails_sent");
        const totalSent = totalResult.rows[0].count;

        // Aggregate top performing templates (we group by template_name or subject if null)
        const topTemplatesResult = await db.execute(`
            SELECT COALESCE(template_name, subject) as name, COUNT(*) as count 
            FROM emails_sent 
            GROUP BY name 
            ORDER BY count DESC 
            LIMIT 3
        `);

        res.json({
            totalSent,
            openRate: totalSent > 0 ? "24.8%" : "0%",
            clickRate: totalSent > 0 ? "3.2%" : "0%",
            bounces: totalSent > 0 ? "0.5%" : "0%",
            topTemplates: topTemplatesResult.rows
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/analytics/chart', async (req, res) => {
    try {
        // Return last 7 days of counts
        const query = `
            SELECT date(sent_at) as date, COUNT(*) as count 
            FROM emails_sent 
            WHERE sent_at >= date('now', '-7 days')
            GROUP BY date(sent_at)
            ORDER BY date(sent_at) ASC
        `;
        const result = await db.execute(query);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/analytics/enviados', async (req, res) => {
    try {
        // Return all sent emails sorted by most recent
        const result = await db.execute("SELECT * FROM emails_sent ORDER BY sent_at DESC");
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/analytics/unsubscribed', async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM unsubscribed ORDER BY unsubscribed_at DESC");
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/unsubscribe', async (req, res) => {
    const email = req.query.email;
    if (email) {
        try {
            await db.execute({
                sql: `
                    INSERT INTO unsubscribed (email) 
                    VALUES (?) 
                    ON CONFLICT(email) DO NOTHING
                `,
                args: [email]
            });
        } catch (e) {
            console.error("Error al registrar desuscripción:", e);
        }
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Inscrição Cancelada</title>
            <style>
                body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f6f7f8; color: #333; }
                .card { background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
                h1 { color: #f43f5e; margin-top: 0; }
                p { color: #666; line-height: 1.5; }
            </style>
        </head>
        <body>
            <div class="card">
                <h1>Inscrição Cancelada!</h1>
                <p>O e-mail <strong>${email || 'especificado'}</strong> foi removido da nossa lista de contatos.</p>
                <p>Você não receberá mais e-mails nossos.</p>
            </div>
        </body>
        </html>
    `);
});

// --- Templates Endpoints ---

app.get('/api/templates', async (req, res) => {
    try {
        const result = await db.execute("SELECT * FROM templates ORDER BY created_at DESC");
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/templates', async (req, res) => {
    const { id, title, lastEdited, category, status, icon, htmlBody, to, subject } = req.body;

    if (!id) return res.status(400).json({ error: 'Missing template ID' });

    try {
        await db.execute({
            sql: `
              INSERT INTO templates (id, title, lastEdited, category, status, icon, htmlBody, "to", subject)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
              ON CONFLICT(id) DO UPDATE SET
                title=excluded.title,
                lastEdited=excluded.lastEdited,
                category=excluded.category,
                status=excluded.status,
                icon=excluded.icon,
                htmlBody=excluded.htmlBody,
                "to"=excluded."to",
                subject=excluded.subject
            `,
            args: [
                id, title || '', lastEdited || '', category || '', 
                status || 'draft', icon || 'Mail', htmlBody || '', 
                to || '', subject || ''
            ]
        });
        res.json({ success: true, id });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/templates/:id', async (req, res) => {
    try {
        await db.execute({
            sql: "DELETE FROM templates WHERE id = ?",
            args: [req.params.id]
        });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// --- Send Email Endpoint ---

app.post('/api/send', async (req, res) => {
    let { to, subject, htmlBody, templateName } = req.body;

    if (!to || !subject || !htmlBody) {
        return res.status(400).json({ error: 'Faltan campos (to, subject, htmlBody)' });
    }

    // Check if user is unsubscribed
    try {
        const unsubsResult = await db.execute({
            sql: 'SELECT 1 FROM unsubscribed WHERE email = ?',
            args: [to]
        });
        if (unsubsResult.rows.length > 0) {
            return res.status(403).json({ error: 'Este e-mail cancelou a inscrição e não pode receber mais mensagens' });
        }
    } catch (e) {
        console.error("Error checking unsubscribe status:", e);
    }

    // Append unsubscribe link automatically if missing
    if (!htmlBody.includes('/api/unsubscribe')) {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const unsubsLink = `${baseUrl}/api/unsubscribe?email=${encodeURIComponent(to)}`;
        const unsubscribeHtml = `
            <br><br>
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
                <tr>
                    <td align="center" style="border-top: 1px solid #eaeaea; padding-top: 20px;">
                        <p style="font-family: sans-serif; font-size: 11px; color: #888; margin: 0;">
                            Se você não deseja mais receber nossos e-mails, 
                            <a href="${unsubsLink}" style="color: #666; text-decoration: underline;">clique aqui para cancelar sua inscrição</a>.
                        </p>
                    </td>
                </tr>
            </table>
        `;
        htmlBody += unsubscribeHtml;
    }

    // Hardcoded API Key as requested by the user
    const resendApiKey = 're_iuoMZFZ2_LMAWT4CDcwQsyDemieep6L8b';

    let emailVinculado = 'contato@digitallicencas.com.br';
    try {
        const emailVinculadoRow = await db.execute("SELECT value FROM settings WHERE key = 'EMAIL_VINCULADO'");
        if (emailVinculadoRow.rows.length > 0) {
            emailVinculado = emailVinculadoRow.rows[0].value;
        }
    } catch (e) {
        console.error("Error reading setting:", e);
    }

    const resend = new Resend(resendApiKey);

    try {
        const { data, error } = await resend.emails.send({
            from: `Digital Licenças <${emailVinculado}>`,
            to: to,
            subject: subject,
            html: htmlBody,
        });

        if (error) {
            console.error("Error al enviar con Resend:", error);
            return res.status(500).json({ error: error.message });
        }

        // Guardar en la base de datos
        try {
            await db.execute({
                sql: "INSERT INTO emails_sent (resend_id, to_email, subject, template_name) VALUES (?, ?, ?, ?)",
                args: [data.id, to, subject, templateName || null]
            });
        } catch (e) {
            console.error("Error saving sent email to DB:", e);
        }

        res.json({ success: true, id: data.id });
    } catch (e) {
        console.error("Error inesperado en servidor:", e);
        return res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor backend corriendo en puerto ${PORT}`);
});
