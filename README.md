# graphql-hashid-type

A scalar type for [GraphQL] that obscures your database identifiers using
[Hashids].

## Installation

Use yarn or npm:

```
$ yarn add graphql-hashid-type
```

```
$ npm i -S graphql-hashid-type
```

## Usage

```js
import {
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';
import GraphQLHashIdType from 'graphql-hashid-type';

const GraphQLHashId = new GraphQLHashIdType('super secret salt');

const FoodType = new GraphQLObjectType({
  name: 'Food',
  description: 'A possibly tasty thing',
  fields: {
    id: { type: new GraphQLNonNull(GraphQLHashId) },
    name: { type: new GraphQLNonNull(GraphQLString) },
  },
});

const food = [
  { id: 1, name: 'Pizza' },
  { id: 2, name: 'Hamburger' },
  { id: 3, name: 'Burrito' },
];

const RootType = new GraphQLObjectType({
  name: 'RootType',
  fields: {
    food: {
      type: new GraphQLList(FoodType),
      resolve: () => food,
    },
    favorite: {
      type: FoodType,
      args: {
        id: {
          type: new GraphQLNonNull(GraphQLHashId)
        }
      },
      resolve(root, { id }) {
        return food.find(item => item.id === id);
      },
    }
  }
});

export default new GraphQLSchema({
  query: RootType,
});
```

[GraphQL]: http://graphql.org/
[Hashids]: http://hashids.org/
