import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';

// The local preview and integration tests use the deployed SQL schema.
export function previewDatabase() {
  const sqlite=new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../drizzle/0000_world_league.sql',import.meta.url),'utf8'));
  return {
    prepare(sql){
      const statement=sqlite.prepare(sql);
      return {bind(...values){
        return {
          first:async()=>statement.get(...values)||null,
          all:async()=>({results:statement.all(...values)}),
          run:async()=>({meta:statement.run(...values)})
        };
      }};
    }
  };
}
