const { ApolloServer, gql } = require('apollo-server-lambda');
const faunadb = require('faunadb'),
  q = faunadb.query;

  const dotenv = require('dotenv')
  dotenv.config();

const typeDefs = gql`
  type Query {
    bookmark: [Bookmark!]
  }
  type Bookmark {
    title: String!
    id: ID!
    url: String!
    desc: String!
  }
  type Mutation{
    addBookmark(title: String!, url: String!, desc: String!) : Bookmark
    removeBookmark(id: ID!): Bookmark
    removeAllBookmarks(id: ID): Bookmark
  }
`

const resolvers = {
  Query: {
    bookmark: async(root, args, context) => {
      try{
        var client = new faunadb.Client({ secret: "fnAD9wzSivACBQALoqEICbIHYXr8X_4kG-m07nbO" });
        var result = await client.query(  
          q.Map(
            q.Paginate(q.Match(q.Index("all_search_by_url"))),
            q.Lambda(x => q.Get(x))
          )
        )
        return result.data.map(d => {
          return{
            title: d.data.title,
            id: d.ref.id,
            url: d.data.url,
            desc: d.data.desc

          }
        });
      }
      catch(error){
        console.log(error);
      }
    },
  },
  Mutation: {
    addBookmark: async (_, {title, url, desc}) => {
      var client = new faunadb.Client({ secret: "fnAD9wzSivACBQALoqEICbIHYXr8X_4kG-m07nbO" })
      console.log("url, desc", url, desc);
      try {
        var result = await client.query(
          q.Create(
            q.Collection('search_by_url'),
            { data: { 
              title,
              url, 
              desc
             } },
          )
        );
        console.log("Document Created and Inserted in Container: " + result.ref.id);
        return result.ref.data;
      } 
      catch (error){
          console.log('Error: ');
          console.log(error);
      }
      
    },
    removeBookmark: async (_, {id}) => {

      console.log(id)
      try {
        var client = new faunadb.Client({ secret: "fnAD9wzSivACBQALoqEICbIHYXr8X_4kG-m07nbO" });
        var result = await client.query(

          q.Delete(q.Ref(q.Collection("search_by_url"), id))

        );
        // return result.ref.data

      } 
      catch (error){
          console.log('Error: ');
          console.log(error);
      }
    },

    removeAllBookmarks: async() => {
      var client = new faunadb.Client({ secret: "fnAD9wzSivACBQALoqEICbIHYXr8X_4kG-m07nbO" })
      try {
        var result = await client.query(
          q.Map(
            q.Paginate(q.Match(q.Index("all_search_by_url"))),
            q.Lambda((x) => q.Delete(x))
          )
        );
          }
       catch (error){
         console.log('Error: ');
        console.log(error);
        }
    }
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

const handler = server.createHandler()

module.exports = { handler }
