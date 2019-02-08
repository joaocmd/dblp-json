// Necessary requirements
const util = require('util');
const Joi = require('joi');

const rawJSONSchema = Joi.object().keys({
  dblpperson: Joi.object().keys({
    person: Joi.object().required(),
    r: Joi.array().required(),
    coauthors: Joi.object().required(),
  })
});

/**
 * DBLPPerson class
 * It holds all the information regarding the user page requested using
 * DBLPRequest, from which it comes.
 *
 * It can be used to get a JSON representation of the user page. It can
 * also be used to get particular information from a user page by
 * leveraging its API.
 */
class DBLPPerson {
  /**
   * DBLPPerson constructor
   * @param  {object} rawJSON This is the raw JSON that comes from the
   * parser at DBLPRequest;
   * @return {object} The DBLPPerson object
   */
  constructor(rawJSON) {
    // Keep the rawJSON object from the parser
    this.rawJSON = rawJSON;

    Joi.validate(this.rawJSON, rawJSONSchema, (err, value) => {
      console.log(value);
    });

    // Check if the JSON has the necessary dblpperson property
    const rawJSONHasDblpPerson = Object.prototype.hasOwnProperty.call(rawJSON, 'dblpperson');
    if (rawJSONHasDblpPerson) {
      this.dblpperson = rawJSON.dblpperson;

      // Check if the dblp person object has the person property
      const dblppersonHasPerson = Object.prototype.hasOwnProperty.call(this.dblpperson, 'person');
      if (dblppersonHasPerson) {
        // Get only the first element in case of a list
        this.person = DBLPPerson.getFirstElement(this.dblpperson.person);
      } else {
        throw new ReferenceError('[DBLPPerson constructor] dblpperson object has no person property.');
      }

      // Chec if the dblp person object has the r property
      const dblppersonHasR = Object.prototype.hasOwnProperty.call(this.dblpperson, 'r');
      if (dblppersonHasR) {
        this.r = this.dblpperson.r;
      } else {
        throw new ReferenceError('[DBLPPerson constructor] dblpperson object has no r property.');
      }

      // Check if the dblp person object has the coauthors property
      const dblppersonHasCoauthors = Object.prototype.hasOwnProperty.call(this.dblpperson, 'coauthors');
      if (dblppersonHasCoauthors) {
        this.coauthors = this.dblpperson.coauthors;
      } else {
        throw new ReferenceError('[DBLPPerson constructor] dblpperson has no coauthors property.');
      }
    } else {
      throw new ReferenceError('[DBLPPerson constructor] The JSON has no dblpperson property.');
    }
  }

  /**
   * Function to get one element from a specific object
   * @param  {array || object} element
   * @return {object}
   */
  static getFirstElement(element) {
    // check if element is array
    return util.isArray(element) ? element[0] : element;
  }

  /**
   * Function to return an object which describes a dblp person
   * @return {object}
   */
  getPerson() {
    // Object that will hold the person data to return
    const person = {};

    // Variable to check if the person's name is already set
    let nameSet = false;

    // Check if the dblp person object has the name property
    const dblppersonHasName = Object.prototype.hasOwnProperty.call(this.dblpperson, 'name');
    if (dblppersonHasName) {
      // Set the return person's name the same as the name
      // in the dblp person object
      person.name = this.dblpperson.name;

      // Name property has been set
      nameSet = true;
    }

    // Check if the dblp person object has the n property
    const dblppersonHasN = Object.prototype.hasOwnProperty.call(this.dblpperson, 'n');
    if (dblppersonHasN) {
      // Use it as the number of publications (n-publications)
      person['n-publications'] = this.dblpperson.n;
    } else if (this.r) {
      // Use the length of the r property of the dblp person object
      const nPublications = this.r.length;
      person['n-publications'] = nPublications.toString();
    } else {
      throw new ReferenceError('[getPerson] R object is not set.');
    }

    // Check if the person object is set
    if (this.person) {
      // Iterate over every key in the person object and
      // copy the properties to the new object except the
      // author property
      Object.keys(this.person).forEach((personKey) => {
        // Check for the author key
        if (personKey === 'author') {
          // If the name has not been set then use the value
          // of the author property as the person name
          if (!nameSet) {
            person.name = this.person.author;
            nameSet = true;
          }
        } else {
          person[personKey] = this.person[personKey];
        }
      });
    } else {
      throw new ReferenceError('[getPerson] Person object is not set.');
    }

    // Check if name has not been set so far
    // This should never happen
    if (!nameSet) {
      throw new Error('[getPerson] Person object has no name/author property.');
    }

    // Return the person object
    return person;
  }

