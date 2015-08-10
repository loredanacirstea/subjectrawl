/*
Collections = {};
Ontologies = Collections.Ontologies = new Mongo.Collection("ontologies");
Subject = Collections.Subject =  new Mongo.Collection("subject");
Relation = Collections.Relation = new Mongo.Collection("subject_relation");
*/
Ontologies = new Mongo.Collection("ontologies_d");
Apps = new Mongo.Collection("apps");
Subject =  new Mongo.Collection("subjectraw_d");
Relation =  new Mongo.Collection("rawrelation_d");
applist = {};