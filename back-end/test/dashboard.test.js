import request from 'supertest';
import { expect } from 'chai';
import app from '../server.js';

describe('Dashboard routes (TickerPicker)', function () {
  this.timeout(15000);
  describe('POST /api/dashboard/filter', function () {
    it('should return a list of filtered stocks with count and items', async function () {
      const res = await request(app)
        .post('/api/dashboard/filter')
        .send({
          symbolsParam: [],
          filters: {}
        })
        .expect('Content-Type', /json/)
        .expect(200);

      //check on structure
      expect(res.body).to.be.an('object');
      expect(res.body).to.have.property('count');
      expect(res.body).to.have.property('items');
      // checks that 'items' is an array
      expect(res.body.items).to.be.an('array');
      // all elements in 'items' should be objects
      (res.body.items).forEach(item => {
        expect(item).to.be.an("object");
        expect(item).to.not.equal(null);
      });
      expect(res.body.count).to.equal(res.body.items.length);

      //do field checking if there is actual returned stock data
      if (res.body.items.length > 0) {
        // check that all stock objects have the same properties
        (res.body.items).forEach( item => {
          expect(item).to.have.property('ticker');
          expect(item).to.have.property('company');
          expect(item).to.have.property('price');
        });
      }

    });
  });
});
