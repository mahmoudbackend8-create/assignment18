import { GraphQLObjectType, GraphQLSchema } from "graphql";
import userSchema from "../User/gql/user.schema.js";
import PostSchema from "../Post/gql/Post.Schema.js";
const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: "query1",
        fields: {
            ...userSchema.userQuries(),
        },
    }),
    mutation: new GraphQLObjectType({
        name: "MutationSchema",
        fields: {
            ...PostSchema.postMutations(),
        },
    }),
});
export default schema;
