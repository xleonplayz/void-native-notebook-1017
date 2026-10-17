const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
function send(res,status,value,type='application/json') {res.writeHead(status,{'Content-Type':type,'Cache-Control':'no-store'});res.end(type==='application/json'?JSON.stringify(value):value)}
async function body(req){let s='';for await(const chunk of req){s+=chunk;if(s.length>4096)throw new Error('Request exceeds 4096 bytes')}return JSON.parse(s||'{}')}
function staticFile(req,res){if(req.url==='/'||req.url==='/style.css'){const f=req.url==='/'?'index.html':'style.css';send(res,200,fs.readFileSync(path.join(__dirname,'public',f)),f==='index.html'?'text/html; charset=utf-8':'text/css');return true}return false}
const Database = require('better-sqlite3');
let database;
function db(){if(!database){database=new Database(process.env.DB_PATH||'notebook.db');database.pragma('journal_mode = WAL');database.exec('CREATE TABLE IF NOT EXISTS notes (id INTEGER PRIMARY KEY, title TEXT NOT NULL, done INTEGER NOT NULL DEFAULT 0)')}return database}
http.createServer(async(req,res)=>{try{
 if(staticFile(req,res))return;
 if(req.url==='/api/notes'&&req.method==='GET')return send(res,200,{notes:db().prepare('SELECT id,title,done FROM notes ORDER BY id').all(),storage:'sqlite-file'});
 if(req.url==='/api/notes'&&req.method==='POST'){const {title}=await body(req);if(typeof title!=='string'||!title.trim()||title.length>100)return send(res,422,{error:'Title must contain 1–100 characters'});const r=db().prepare('INSERT INTO notes(title) VALUES (?)').run(title.trim());console.log('SQLite note committed',Number(r.lastInsertRowid));return send(res,201,{id:Number(r.lastInsertRowid),title:title.trim(),done:0})}
 const match=req.url.match(/^\/api\/notes\/(\d+)$/);
 if(match&&req.method==='PATCH'){const {done}=await body(req);if(typeof done!=='boolean')return send(res,422,{error:'done must be boolean'});const r=db().prepare('UPDATE notes SET done=? WHERE id=?').run(done?1:0,Number(match[1]));return send(res,r.changes?200:404,{updated:r.changes})}
 if(match&&req.method==='DELETE'){const r=db().prepare('DELETE FROM notes WHERE id=?').run(Number(match[1]));return send(res,r.changes?200:404,{deleted:r.changes})}
 send(res,404,{error:'Not found'});
 }catch(e){console.error('SQLite failed',e.code,e.message);send(res,500,{error:e.message,code:e.code||'SQLITE_ERROR'})}
}).listen(Number(process.env.PORT)||3243,'0.0.0.0',()=>console.log('Reading notebook ready'));
