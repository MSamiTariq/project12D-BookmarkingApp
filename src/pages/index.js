import React from "react";
import {useQuery, useMutation} from "@apollo/client";
import gql from 'graphql-tag';
import ErrorMsg from '../Utils/ErrorMsg';

import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import Typography from "@material-ui/core/Typography";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import CircularProgress from "@material-ui/core/CircularProgress";
import ForwardIcon from '@material-ui/icons/Forward';

import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";

const BookmarkQuery = gql`{
  bookmark{ 
    title,
    id,
    url, 
    desc
  }
}`

const addBookmarkMutation = gql`
  mutation addBookmark($title: String!, $url: String!, $desc: String!) {
    addBookmark(title: $title, url: $url, desc: $desc) {
      url
    }
  }
`

const removeBookmarkMutation = gql`
  mutation removeBookmark($id: ID!){
    removeBookmark(id: $id) {
      id
    }
  }
`

const removeAllBookmarksMutation = gql`
  mutation removeAllBookmarks($id: ID){
    removeAllBookmarks(id: $id){
      id
    }
  }
`

const initialValues = {
  title: "",
  url: "",
  desc: "",
};

const validationSchema = Yup.object({
  title: Yup.string().required("Title is required"),

  url: Yup.string()
    .matches(
      /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
      "Enter Valid URL!"
    )
    .required("Website URl is required"),
  desc: Yup.string()
    .min(20, "Description must contain minimum of 20 characters")
    .required("Description is Required"),
});

export default function Home() {
  const {loading, data, error} = useQuery(BookmarkQuery);
  const [addBookmark] = useMutation(addBookmarkMutation);
  const [removeBookmark] = useMutation(removeBookmarkMutation);
  const [removeAll] = useMutation(removeAllBookmarksMutation);
  console.log("data", data);

  const addBookmarkSubmit = (values, actions) => {
    addBookmark({
      variables: {
        title: values.title,
        url: values.url,
        desc: values.desc
      },
      refetchQueries: [{ query: BookmarkQuery }],
    })

    actions.resetForm({
      values: {
        title: "",
        url: "",
        desc: "",
      },
    });
  }

  const removeBookmarkSubmit = (id) => {
    console.log(id);
    removeBookmark({
      variables: {
        id,
      },
      refetchQueries: [{ query: BookmarkQuery }],
    });
  };

  const removeAllBookmarks = () => {
    removeAll({
      variables: {},
      refetchQueries: [{ query: BookmarkQuery }],
    },
    )
  }


  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CircularProgress color="secondary" />
      </div>
    );
  }

  return (<div className = "main">
    <div className = "form">
      <Paper elevation = {3}>
      <h1 className = "heading1">Add BookMark</h1>
      <Formik
              initialValues={initialValues}
              onSubmit={addBookmarkSubmit}
              validationSchema={validationSchema}
            >
              <Form className = "form">
                <Field
                  as={TextField}
                  id="Title"
                  type="text"
                  label="Title"
                  variant="outlined"
                  name="title"
                  fullWidth
                  style={{ marginTop: "10px" }}
                />
                <ErrorMessage name="title" component={ErrorMsg} />

                <Field
                  as={TextField}
                  id="URL"
                  type="text"
                  name="url"
                  label="URL"
                  variant="outlined"
                  fullWidth
                  style={{ marginTop: "10px" }}
                />
                <ErrorMessage name="url" component={ErrorMsg} />

                <Field
                  as={TextField}
                  id="Description"
                  label="Description"
                  multiline
                  type="text"
                  rows={4}
                  fullWidth
                  variant="outlined"
                  name="desc"
                  style={{ marginTop: "10px" }}
                />
                <ErrorMessage name="desc" component={ErrorMsg} />

                <Button
                  variant="contained"
                  color="secondary"
                  fullWidth
                  type="submit"
                  style={{ marginTop: "10px" }}
                >
                  Add BookMark
                </Button>
              </Form>
            </Formik>
            </Paper>
    </div>

    <div className = "bookmarks">
      <div className = "bookmark-button">
      <h1 className= "heading2">Bookmarks</h1>
      <Button variant = "outlined" color= "primary" className= "removeButton"
      onClick = {removeAllBookmarks}
      >Remove all</Button>
      </div>
        {data?.bookmark.map((book) => {
          return (
            <Container maxWidth="sm" key={book.id}>
              <Typography
                className = "bookmark-container"
                component="div"
                style={{
                  backgroundColor: "#efefef",
                  maxWidth: "400px",
                  minWidth: "300px",
                  margin: "0 auto",
                  height: "180px",
                  marginTop: "10px",
                  borderRadius: "10px",
                  padding: "10px 15px",
                  overflow: "auto",
                }}
              >
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <div>
                    <h1>{book.title}</h1>
                    <p style={{ padding: "10px 0px" }}>{book.desc}</p>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<ForwardIcon />}
                      size="small"
                      href= {book.url}
                      target = "_blank"
                    >
                     Visit Site
                    </Button>
                  </div>
                  <div>
                    <IconButton
                      aria-label="delete"
                      onClick={() => removeBookmarkSubmit(book.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </div>
                </div>
              </Typography>
            </Container>
          );
        })}
      </div>

    </div>);
}
