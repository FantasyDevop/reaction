import fs from 'fs';
import path from 'path';
import Log from './logger.mjs';
import { exists, getDirectories } from './fs.mjs';

// add a message to the top of the plugins import file
const importFileMessage = `
/**
 * ***** DO NOT EDIT THIS FILE MANUALLY *****
 * This file is generated automatically by the Reaction
 * style loader and will be reset at each startup.
 */
`;

/**
 * Create a plugin imports file on client or server
 * @param  {String} file - absolute path to file to write
 * @param  {Array} imports - array of import path strings
 * @return {Boolean} returns true if no error
 */
function generateImportsFile(file, imports) {
  // Don't create a file if there is nothing to import.
  // This prevents the need to have to include all
  // css preprocessors since CSS / LESS is predominately used
  if (imports.length) {
    // create/reset imports file
    try {
      fs.writeFileSync(file, '');
      fs.writeFileSync(file, importFileMessage);
    } catch (e) {
      Log.error(`Failed to reset plugins file at ${file}`);
      process.exit(1);
    }

    // populate plugins file with imports
    imports.forEach((importPath) => {
      try {
        fs.appendFileSync(file, `@import "${importPath}";\n`);
      } catch (e) {
        Log.error(`Failed to write to plugins file at ${importPath}`);
        process.exit(1);
      }
    });
  }
}


/**
 * Import Reaction plugins
 * @param {String} baseDirPath - path to a plugins sub-directory (core/included/custom)
 * @return {Object} - returns object with client, server, and registry path arrays
 */
function getImportPaths(baseDirPath) {

  // get app root path
  const appRoot = path.resolve('.').split('.meteor')[0];

  // create the import path
  const getImportPath = (pluginFile) => {
    const importPath = '/' + path.relative(appRoot, pluginFile);
    return importPath.replace(/\\/g, '/');
  };

  // get all plugin directories at provided base path
  const pluginDirs = getDirectories(baseDirPath);

  const cssImportPaths = [];
  const lessImportPaths = [];
  const stylusImportPaths = [];
  const scssImportPaths = [];

  // read registry.json and require server/index.js if they exist
  pluginDirs.forEach((plugin) => {
    const cssImport = baseDirPath + plugin + '/client/index.css';
    const lessImport = baseDirPath + plugin + '/client/index.less';
    const stylusImport = baseDirPath + plugin + '/client/index.styl';
    const scssImport = baseDirPath + plugin + '/client/index.scss';

    // import the client CSS files if they exist
    if (exists(cssImport)) {
      cssImportPaths.push(getImportPath(cssImport));
    }

    // import the client LESS files if they exist
    if (exists(lessImport)) {
      lessImportPaths.push(getImportPath(lessImport));
    }

    // import the client STYLUS files if they exist
    if (exists(stylusImport)) {
      stylusImportPaths.push(getImportPath(stylusImport));
    }

    // import the client SCSS files if they exist
    if (exists(scssImport)) {
      scssImportPaths.push(getImportPath(scssImport));
    }
  });

  return {
    css: cssImportPaths,
    less: lessImportPaths,
    stylus: stylusImportPaths,
    scss: scssImportPaths
  };
}


/**
 * Define base plugin paths
 */
const pluginsPath = path.resolve('.').split('.meteor')[0] + '/imports/plugins/';
const corePlugins = pluginsPath + 'core/';
const includedPlugins = pluginsPath + 'included/';
const customPlugins = pluginsPath + 'custom/';


export default function loadStyles() {
  // get style imports from each plugin directory
  const core = getImportPaths(corePlugins);
  const included = getImportPaths(includedPlugins);
  const custom = getImportPaths(customPlugins);

  // concat all imports
  const cssImports = [].concat(core.css, included.css, custom.css);
  const lessImports = [].concat(core.less, included.less, custom.less);
  const stylusImports = [].concat(core.stylus, included.stylus, custom.stylus);
  const scssImports = [].concat(core.scss, included.scss, custom.scss);

  const appRoot = path.resolve('.').split('.meteor')[0];

  // create style import files on client and write import statements
  generateImportsFile(appRoot + '/client/plugins.css', cssImports);
  generateImportsFile(appRoot + '/client/plugins.less', lessImports);
  generateImportsFile(appRoot + '/client/plugins.styl', stylusImports);
  generateImportsFile(appRoot + '/client/plugins.scss', scssImports);
}
