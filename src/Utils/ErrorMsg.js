import React from 'react'
import { Typography } from "@material-ui/core";


const ErrorMsg = (props) => {
    return (
        <div>
        <Typography
          variant="subtitle2"
          style={{ color: "red", marginTop: "3px" }}
        >
          {props.children}
        </Typography>
      </div>
    )
}

export default ErrorMsg
