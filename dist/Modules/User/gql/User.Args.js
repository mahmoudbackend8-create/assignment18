import { GraphQLNonNull, GraphQLString } from "graphql";
export const GetProfileArgs = { userId: { type: new GraphQLNonNull(GraphQLString) } };
