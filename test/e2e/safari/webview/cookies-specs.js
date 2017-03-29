import { loadWebView } from '../../helpers/webview';
import env from '../../helpers/env';
import { initSession, deleteSession, MOCHA_TIMEOUT } from '../../helpers/session2';
import { SAFARI_CAPS } from '../../desired';


describe('safari - webview - cookies', function () {
  this.timeout(MOCHA_TIMEOUT);

  let driver;
  before(async () => {
    driver = await initSession(SAFARI_CAPS);
  });
  after(async () => {
    await deleteSession();
  });
  beforeEach(async () => await loadWebView(SAFARI_CAPS, driver));

  describe('within iframe webview', function () {
    it('should be able to get cookies for a page with none', async () => {
      await loadWebView(SAFARI_CAPS, driver, env.TEST_END_POINT + 'iframes.html', 'Iframe guinea pig');
      await driver.deleteAllCookies();
      await driver.get(env.TEST_END_POINT);
      (await driver.allCookies()).should.have.length(0);
    });
  });

  describe('within webview', function () {
    it('should be able to get cookies for a page', async () => {
      let cookies = await driver.allCookies();
      cookies.length.should.equal(2);
      cookies[0].name.should.equal('guineacookie1');
      cookies[0].value.should.equal('i am a cookie value');
      cookies[1].name.should.equal('guineacookie2');
      cookies[1].value.should.equal('cookié2');
    });

    it('should be able to set a cookie for a page', async () => {
      let newCookie = {
        name: `newcookie`,
        value: `i'm new here`
      };

      await driver.deleteCookie(newCookie.name);
      let cookies = await driver.allCookies();
      cookies.map((c) => c.name).should.not.include(newCookie.name);
      cookies.map((c) => c.value).should.not.include(newCookie.value);

      await driver.setCookie(newCookie);
      cookies = await driver.allCookies();
      cookies.map((c) => c.name).should.include(newCookie.name);
      cookies.map((c) => c.value).should.include(newCookie.value);
      // should not clobber old cookies
      cookies.map((c) => c.name).should.include('guineacookie1');
      cookies.map((c) => c.value).should.include('i am a cookie value');
    });

    it('should be able to set a cookie with expiry', async () => {
      let newCookie = {
        name: `newcookie`,
        value: `i'm new here`
      };
      newCookie.expiry = parseInt(Date.now() / 1000, 10) - 1000; // set cookie in past

      await driver.deleteCookie(newCookie.name);
      let cookies = await driver.allCookies();
      cookies.map((c) => c.name).should.not.include(newCookie.name);
      cookies.map((c) => c.value).should.not.include(newCookie.value);

      await driver.setCookie(newCookie);
      cookies = await driver.allCookies();
      // should not include cookie we just added because of expiry
      cookies.map((c) => c.name).should.not.include(newCookie.name);
      cookies.map((c) => c.value).should.not.include(newCookie.value);
      // should not clobber old cookies
      cookies.map((c) => c.name).should.include('guineacookie1');
      cookies.map((c) => c.value).should.include('i am a cookie value');
    });

    it('should be able to delete one cookie', async () => {
      var newCookie = {
        name: `newcookie`,
        value: `i'm new here`
      };

      await driver.deleteCookie(newCookie.name);
      let cookies = await driver.allCookies();
      cookies.map((c) => c.name).should.not.include(newCookie.name);
      cookies.map((c) => c.value).should.not.include(newCookie.value);

      await driver.setCookie(newCookie);
      cookies = await driver.allCookies();
      cookies.map((c) => c.name).should.include(newCookie.name);
      cookies.map((c) => c.value).should.include(newCookie.value);

      await driver.deleteCookie('newcookie');
      cookies = await driver.allCookies();
      cookies.map((c) => c.name).should.not.include(newCookie.name);
      cookies.map((c) => c.value).should.not.include(newCookie.value);
    });

    it('should be able to delete all cookie', async () => {
      let newCookie = {
        name: `newcookie`,
        value: `i'm new here`
      };

      await driver.deleteCookie(newCookie.name);
      let cookies = await driver.allCookies();
      cookies.map((c) => c.name).should.not.include(newCookie.name);
      cookies.map((c) => c.value).should.not.include(newCookie.value);

      await driver.setCookie(newCookie);
      cookies = await driver.allCookies();
      cookies.map((c) => c.name).should.include(newCookie.name);
      cookies.map((c) => c.value).should.include(newCookie.value);

      await driver.deleteAllCookies();
      cookies = await driver.allCookies();
      cookies.length.should.equal(0);
    });
  });
});
