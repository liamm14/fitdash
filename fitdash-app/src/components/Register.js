import React, { Component } from "react";
import PropTypes from 'prop-types';

import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import TextField from "@material-ui/core/TextField";
import { withStyles } from "@material-ui/core/styles";
import { connect } from 'react-redux';
import { compose } from 'redux';
import { reduxForm, Field } from 'redux-form';
import * as actions from '../actions';

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
    marginBottom: theme.spacing.unit,
    marginTop: theme.spacing.unit
  },
  menu: {
    width: 200
  },
  main: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-start",
    flex: '1 0 auto'
  },
  card: {
    minWidth: 300,
    marginTop: "6em"
  },
  avatar: {
    margin: "1em",
    display: "flex",
    justifyContent: "center"
  },
  icon: {
    backgroundColor: theme.palette.secondary.main
  },
  hint: {
    marginTop: "1em",
    display: "flex",
    justifyContent: "center",
    color: theme.palette.grey[500]
  },
  form: {
    padding: "0 1em 1em 1em",
    display: 'flex',
    flexDirection: 'column'
  },
  input: {
    marginTop: "1em"
  },
  actions: {
    padding: "0 1em 1em 1em"
  }
});

// Used to plug material ui text field into redux-form field
const renderTextField = ({
  input,
  label,
  value,
  className,
  ...custom
}) => (
    <TextField
      // hintText={label}
      // floatingLabelText={label}
      label={label}
      value="value"
      className={className}
      // errorText={touched && error}
      {...input}
      {...custom}
    />
  )

class Register extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: {
        username: "username1",
        email: "email1",
        password: "password1",
      }
    };
  }

  onSubmit = (formProps) => {
    this.props.register(formProps, () => {
      this.props.history.push('/membersarea');
    });
  }

  handleChange = (event) => {
    const { id, value } = event.target;
    const { user } = this.state;
    this.setState({
      user: {
        ...user,
        [id]: value
      }
    });
  }

  render() {
    const { classes, handleSubmit } = this.props;
    const { user } = this.state;
    return (
      <div className={classes.main}>
        <Card className={classes.card}>
          <form className={classes.form} onSubmit={handleSubmit(this.onSubmit)}>
            <div className={classes.hint}>Register</div>
            <Field
              name="username"
              type="text"
              label="username"
              id="username"
              value={user.username}
              component={renderTextField}
              className={classes.textField}
              required
            />
            <Field
              name="email"
              type="text"
              label="email"
              id="email"
              value={user.email}
              component={renderTextField}
              className={classes.textField}
              required
            />
            <Field
              name="password"
              type="text"
              label="password"
              id="password"
              value={user.password}
              component={renderTextField}
              className={classes.textField}
              required
            />
            <Field
              name="passwordConf"
              type="text"
              label="password confirmation"
              id="passwordConf"
              value={user.passwordConf}
              component={renderTextField}
              className={classes.textField}
              required
            />
            <div>
              {this.props.errorMessage}
            </div>
            <Button type="submit" variant="contained" color="secondary" className={classes.button} style={{ margin: '10px' }}
            >
              Register
            </Button>
            <CardActions className={classes.actions} />
          </form>
        </Card>
      </div>
    );
  }
}

Register.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  register: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  handleSubmit: PropTypes.func.isRequired,
  errorMessage: PropTypes.string.isRequired,
}

function mapStateToProps(state) {
  return { errorMessage: state.auth.errorMessage }
}

export default compose(
  connect(mapStateToProps, actions),
  reduxForm({ form: 'register' }),
  withStyles(styles)
)(Register);