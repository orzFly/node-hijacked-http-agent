"use strict";

const expect = require('chai').expect;
const lib = require('..');
const http = require('http');
const https = require('https');
require('isomorphic-fetch');

const assertHijackedContent = function(i) {
  expect(i).to.include("<h1>Example Domain</h1>");
}

const assertOriginalContent = function(i) {
  expect(i).to.include("<h1>httpbin(1)");
}

describe('hijacked-http-agent', () => {

  describe('HijackedHttpAgent', () => {

    const tryHttpGetWithAgent = function(agent, callback) {
      http.get({
        hostname: 'httpbin.org',
        port: 80,
        path: '/',
        agent: agent
      }, (res) => {
        let rawData = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          callback(rawData);
        });
      });
    }

    it('can be used without mapping', (done) => {
      const agent = new lib.HijackedHttpAgent();
      tryHttpGetWithAgent(agent, (data) => {
        assertOriginalContent(data);
        done();
      });
    });

    it('can be used with domain mapping object', (done) => {
      const agent = new lib.HijackedHttpAgent();
      agent.domainMap = {
        "httpbin.org": "example.com"
      };
      tryHttpGetWithAgent(agent, (data) => {
        assertHijackedContent(data);
        done();
      });
    });

    it('can be used with domain mapping Map object', (done) => {
      const agent = new lib.HijackedHttpAgent();
      agent.domainMap = new Map();
      agent.domainMap.set("httpbin.org", "example.com");
      tryHttpGetWithAgent(agent, (data) => {
        assertHijackedContent(data);
        done();
      });
    });

    it('can be used with domain mapping function', (done) => {
      const agent = new lib.HijackedHttpAgent();
      let called = false;
      agent.domainMap = (domain) => {
        called = true;
        if ((domain) == "httpbin.org")
          return "example.com";
      };
      tryHttpGetWithAgent(agent, (data) => {
        assertHijackedContent(data);
        done();
      });
    });

  });

  describe('HijackedHttpsAgent', () => {

    const tryHttpsGetWithAgent = function(agent, callback) {
      https.get({
        hostname: 'httpbin.org',
        port: 443,
        path: '/',
        agent: agent
      }, (res) => {
        let rawData = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => { rawData += chunk; });
        res.on('end', () => {
          callback(rawData);
        });
      });
    }

    it('can be used without mapping', (done) => {
      const agent = new lib.HijackedHttpsAgent();
      tryHttpsGetWithAgent(agent, (data) => {
        assertOriginalContent(data);
        done();
      });
    });

    it('can be used with domain mapping object', (done) => {
      const agent = new lib.HijackedHttpsAgent();
      agent.domainMap = {
        "httpbin.org": "example.com"
      };
      tryHttpsGetWithAgent(agent, (data) => {
        assertHijackedContent(data);
        done();
      });
    });

    it('can be used with domain mapping Map object', (done) => {
      const agent = new lib.HijackedHttpsAgent();
      agent.domainMap = new Map();
      agent.domainMap.set("httpbin.org", "example.com");
      tryHttpsGetWithAgent(agent, (data) => {
        assertHijackedContent(data);
        done();
      });
    });

    it('can be used with domain mapping function', (done) => {
      const agent = new lib.HijackedHttpsAgent();
      let called = false;
      agent.domainMap = (domain) => {
        called = true;
        if ((domain) == "httpbin.org")
          return "example.com";
      };
      tryHttpsGetWithAgent(agent, (data) => {
        assertHijackedContent(data);
        done();
      });
    });

  });

  describe('hijackGlobalAgent', () => {

    it('should install successfully', () => {
      expect(http.globalAgent).to.be.an.instanceof(http.Agent);
      expect(https.globalAgent).to.be.an.instanceof(https.Agent);

      lib.hijackGlobalAgent({
        "httpbin.org": "example.com"
      });

      expect(http.globalAgent).to.be.an.instanceof(lib.HijackedHttpAgent);
      expect(https.globalAgent).to.be.an.instanceof(lib.HijackedHttpsAgent);
    });

    describe('should hijack isomorphic-fetch', () => {

      it('http', () => {
        return fetch("http://httpbin.org/")
          .then((i) => i.text())
          .then((i) => assertHijackedContent(i))
      });

      it('https', () => {
        return fetch("https://httpbin.org/")
          .then((i) => i.text())
          .then((i) => assertHijackedContent(i))
      });

    });

  });

});