  /**
   * Function that returns an object containing all the publications
   * present in the requested dblp user page
   * @return {object} publications object
   */
  getPublications() {
    // Object that will hold the publication data to return
    const publications = {};

    // Check if the R property is set
    if (this.r) {
      // The list that will hold all the publications from the person
      const pubs = [];

      // Iterate over every object in the R list
      Object.keys(this.r).forEach((rKey, i) => {
        // Get the publication object pub
        const pub = this.r[i];

        // Create the object that will hold the information
        // to add to the pubs list
        const publication = {};

        // Get the key of the publication which in
        // dblp represents the type of publication
        // There should only be one key in this obect
        Object.keys(pub).forEach((pubKey) => {
          // Create a new property in the publication
          // object that hold the type of the publication
          publication.type = pubKey;

          // Get the object that holds the actual publication
          // data (aka paper/book/etc)
          const paper = pub[pubKey];

          // Iterate over every key in the paper object
          // and copy it for the publication object
          Object.keys(paper).forEach((paperKey) => {
            publication[paperKey] = paper[paperKey];
          });
        });

        // Push the publication object to the list
        // of publications
        pubs.push(publication);
      });

      // Create a property holding the number of
      // publications for that dblp person
      publications.n = pubs.length.toString();

      // Create a property holding the list of
      // publications from that dblp person
      publications.pubs = pubs;
    } else {
      throw new ReferenceError('[getPublications] R object is not set.');
    }

    // Return the publications object
    return publications;
  }

  /**
   * Function that returns an object containing all the coauthors
   * for the requested dblp person
   * @return {object} Coauthors object
   */
  getCoauthors() {
    // Object that holds coauthor data to return
    const coauthors = {};

    // Check if the coauthors object is set
    if (this.coauthors) {
      // List that holds the data of every coauthor
      const coauthorList = [];

      // Check if the dblp coauthors object has the co property
      const coauthorsHasCo = Object.prototype.hasOwnProperty.call(this.coauthors, 'co');
      if (coauthorsHasCo) {
        // Get the co list
        const { co } = this.coauthors;

        // Iterate over the coauthors list
        Object.keys(co).forEach((key, i) => {
          // Check if the coauthor object has the na property
          // which holds the actual coauthor data
          const coiHasNa = Object.prototype.hasOwnProperty.call(co[i], 'na');
          if (coiHasNa) {
            // Get the first element of the coauthor data
            // in case it is a list
            const na = DBLPPerson.getFirstElement(co[i].na);
            // Push the coauthor data to the coauthor list
            coauthorList.push(na);
          }
        });
      } else {
        throw new ReferenceError('[getCoauthors] Coauthor object has no co property.');
      }

      // Check if the dblp coauthors object has the n property
      // that holds the number of coauthors
      const coauthorsHasN = Object.prototype.hasOwnProperty.call(this.coauthors, 'n');
      if (coauthorsHasN) {
        // Set the number of coauthors as the same as the value
        // of this property
        coauthors.n = this.coauthors.n;
      } else {
        // Set the number of coauthors as the number of
        // coauthors in the coauthors list
        coauthors.n = coauthorList.length.toString();
      }

      // Set the co property of the return object as the coauthors list
      // which might be empty if there are no coauthors
      coauthors.co = coauthorList;
    } else {
      throw new ReferenceError('[getCoauthors] Coauthors property not set.');
    }

    // Return the coauthors object
    return coauthors;
  }

  /**
   * Function that returns a JSON object with all the
   * important data for a dblp person
   * @return {object} JSON object with important person data
   */
  getJSON() {
    // Object that will hold the important data to return
    const returnObj = {};

    // Get person data
    returnObj.person = this.getPerson();

    // Get publications data
    returnObj.publications = this.getPublications();

    // Get coauthors data
    returnObj.coauthors = this.getCoauthors();

    // Return the object
    return returnObj;
  }

  /**
   * Function that returns the JSON as it comes
   * out of the xml2js parser
   * @return {object} Raw JSON object with person data
   */
  getRawJSON() {
    // Return the raw json object
    return this.rawJSON;
  }
}

module.exports = DBLPPerson;
