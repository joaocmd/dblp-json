const DBLP = require('./dblp.js');
const DBLPPerson = require('./dblp-person.js');

// Check instance of every get return in DBLP

describe('Checking DBLP function return instances', () => {

  test('Checking instance of DBLP.get return', async () => {
    const url = 'https://dblp.org/pers/xx/b/Brito:Tiago.xml';
    const data = await DBLP.get(url);
    return expect(data).toBeInstanceOf(DBLPPerson);
  });

  test('Checking instance of DBLP.getByName return', async () => {
    const dblp = new DBLP();
    const data = await dblp.getByName('Tiago', 'Brito');
    return expect(data).toBeInstanceOf(DBLPPerson);
  });

  test('Checking instance of DBLP.getByHomepage return', async () => {
    const dblp = new DBLP();
    const data = await dblp.getByHomepage('homepages/188/5658');
    return expect(data).toBeInstanceOf(DBLPPerson);
  });

  test('Checking instance of DBLP.getByPID return', async () => {
    const dblp = new DBLP();
    const data = await dblp.getByPID('188/5658');
    return expect(data).toBeInstanceOf(DBLPPerson);
  });
});

describe('Checking DBLP functions with invalid input', () => {
  test('Checking DBLP.get with invalid URI', async () => {
    const url = 'google.com';
    return expect(DBLP.get(url)).rejects.toThrow();
  });

  test('Checking DBLP.get with wrong URL', async () => {
    const url = 'https://dblp.org/pers/xx/b/Tiago:Brito.xml';
    return expect(DBLP.get(url)).rejects.toThrow();
  });

  test('Checking DBLP.getByName with non-existing user', async () => {
    const dblp = new DBLP();
    return expect(dblp.getByName('Google', 'Google')).rejects.toThrow();
  });

  test('Checking DBLP.getByHomepage with wrong homepage', async () => {
    const dblp = new DBLP();
    return expect(dblp.getByHomepage('google.com')).rejects.toThrow();
  });

  test('Checking DBLP.getByPID with wrong PID', async () => {
    const dblp = new DBLP();
    return expect(dblp.getByPID('google.com')).rejects.toThrow();
  });
});


// Check DBLPPerson functions
describe('Testing getFirstElement in DBLPPerson', () => {
  test('Testing with a list', () => {
    const testingList = [0, 1, 2, 3, 4];
    const element = DBLPPerson.getFirstElement(testingList);
    return expect(element).toBe(testingList[0]);
  });

  test('Testing with an object', () => {
    const testingObject = {prop: 'value'};
    const element = DBLPPerson.getFirstElement(testingObject);
    return expect(element).toBe(testingObject);
  });

  test('Testing with a string', () => {
    const testingString = "hello";
    const element = DBLPPerson.getFirstElement(testingString); 
    return expect(element).toBe(testingString);
  });
  
  test('Testing with null', () => {
    return expect(DBLPPerson.getFirstElement(null)).toBe(null);
  });
});