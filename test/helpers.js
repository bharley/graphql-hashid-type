import {
  GraphQLSchema as Schema,
  GraphQLObjectType as ObjectType,
} from 'graphql';

export default fields => new Schema({
  query: new ObjectType({
    name: 'Query',
    fields,
  }),
});
