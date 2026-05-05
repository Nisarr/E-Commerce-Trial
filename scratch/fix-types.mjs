import fs from 'fs';
const path = 'functions/api/[[route]].ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/\.map\(r =>/g, '.map((r: any) =>');
content = content.replace(/\.map\(item =>/g, '.map((item: any) =>');
content = content.replace(/\.reduce\(\(sum, r\)/g, '.reduce((sum: number, r: any)');
content = content.replace(/sum, item/g, 'sum: number, item: any');
content = content.replace(/\(a, b\) =>/g, '(a: any, b: any) =>');
content = content.replace(/\(cat, { eq, and }\) =>/g, '(cat: any, { eq, and }: any) =>');

fs.writeFileSync(path, content);
console.log('Fixed types in [[route]].ts');
