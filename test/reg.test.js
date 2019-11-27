const app = require('../server').app;
const chai = require("chai");
const chaiHttp = require("chai-http");

const { expect } = chai;
chai.use(chaiHttp);
describe("Server!", () => {
  it("welcomes user to the api", done => {
    chai
      .request(app)
      .get("/")
      .end((err, res) => {
        expect(res).to.have.status(200);
        done();
      });
  });

  it("adds 1 user", async () => {
    for (let i=0; i<100; i++){
        (new Promise((respons, rej) => {
            chai
                .request(app)
                .post("/reg")
                .send({ 
                    name: 'name'+i, 
                    lastname: 'lastname'+i,
                    email: 'email'+i+'@email.ru',
                    pass: '123456',
                    pass1: '123456' 
                })
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    respons()
                });
            })
        )
    }
  });
});