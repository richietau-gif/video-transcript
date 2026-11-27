import {timingSafeEqual,createHmac} from 'node:crypto';
import {cookies} from 'next/headers';
const ttl=365*86400;
function equal(a,b){a=Buffer.from(String(a||''));b=Buffer.from(String(b||''));return a.length===b.length&&timingSafeEqual(a,b)}
function sign(exp){return createHmac('sha256',process.env.TRANSCRIPT_ACCESS_PASSWORD).update('videotranscript-session:'+exp).digest('hex')}
async function authorized(){if(!process.env.TRANSCRIPT_ACCESS_PASSWORD)return false;const token=(await cookies()).get('__Host-vt_session')?.value||'';const [exp,mac]=token.split('.');return /^\d+$/.test(exp||'')&&Number(exp)>Date.now()/1000&&equal(mac,sign(exp))}
import {neon} from '@neondatabase/serverless';
import {randomUUID} from 'node:crypto';
export async function POST(req){if(!await authorized())return Response.json({error:'Přihlaste se.'},{status:401});if(!process.env.DATABASE_URL)return Response.json({error:'Sdílení čeká na připojení databáze.'},{status:503});try{const {videoId,translation}=await req.json();if(!/^[A-Za-z0-9_-]{11}$/.test(videoId||'')||typeof translation!=='string'||!translation.trim()||translation.length>300000)return Response.json({error:'Neplatný překlad.'},{status:400});const sql=neon(process.env.DATABASE_URL);await sql`CREATE TABLE IF NOT EXISTS shared_translations (id uuid PRIMARY KEY, video_id text NOT NULL, translation text NOT NULL, created_at timestamptz DEFAULT now())`;const id=randomUUID();await sql`INSERT INTO shared_translations (id,video_id,translation) VALUES (${id},${videoId},${translation})`;return Response.json({id})}catch{return Response.json({error:'Uložení překladu selhalo.'},{status:502})}}
