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
export default schema
/*
  
          helloWorld2: {
          type: GraphQLString,
          args: {
            word: { type: new GraphQLNonNull(GraphQLString) },
          },
          resolve: () => {
            return "hellow World";
          },
          description: "test 2",
        },
  */

/*
        
              fields: {
        GetUserProfile: {
          type: new GraphQLObjectType({
            name: "UserType",
            fields: {
              _id: { type: new GraphQLNonNull(GraphQLID) },
              UserName: { type: GraphQLString },
              Password: { type: GraphQLString },
              Email: { type: GraphQLString },
              Gender: {
                type: new GraphQLEnumType({
                  name: "UserGender",
                  values: {
                    Female: { value: UserGender.Female },
                    Male: { value: UserGender.Male },
                  },
                }),
              },
              Phone: { type: GraphQLString },
              Age: { type: GraphQLInt },
              Provider: {
                type: new GraphQLEnumType({
                  name: "UserProvider",
                  values: {
                    Google: { value: UserProvider.Google },
                    System: { value: UserProvider.System },
                  },
                }),
              },
              Role: {
                type: new GraphQLEnumType({
                  name: "UserRole",
                  values: {
                    Admin: { value: UserRole.Admin },
                    User: { value: UserRole.User },
                  },
                }),
              },
              Friends: { type: new GraphQLList(GraphQLString) },
              ProfilePic: { type: GraphQLString },
              CoverPics: { type: new GraphQLList(GraphQLString) },
              ChangeCreditTime: { type: GraphQLString },
              ConfirmEmail: { type: GraphQLBoolean },
              DeletedAt: { type: GraphQLString },
            },
          }),

          resolve: async() => {
           const user = await UserDbrepo.findOne({})

            return user;
          },
          description: "test 1",
        },

      },*/
