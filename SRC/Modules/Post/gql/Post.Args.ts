import { GraphQLEnumType, GraphQLNonNull, GraphQLString } from "graphql";

export const ReactPostArgs = {
  postId: { type: new GraphQLNonNull(GraphQLString) },
  React: {
    type: new GraphQLNonNull(
      new GraphQLEnumType({
        name: "ReactEnum",
        values: { like: { value: 1 }, unlike: { value: 0 } },
      }),
    ),
  },
};
