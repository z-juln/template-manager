import { debug as createDebug } from 'debug';

const debug = createDebug('tpl-manager');

export const isDebug = process.env.DEBUG === 'tpl-manager';

export default debug;
