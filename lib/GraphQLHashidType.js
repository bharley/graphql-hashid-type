import { GraphQLScalarType } from 'graphql';
import { GraphQLError } from 'graphql/error';
import { Kind } from 'graphql/language';
import Hashids from 'hashids';

export default class GraphQLHashidType extends GraphQLScalarType {
  constructor(saltOrInstance, pad, alphabet) {
    let hashids;
    if (saltOrInstance instanceof Hashids) {
      hashids = saltOrInstance;
    } else {
      hashids = new Hashids(saltOrInstance, pad, alphabet);
    }

    function decodeValue(value) {
      const [result] = hashids.decode(value);
      if (!result) {
        throw new GraphQLError(`Could not parse ID from value '${value}'`);
      }

      return result;
    }

    super({
      name: 'Hashid',
      description: 'Hashed numeric identifier',

      serialize(value) {
        if (!Number.isInteger(value)) {
          throw new GraphQLError(`Expected an integer, got '${value}'`);
        }

        return hashids.encode(value);
      },

      parseValue: decodeValue,

      parseLiteral(ast) {
        if (ast.kind !== Kind.STRING) {
          throw new GraphQLError(`Expected String, got ${ast.kind} (${ast.value})`);
        }

        return decodeValue(ast.value);
      },
    });
  }
}
