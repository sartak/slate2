const { app, ipcMain: ipc, shell } = require('electron');
const os = require('os');
const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const requireFromString = require('require-from-string');
const { exec } = require('child_process');

const SLATE2_HOME = "/Users/shawn/devel/slate2"; // @Fix: app.getAppPath()

ipc.on('build-project', (event, project) => {
  const {sender} = event;

  makeTempDir('src').then((tmpDir) => {
    const buildWithWebpack = buildWithExternalWebpack;
    buildWithWebpack(project, tmpDir).then((directory, warnings) => {
      if (shell.openItem(directory)) {
        event.reply('build-project-success', directory, warnings);
      } else {
        event.reply('build-project-error', new Error(`Unable to open ${tmpDir}`));
      }
    }).catch((err) => {
      event.reply('build-project-error', err);
    });
  }).catch((err) => {
    event.reply('build-project-error', err);
  });
});

const additionalBuildEnvironment = (isExternal) => {
  if (isExternal) {
    return {
      SLATE2_HOME,
      NODE_PATH: path.resolve(SLATE2_HOME, 'node_modules'),
    };
  } else {
    return {
      SLATE2_HOME,
    };
  }
};

const buildWithLiveWebpack = (project, tmpDir) => {
  const srcDir = path.join(tmpDir, 'src');
  const distDir = path.join(tmpDir, 'dist');

  return Promise.all([
    [tmpDir, 'webpack.config.js', project.webpackConfig],
    [srcDir, 'game.js', project.code],
    [srcDir, 'index.html', project.indexHtml],
  ].map((args) => saveFile(...args))).then(() => {
    process.chdir(tmpDir);

    Object.entries(additionalBuildEnvironment(false)).forEach(([name, value]) => {
      process.env[name] = value;
    });

    return new Promise((resolve, reject) => {
      const config = requireFromString(project.webpackConfig, 'webpack.config.js', {
        appendPaths: [path.resolve(SLATE2_HOME, 'node_modules')],
      });

      webpack(config, (err, stats) => {
        if (err) {
          return reject(err);
        }

        const info = stats.toJson();
        if (stats.hasErrors()) {
          return reject(info.errors);
        }

        resolve(distDir, stats.hasWarnings ? info.warnings : null);
      });
    });
  });
};

const buildWithExternalWebpack = (project, tmpDir) => {
  const srcDir = path.join(tmpDir, 'src');
  const distDir = path.join(tmpDir, 'dist');

  return Promise.all([
    [tmpDir, 'webpack.config.js', project.webpackConfig],
    [srcDir, 'game.js', project.code],
    [srcDir, 'index.html', project.indexHtml],
  ].map((args) => saveFile(...args))).then(() => {
    return new Promise((resolve, reject) => {
      exec(path.resolve(SLATE2_HOME, 'node_modules', '.bin', 'webpack'), {
        cwd: tmpDir,
        env: {
          ...process.env,
          ...additionalBuildEnvironment(true),
        },
      }, (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          console.error('stderr: ', stderr);
          console.log('stdout: ', stdout);
          return reject(error);
        }

        console.error('stderr: ', stderr);
        console.log('stdout: ', stdout);
        resolve(distDir);
      });
    });
  });
};

const makeTempDir = (subdir) => {
  return new Promise((resolve, reject) => {
    const topDir = os.tmpdir();
    fs.mkdtemp(`${topDir}${path.sep}`, (err, directory) => {
      if (err) {
        reject(err);
      }

      const time = String(Date.now());
      const tmpDir = path.join(topDir, 'slate2', time);
      const dirToMake = subdir ? path.join(tmpDir, subdir) : tmpDir;

      fs.mkdir(dirToMake, { recursive: true }, (err) => {
        if (err) {
          reject(err);
        }
        resolve(tmpDir);
      });
    });
  });
};

const saveFile = (directory, filename, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(directory, filename), content, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  });
};
