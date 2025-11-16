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
      expect(res.body.items).to.be.an('array');
      expect(res.body.count).to.equal(res.body.items.length);

      //do field checking if there are actual returned stock data
      if (res.body.items.length > 0) {
        const stock = res.body.items[0];
        expect(stock).to.have.property('ticker');
        expect(stock).to.have.property('company');
        expect(stock).to.have.property('price');
      }
    });
  });
});
