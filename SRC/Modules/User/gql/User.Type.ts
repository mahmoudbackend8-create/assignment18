import {
  GraphQLBoolean,
  GraphQLEnumType,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString,
} from "graphql";
import {
  UserGender,
  UserProvider,
  UserRole,
} from "../../../Common/Enums/User.Enums.js";

export const UserProfileTypes = new GraphQLObjectType({
  name: "UserType",
  fields: {
    _id: { type: new GraphQLNonNull(GraphQLID) },
    UserName: {
      type: GraphQLString,
      resolve: (parent) => {
        console.log(parent);
        return parent.Gender == UserGender.Male
          ? "MR. " + parent.UserName
          : "MS. " + parent.UserName;
      },
    },
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
});
