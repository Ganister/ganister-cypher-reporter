
const neo4j = require('neo4j-driver');

const queries = [
  {
    "id": "softwares",
    "query": "MATCH (soft:software) WHERE NOT (soft)<-[:revises]-()  OPTIONAL MATCH pathPart = shortestPath((soft)<-[:consumes|contains*]-(p:part)) WHERE p.soussysteme=true and NOT (p)<-[:revises]-(:part)-[:consumes|contains*]->(soft) return pathPart,soft",
    "structure": [
      {
        "identifier": "soft",
        "children": [
          {
            "identifier": "pathPart",
            "pick": "last",
            "children": []
          }
        ]
      }
    ],
    "ordering": []
  }
  // {
  //   id: 'docs',
  //   query: `MATCH (d:document) 
  //   WHERE d._createdOn > 1619428971000 
  //   OPTIONAL MATCH (d)-[df]->(f:file) 
  //   OPTIONAL MATCH (d)<-[r]-(p:part) 
  //   RETURN d as documents,df, f as files, r as docparts, p as parts ORDER BY documents._createdOn`,
  //   ordering: [],
  //   structure: [
  //     {
  //       identifier: "documents",
  //       children: [
  //         {
  //           identifier: "df",
  //           children: [
  //             {
  //               identifier: "files",
  //               children: [],
  //             }
  //           ],
  //         }, {
  //           identifier: "docparts",
  //           children: [
  //             {
  //               identifier: "parts",
  //               children: [],
  //             }
  //           ],
  //         }
  //       ],
  //     }
  //   ]
  // },
  // {
  //   id: 'partCount',
  //   query: `MATCH (a:part) WHERE NOT(a)<-[:revises]-() RETURN COUNT(a) as partCount`,
  //   ordering: [],
  //   structure: []
  // },
  // {
  //   id: 'userCount',
  //   query: `MATCH (a:user) RETURN COUNT(a) as userCount`,
  //   ordering: [],
  //   structure: []
  // },
  // {
  //   id: 'documentCount',
  //   query: `MATCH (a:document) WHERE NOT(a)<-[:revises]-() RETURN COUNT(a) as documentCount`,
  //   ordering: [],
  //   structure: []
  // },
  // {
  //   id: 'partBom',
  //   query: `MATCH p=(a:part{_id:'61DBB03676D346D685DC5A5A32C7CF85'})-[:consumes*]->(items:part) 
  //           OPTIONAL MATCH (items)-[rel]->(docs:document)
  //           OPTIONAL MATCH (docs)-[rel2]->(f:file)
  //           RETURN p,rel,docs,rel2,f`,
  //   ordering: [],
  //   structure: [
  //     {
  //       identifier: "p",
  //       children: [
  //         {
  //           identifier: "rel",
  //           children: [
  //             {
  //               identifier: "docs",
  //               children: [
  //                 {
  //                   identifier: "rel2",
  //                   children: [
  //                     {
  //                       identifier: "f",
  //                       children: [],
  //                     }
  //                   ],
  //                 }
  //               ],
  //             }
  //           ],
  //         },
  //       ],
  //     }
  //   ]
  // }
];

const db = {
  boltURL: process.env.DB_BOLTURL,
  password: process.env.DB_PASSWORD,
  username: process.env.DB_USERNAME,
  encrypted: process.env.DB_ENCRYPTED,
};

const driver = neo4j.driver(db.boltURL, neo4j.auth.basic(
  db.username,
  db.password,
), { disableLosslessIntegers: true, encrypted: db.encrypted === 'true' });

