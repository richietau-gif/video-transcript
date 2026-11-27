import {neon} from '@neondatabase/serverless';
import {notFound} from 'next/navigation';
import Translator from '../../page';
export const dynamic='force-dynamic';
export const metadata={title:'Sdílený překlad | Richiho překladač',robots:{index:false,follow:false}};
export default async function Shared({params}){const {id}=await params;if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)||!process.env.DATABASE_URL)notFound();const sql=neon(process.env.DATABASE_URL);const [row]=await sql`SELECT id,video_id,translation,original FROM shared_translations WHERE id=${id}`;if(!row)notFound();return <Translator initial={row}/>}
