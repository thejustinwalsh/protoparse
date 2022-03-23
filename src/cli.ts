import * as fs from 'fs';
import yargs from 'yargs';
import { transform } from './main'

const argv = yargs
  .usage('Usage: parseproto <input> `[options]`')
  .positional('input', {
    describe: 'Input protobuf text file',
    type: 'string',
    demandOption: true,
  })
  .option('output', {
    alias: 'o',
    describe: 'Output json file',
    type: 'string',
  })
  .option('pretty', {
    alias: 'p',
    describe: 'Pretty print json output',
    type: 'boolean',
  })
  .help()
  .argv;
  
console.log(argv);

if (!argv._[0]) {
  console.error('Missing input file');
  process.exit(1);
}

const str = fs.readFileSync(argv._[0], 'utf8');
const result = transform(str);

console.log(JSON.stringify(result, null, argv.pretty ? 2 : 0));
