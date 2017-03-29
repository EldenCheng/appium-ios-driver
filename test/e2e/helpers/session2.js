import wd from 'wd';
import { server as baseServer, routeConfiguringFunction } from 'appium-base-driver';
import { logger } from 'appium-support';
import { IosDriver } from '../../..';


const log = logger.getLogger('ios-tests');

const HOST = '0.0.0.0',
      PORT = 4994;
const MOCHA_TIMEOUT = 60 * 1000 * (process.env.TRAVIS ? 8 : 4);

let driver, server;

async function initDriver () {
  driver = wd.promiseChainRemote(HOST, PORT);
  server = await startServer(PORT, HOST);

  return driver;
}

async function initSession (caps) {
  await initDriver();
  let serverRes = await driver.init(caps);
  if (!caps.udid && !caps.fullReset && serverRes[1].udid) {
    caps.udid = serverRes[1].udid;
  }

  await driver.setImplicitWaitTimeout(5000);

  return driver;
}

async function deleteSession () {
  try {
    await driver.quit();
  } catch (ign) {}
  try {
    await server.close();
  } catch (ign) {}
}

async function startServer (port, address) {
  let d = new IosDriver({port, address});
  let router = routeConfiguringFunction(d);
  let server = await baseServer(router, port, address);
  log.info(`IosDriver server listening on http://${address}:${port}`);
  return server;
}

export { startServer, initDriver, initSession, deleteSession, HOST, PORT, MOCHA_TIMEOUT };
