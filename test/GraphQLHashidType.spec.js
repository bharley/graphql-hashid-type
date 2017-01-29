import chai, { expect } from 'chai';
import chaiStringPlugin from 'chai-string';
import {
  graphql,
  GraphQLInt as IntType,
} from 'graphql';
import Hashids from 'hashids';
import 'babel-polyfill';
import HashidType from '../lib/GraphQLHashidType';
import makeSchema from './helpers';

chai.use(chaiStringPlugin);

describe('GraphQLHashidType', () => {
  it('should exist', () => {
    expect(HashidType).to.exist;
  });

  it('should encode integers', async () => {
    const schema = makeSchema({
      id: {
        type: new HashidType(),
        resolve: () => 42,
      },
    });

    const { data: { id } } = await graphql(schema, '{ id }');

    expect(id).to.be.a.string;
    expect([42]).to.eql((new Hashids()).decode(id));
  });

  it('should not accept invalid IDs', async () => {
    const schema = makeSchema({
      id: {
        type: new HashidType(),
        resolve: () => 'pizza',
      },
    });

    const { data: { id }, errors } = await graphql(schema, '{ id }');

    expect(id).to.be.null;
    expect(errors[0].message).to.startsWith('Expected an integer');
  });

  it('should decode hashes', async () => {
    const schema = makeSchema({
      user: {
        type: IntType,
        args: {
          id: { type: new HashidType() },
        },
        resolve: (root, args) => args.id,
      },
    });

    const { data: { user } } = await graphql(schema, '{ user(id: "jR") }');

    expect(user).to.equal(1);
  });

  it('should not accept invalid literals', async () => {
    const schema = makeSchema({
      user: {
        type: IntType,
        args: {
          id: { type: new HashidType() },
        },
        resolve: (root, args) => args.id,
      },
    });

    const { errors } = await graphql(schema, '{ user(id: 1) }');

    expect(errors[0].message).to.startsWith('Expected String');
  });

  it('should decode variables', async () => {
    const schema = makeSchema({
      user: {
        type: IntType,
        args: {
          id: { type: new HashidType() },
        },
        resolve: (root, args) => args.id,
      },
    });

    const { data: { user } } = await graphql(schema, 'query GetUser($userId: Hashid!) { user(id: $userId) }', {}, {}, { userId: 'jR' });

    expect(user).to.equal(1);
  });

  it('should not accept invalid variables', async () => {
    const schema = makeSchema({
      user: {
        type: IntType,
        args: {
          id: { type: new HashidType() },
        },
        resolve: (root, args) => args.id,
      },
    });

    const { errors } = await graphql(schema, 'query GetUser($userId: Hashid!) { user(id: $userId) }', {}, {}, { userId: 42 });

    expect(errors[0].message).to.startsWith('Variable "$userId" got invalid value 42');
  });

  it('should accept arguments to the Hashids constructor', async () => {
    const salt = 'this is super salty';
    const pad = 10;
    const hashids = new Hashids(salt, pad);

    const schema = makeSchema({
      id: {
        type: new HashidType(salt, pad),
        resolve: () => 42,
      },
    });

    const { data: { id } } = await graphql(schema, '{ id }');

    expect([42]).to.eql(hashids.decode(id));
  });

  it('should accept an instance of Hashids', async () => {
    const salt = 'this is super salty';
    const pad = 10;
    const hashids = new Hashids(salt, pad);

    const schema = makeSchema({
      id: {
        type: new HashidType(hashids),
        resolve: () => 42,
      },
    });

    const { data: { id } } = await graphql(schema, '{ id }');

    expect([42]).to.eql(hashids.decode(id));
  });
});
