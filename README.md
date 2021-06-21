![Logo](https://github.com/Ganister/ganister-cypher-reporter/raw/main/logo.png)

[![Codeship Status for Ganister/ganister-cypher-reporter](https://app.codeship.com/projects/ccc1530c-c8d5-4a26-8ffb-d6862b068105/status?branch=main)](https://app.codeship.com/projects/445610)

# ganister-cypher-reporter
Report nodejs library for graph db supporting cypher

## Install

Using npm: 
```
npm i ganister-cypher-reporter
```

## Usage

To produce a report you need the following elements : 
- an array of cypher queries
- a report template
- an output option (html/pdf)
- a neo4j driver authentified instance

```javascript
const reporter = require('ganister-cypher-reporter');
await reporter.buildReport({
   queries, 
   template, 
   output: 'html', 
   cypherDriver 
});
```

### Cypher Queries 

Cypher queries have to be identified with a unique id.
Cypher queries can return paths, nodes, relationships or just values

Sample : 
```javascript
const queries = [
  {
    id: 'docs',
    query: `MATCH (d:document) 
    OPTIONAL MATCH (d)-[]->(f:file) 
    OPTIONAL MATCH (d)<-[r]-(p:part) 
    RETURN d as documents, f as files, r as docparts, p as parts ORDER BY documents._createdOn`,
  },
  {
    id: 'partCount',
    query: `MATCH (a:part) WHERE NOT(a)<-[:revises]-() RETURN COUNT(a) as partCount`,
  },
  {
    id: 'userCount',
    query: `MATCH (a:user) RETURN COUNT(a) as userCount`,
  },
  {
    id: 'partBom',
    query: `MATCH p=(a:part{_id:'1'})-[:consumes*]->(items:part) 
            OPTIONAL MATCH (items)-[partDocRel]->(documents:document)
            OPTIONAL MATCH (documents)-[docFileRel]->(file:file)
            RETURN p,partDocRel,documents,docFileRel,file`,
  }
];
```

### Report Template

Report Template Schema : 
```javascript
const optionsSchema = Joi.object({
  queries: Joi.array().required(),
  template: Joi.object({
    name: Joi.string().required(),
    locale: Joi.string().required(),
    author: Joi.string().required(),
    items: Joi.array().items(Joi.object({
      id: Joi.number().required(),
      type: Joi.string().allow('field', 'table', 'graph').required(),
      datatype :Joi.string(),
      mapping: Joi.string(),
      inlineRelationships: Joi.array().items(Joi.string()),
      columns: Joi.array().items(Joi.object({
        graphType: Joi.string(),
        indentation: Joi.boolean(),
        fields: Joi.object(),
        label: Joi.string(),
        width: Joi.number(),
        columns: Joi.array().items(Joi.link('#column')),
      }).id('column')),
      width: Joi.string().allow('1', '2', '3', '4', '5', '6'),
      title: Joi.string(),
    })),
  }),
  output: Joi.string().allow('pdf', 'html'),
  cypherDriver: Joi.object(),
});
```

|  Parameters | Explanation  |  
|---|---|
| inlineRelationships |  In the report template you can define an array of relationships which will be handled as inlineRelationships in a table. If true, whenever such relationship is met, the children of these relationships will appear in a cell to the right of their parent node. If False, then for each child a new row is appended under the parent row.| 
|   |   | 



### Output

For now we only support 'html' as an output.

### Driver

```javascript
const neo4j = require('neo4j-driver');
const cypherDriver = neo4j.driver('bolt://<neo4jBoltAddress>', neo4j.auth.basic(
  '<username>',
  '<password>',
), { disableLosslessIntegers: true, encrypted: true });
```

## Code of Conduct

## License

## Roadmap
Evolution of features are listed on the [project kanban board](https://github.com/Ganister/ganister-cypher-reporter/projects/1)

## Semver
Until ganister-cypher-reporter reaches a 1.0.0 release, breaking changes will be released with a new minor version.

## todo
- [] retrieve relationship value