const template = {
  "name": "BASE LOGICIELS",
  "locale": "fr-FR",
  "author": "Yoann Maingon",
  "items": [
    {
      "id": 5,
      "type": "table",
      "mapping": "softwares",
      "width": "12",
      "title": "BASE LOGICIELS",
      "inlineRelationships": [
        "developpedBy",
        "consumes",
        "contains",
        "hasTechDoc",
        "affectsSoftware",
        "linkedWith"
      ],
      "columns": [
        {
          "graphType": "node",
          "fields": {
            "software": {
              "map": "_node.properties._ref",
              "datatype": "string"
            }
          },
          "label": "IDENTIFIANT NT",
          "category": "IDENTIFICATION",
          "width": 250,
          "css": {
            "background-color": "#E2EFDA"
          }
        },
        {
          "graphType": "node",
          "fields": {
            "software": {
              "map": "_node.properties.designation",
              "datatype": "string"
            }
          },
          "label": "DESIGNATION",
          "category": "IDENTIFICATION",
          "width": 250,
          "css": {
            "background-color": "#E2EFDA"
          }
        },
        {
          "graphType": "node",
          "fields": {
            "software": {
              "map": "_node.properties._version",
              "datatype": "string"
            }
          },
          "label": "REVISION",
          "category": "IDENTIFICATION",
          "width": 250,
          "css": {
            "background-color": "#E2EFDA"
          }
        },
        {
          "graphType": "node",
          "fields": {
            "software": {
              "map": "_node.properties._state",
              "datatype": {
                "type": "ganister-state",
                "options": {
                  "nodetype": "software"
                }
              }
            }
          },
          "label": "STATUT",
          "category": "IDENTIFICATION",
          "width": 250,
          "css": {
            "background-color": "#E2EFDA"
          }
        },
        {
          "graphType": "node",
          "fields": {
            "software": {
              "map": "_node.properties.versionNT",
              "datatype": "string"
            }
          },
          "label": "VERSION NT",
          "category": "IDENTIFICATION",
          "width": 250,
          "css": {
            "background-color": "#E2EFDA"
          }
        },
        {
          "graphType": "node",
          "fields": {
            "software": {
              "map": "_node.properties.indice",
              "datatype": "string"
            }
          },
          "label": "INDICE",
          "category": "IDENTIFICATION",
          "width": 250,
          "css": {
            "background-color": "#E2EFDA"
          }
        },
        {
          "graphType": "node",
          "fields": {
            "software": {
              "map": "_node.properties.versionEditeur",
              "datatype": "string"
            }
          },
          "label": "VERSION EDITEUR",
          "category": "IDENTIFICATION",
          "width": 250,
          "css": {
            "background-color": "#E2EFDA"
          }
        },
        {
          "relationships": ["developpedBy"],
          "nodes": ["manufacturer"],
          "columns": [
            {
              "graphType": "node",
              "fields": {
                "manufacturer": {
                  "map": "_node.properties._ref",
                  "datatype": "string"
                }
              },
              "label": "EDITEUR",
              "category": "IDENTIFICATION",
              "width": 200,
              "css": {
                "background-color": "#E2EFDA"
              }
            }
          ]
        },
        {
          "graphType": "node",
          "fields": {
            "software": {
              "map": "_node.properties._createdByName",
              "datatype": "string"
            }
          },
          "label": "CREE PAR",
          "category": "TRACABILITE",
          "width": 150,
          "css": {
            "background-color": "#FFF2CC"
          }
        },
        {
          "graphType": "node",
          "fields": {
            "software": {
              "map": "_node.properties._createdOn",
              "datatype": "date"
            }
          },
          "label": "DATE CREATION",
          "category": "TRACABILITE",
          "width": 160,
          "css": {
            "background-color": "#FFF2CC"
          }
        },
        {
          "graphType": "node",
          "fields": {
            "software": {
              "map": "_node.properties.dateEdition",
              "datatype": "date"
            }
          },
          "label": "DATE EDITION",
          "category": "TRACABILITE",
          "width": 160,
          "css": {
            "background-color": "#FFF2CC"
          }
        },
        {
          "graphType": "node",
          "fields": {
            "software": {
              "map": "_node.properties.dateValidation",
              "datatype": "date"
            }
          },
          "label": "DATE VALIDATION",
          "category": "TRACABILITE",
          "width": 160,
          "css": {
            "background-color": "#FFF2CC"
          }
        },
        {
          "graphType": "node",
          "fields": {
            "software": {
              "map": "_node.properties.dateLivraison",
              "datatype": "date"
            }
          },
          "label": "DATE LIVRAISON",
          "category": "TRACABILITE",
          "width": 160,
          "css": {
            "background-color": "#FFF2CC"
          }
        },
        {
          "relationships": ["consumes", "contains"],
          "nodes": ["part"],
          "columns": [
            {
              "graphType": "node",
              "fields": {
                "part": {
                  "map": "_node.properties._ref",
                  "datatype": "string"
                }
              },
              "label": "CODE ARTICLE NT",
              "category": "BROUILLEURS CONFIGURES",
              "width": 250,
              "css": {
                "background-color": "#d9d9d9"
              }
            },
            {
              "graphType": "node",
              "fields": {
                "part": {
                  "map": "_node.properties.name",
                  "datatype": "string"
                }
              },
              "label": "DESIGNATION",
              "category": "BROUILLEURS CONFIGURES",
              "width": 350,
              "css": {
                "background-color": "#d9d9d9"
              }
            },
            {
              "graphType": "node",
              "fields": {
                "part": {
                  "map": "_node.properties._version",
                  "datatype": "string"
                }
              },
              "label": "REVISION",
              "category": "BROUILLEURS CONFIGURES",
              "width": 110,
              "css": {
                "background-color": "#d9d9d9"
              }
            },
            {
              "graphType": "node",
              "fields": {
                "part": {
                  "map": "_node.properties._state",
                  "datatype": {
                    "type": "ganister-state",
                    "options": {
                      "nodetype": "part"
                    }
                  }
                }
              },
              "label": "DESIGNATION",
              "category": "BROUILLEURS CONFIGURES",
              "width": 140,
              "css": {
                "background-color": "#d9d9d9"
              }
            }
          ]
        },
        {
          "relationships": ["hasTechDoc"],
          "nodes": ["document"],
          "columns": [
            {
              "graphType": "node",
              "fields": {
                "document": {
                  "map": "_node.properties._ref",
                  "datatype": "string"
                }
              },
              "label": "REFERENCE",
              "category": "FICHE TECHNIQUE LOGICIEL",
              "width": 250,
              "css": {
                "background-color": "#FCE4D6"
              }
            },
            {
              "graphType": "node",
              "fields": {
                "document": {
                  "map": "_node.properties.titre",
                  "datatype": "string"
                }
              },
              "label": "TITRE",
              "category": "FICHE TECHNIQUE LOGICIEL",
              "width": 250,
              "css": {
                "background-color": "#FCE4D6"
              }
            },
            {
              "graphType": "node",
              "fields": {
                "document": {
                  "map": "_node.properties.dateDoc",
                  "datatype": "string"
                }
              },
              "label": "DATE DOCUMENT",
              "category": "FICHE TECHNIQUE LOGICIEL",
              "width": 250,
              "css": {
                "background-color": "#FCE4D6"
              }
            }
          ]
        },
        {
          "relationships": ["affectsSoftware"],
          "nodes": ["faitTechnique"],
          "columns": [
            {
              "relationships": ["linkedWith"],
              "nodes": ["market"],
              "columns": [
                {
                  "graphType": "node",
                  "fields": {
                    "market": {
                      "map": "_node.properties._ref",
                      "datatype": "string"
                    }
                  },
                  "label": "MARCHE",
                  "category": "SUIVI TECHNIQUE",
                  "width": 250,
                  "css": {
                    "background-color": "#FFC000"
                  }
                }
              ]
            },
            {
              "graphType": "node",
              "fields": {
                "faitTechnique": {
                  "map": "_node.properties._ref",
                  "datatype": "string"
                }
              },
              "label": "FAITS TECHNIQUES",
              "category": "SUIVI TECHNIQUE",
              "width": 250,
              "css": {
                "background-color": "#FFC000"
              }
            }
          ]
        }
      ]
    }
  ]
};

const dataConverters = {
  'ganister-state': (value, options) => {
    return value;
  },
  'ganister-lov': (value, options) => {
    return value;
  },
}

module.exports = {
  queries, template, driver, dataConverters
};